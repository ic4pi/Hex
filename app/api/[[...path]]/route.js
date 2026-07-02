import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { seedCategories, seedProducts, seedHero, seedBranding } from '@/lib/seed-data'

function isDbUnavailable(error) {
  if (!error) return false
  if (error.code === 'NO_SUPABASE_CONFIG') return true
  const msg = String(error.message || '')
  return /fetch failed|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|network|Failed to fetch/i.test(msg)
}

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

function sbCheck({ data, error }) {
  if (error) throw error
  return data
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('STRIPE_SECRET_KEY is not configured.')
    err.code = 'NO_STRIPE_KEY'
    throw err
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

async function ensureSeeded(supabase) {
  const { data: seeded } = await supabase.from('settings').select('id').eq('id', 'seed_marker').maybeSingle()
  if (seeded) return

  await supabase.from('categories').insert(seedCategories())
  await supabase.from('products').insert(seedProducts())
  await supabase.from('hero_sections').insert(seedHero())
  await supabase.from('branding_settings').insert(seedBranding())
  await supabase.from('settings').insert({ id: 'seed_marker', seeded_at: new Date().toISOString() })
}

function isAdmin(request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/hexpose_admin=([^;]+)/)
  return !!(m && decodeURIComponent(m[1]) === process.env.ADMIN_PASSWORD)
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  // Routes that work without a DB connection
  if (route === '/root' && method === 'GET') return cors(NextResponse.json({ message: 'Hexpose API', ok: true }))

  if (route === '/health' && method === 'GET') {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!hasUrl || !hasKey) {
      return cors(NextResponse.json({
        ok: false,
        supabase_url_configured: hasUrl,
        supabase_key_configured: hasKey,
        hint: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project environment variables.',
        admin_password_set: !!process.env.ADMIN_PASSWORD,
      }))
    }
    try {
      const supabase = getSupabaseAdmin()
      const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true })
      if (error) throw error
      return cors(NextResponse.json({
        ok: true,
        supabase_url_configured: true,
        db_reachable: true,
        product_count: count ?? 0,
        stripe_configured: !!process.env.STRIPE_SECRET_KEY,
        admin_password_set: !!process.env.ADMIN_PASSWORD,
      }))
    } catch (e) {
      return cors(NextResponse.json({
        ok: false,
        supabase_url_configured: true,
        db_reachable: false,
        error_name: e?.name || 'Error',
        error_message: String(e?.message || e).slice(0, 500),
        admin_password_set: !!process.env.ADMIN_PASSWORD,
        hint: 'Check your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values.',
      }))
    }
  }

  // ============ STRIPE WEBHOOK ============
  // Must be handled before any body parsing — Stripe requires the raw request body for signature verification
  if (route === '/stripe/webhook' && method === 'POST') {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    const stripe = getStripe()
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')
    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Stripe webhook signature error:', err.message)
      return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      try {
        const supabase = getSupabaseAdmin()
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        const items = lineItems.data.map(item => ({
          name: item.description,
          qty: item.quantity,
          unit_price: (item.amount_subtotal / item.quantity) / 100,
          total: item.amount_total / 100,
        }))
        await supabase.from('orders').insert({
          id: uuidv4(),
          stripe_session: session.id,
          customer_email: session.customer_details?.email || '',
          customer_name: session.customer_details?.name || '',
          items,
          subtotal: (session.amount_subtotal ?? 0) / 100,
          total: (session.amount_total ?? 0) / 100,
          status: 'paid',
          created_at: new Date().toISOString(),
        })

        // Decrement inventory for each product
        if (session.metadata?.cart_items) {
          const cartItems = JSON.parse(session.metadata.cart_items)
          for (const ci of cartItems) {
            const { data: product } = await supabase.from('products').select('inventory').eq('id', ci.id).maybeSingle()
            if (product) {
              await supabase.from('products').update({
                inventory: Math.max(0, product.inventory - ci.qty),
              }).eq('id', ci.id)
            }
          }
        }
      } catch (e) {
        console.error('Error saving Stripe order:', e?.message)
        // Return 200 so Stripe doesn't retry — log the error for manual review
      }
    }

    return NextResponse.json({ received: true })
  }

  try {
    const supabase = getSupabaseAdmin()
    await ensureSeeded(supabase)

    // ============ ADMIN AUTH ============
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      if (!body.password) return cors(NextResponse.json({ error: 'password required' }, { status: 400 }))
      if (body.password !== process.env.ADMIN_PASSWORD) return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }))
      const res = NextResponse.json({ ok: true })
      res.cookies.set('hexpose_admin', process.env.ADMIN_PASSWORD, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
      return cors(res)
    }
    if (route === '/admin/logout' && method === 'POST') {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('hexpose_admin', '', { httpOnly: true, path: '/', maxAge: 0 })
      return cors(res)
    }
    if (route === '/admin/verify' && method === 'GET') {
      return cors(NextResponse.json({ authed: isAdmin(request) }))
    }

    const requireAdmin = () => {
      if (!isAdmin(request)) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      return null
    }

    // ============ STRIPE CHECKOUT SESSION ============
    if (route === '/stripe/checkout' && method === 'POST') {
      if (!process.env.STRIPE_SECRET_KEY) {
        return cors(NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 503 }))
      }
      const stripe = getStripe()
      const body = await request.json()
      const cartItems = body.items // [{ id, qty }]
      if (!cartItems?.length) return cors(NextResponse.json({ error: 'Cart is empty' }, { status: 400 }))

      // Look up verified prices from DB — never trust client-sent prices
      const productIds = cartItems.map(i => i.id)
      const { data: products, error: pErr } = await supabase.from('products').select('id, name, description, price, hero_image, active').in('id', productIds)
      if (pErr) throw pErr

      const productMap = Object.fromEntries((products || []).map(p => [p.id, p]))
      const lineItems = []
      for (const ci of cartItems) {
        const p = productMap[ci.id]
        if (!p || !p.active) continue
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: p.name,
              description: p.description || undefined,
              images: p.hero_image ? [p.hero_image] : [],
            },
            unit_amount: Math.round(p.price * 100),
          },
          quantity: ci.qty,
        })
      }

      if (!lineItems.length) return cors(NextResponse.json({ error: 'No valid items in cart' }, { status: 400 }))

      const origin = new URL(request.url).origin
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        metadata: {
          cart_items: JSON.stringify(cartItems.slice(0, 10)), // Stripe metadata limit: 500 chars/value
        },
        billing_address_collection: 'auto',
        shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      })

      return cors(NextResponse.json({ url: session.url }))
    }

    // ============ ADMIN ORDERS ============
    if (route === '/admin/orders' && method === 'GET') {
      const auth = requireAdmin(); if (auth) return auth
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return cors(NextResponse.json(data || []))
    }

    // ============ PRODUCTS ============
    if (route === '/products' && method === 'GET') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const featured = url.searchParams.get('featured')
      const q = url.searchParams.get('q')
      const includeInactive = url.searchParams.get('all') === '1' && isAdmin(request)

      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      if (!includeInactive) query = query.eq('active', true)
      if (category && category !== 'all') query = query.eq('category', category)
      if (featured === '1') query = query.eq('featured', true)
      if (q) query = query.ilike('name', `%${q}%`)

      const list = sbCheck(await query)
      return cors(NextResponse.json(list || []))
    }

    if (route === '/products' && method === 'POST') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const now = new Date().toISOString()
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled Product',
        slug: body.slug || (body.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: body.category || 'spell-jars',
        description: body.description || '',
        rich_description: body.rich_description || '',
        price: Number(body.price) || 0,
        compare_at_price: Number(body.compare_at_price) || 0,
        sku: body.sku || '',
        inventory: Number(body.inventory) || 0,
        hero_image: body.hero_image || '',
        gallery_images: body.gallery_images || [],
        featured: !!body.featured,
        bestseller: !!body.bestseller,
        new_arrival: !!body.new_arrival,
        limited_edition: !!body.limited_edition,
        active: body.active !== false,
        seo_title: body.seo_title || '',
        seo_description: body.seo_description || '',
        spell: body.spell || null,
        created_at: now,
        updated_at: now,
      }
      const inserted = sbCheck(await supabase.from('products').insert(doc).select().single())
      return cors(NextResponse.json(inserted))
    }

    // /products/slug/:slug
    if (path[0] === 'products' && path[1] === 'slug' && path[2] && method === 'GET') {
      const p = sbCheck(await supabase.from('products').select('*').eq('slug', path[2]).maybeSingle())
      if (!p) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
      return cors(NextResponse.json(p))
    }

    // /products/:id
    if (path[0] === 'products' && path[1] && !['slug'].includes(path[1])) {
      const id = path[1]
      if (method === 'GET') {
        const p = sbCheck(await supabase.from('products').select('*').eq('id', id).maybeSingle())
        if (!p) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
        return cors(NextResponse.json(p))
      }
      if (method === 'PUT') {
        const auth = requireAdmin(); if (auth) return auth
        const body = await request.json()
        const { id: _id, ...rest } = body
        const update = { ...rest, updated_at: new Date().toISOString() }
        const p = sbCheck(await supabase.from('products').update(update).eq('id', id).select().single())
        return cors(NextResponse.json(p))
      }
      if (method === 'DELETE') {
        const auth = requireAdmin(); if (auth) return auth
        sbCheck(await supabase.from('products').delete().eq('id', id))
        return cors(NextResponse.json({ ok: true }))
      }
    }

    // ============ CATEGORIES ============
    if (route === '/categories' && method === 'GET') {
      const list = sbCheck(await supabase.from('categories').select('*').order('name'))
      return cors(NextResponse.json(list || []))
    }
    if (route === '/categories' && method === 'POST') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const doc = {
        id: uuidv4(),
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description || '',
        created_at: new Date().toISOString(),
      }
      const inserted = sbCheck(await supabase.from('categories').insert(doc).select().single())
      return cors(NextResponse.json(inserted))
    }
    if (path[0] === 'categories' && path[1] && method === 'DELETE') {
      const auth = requireAdmin(); if (auth) return auth
      sbCheck(await supabase.from('categories').delete().eq('id', path[1]))
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ HERO ============
    if (route === '/hero' && method === 'GET') {
      const h = sbCheck(await supabase.from('hero_sections').select('*').maybeSingle())
      return cors(NextResponse.json(h))
    }
    if (route === '/hero' && method === 'PUT') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const update = { ...body, updated_at: new Date().toISOString() }
      const existing = sbCheck(await supabase.from('hero_sections').select('id').maybeSingle())
      let h
      if (existing) {
        h = sbCheck(await supabase.from('hero_sections').update(update).eq('id', existing.id).select().single())
      } else {
        h = sbCheck(await supabase.from('hero_sections').insert({ id: uuidv4(), ...update }).select().single())
      }
      return cors(NextResponse.json(h))
    }

    // ============ BRANDING ============
    if (route === '/branding' && method === 'GET') {
      const b = sbCheck(await supabase.from('branding_settings').select('*').maybeSingle())
      return cors(NextResponse.json(b))
    }
    if (route === '/branding' && method === 'PUT') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const update = { ...body, updated_at: new Date().toISOString() }
      const existing = sbCheck(await supabase.from('branding_settings').select('id').maybeSingle())
      let b
      if (existing) {
        b = sbCheck(await supabase.from('branding_settings').update(update).eq('id', existing.id).select().single())
      } else {
        b = sbCheck(await supabase.from('branding_settings').insert({ id: 'default', ...update }).select().single())
      }
      return cors(NextResponse.json(b))
    }

    // ============ NEWSLETTER ============
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body.email) return cors(NextResponse.json({ error: 'email required' }, { status: 400 }))
      sbCheck(await supabase.from('newsletter').insert({ id: uuidv4(), email: body.email, created_at: new Date().toISOString() }))
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ CONTACT ============
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      if (!body.email || !body.message) return cors(NextResponse.json({ error: 'email and message required' }, { status: 400 }))
      sbCheck(await supabase.from('contact_messages').insert({
        id: uuidv4(), name: body.name || '', email: body.email,
        subject: body.subject || '', message: body.message,
        created_at: new Date().toISOString(),
      }))
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ OVERVIEW STATS ============
    if (route === '/admin/overview' && method === 'GET') {
      const auth = requireAdmin(); if (auth) return auth
      const [
        { count: products },
        { count: activeProducts },
        { count: categories },
        { count: newsletter },
        { count: contact },
        { count: orders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ])
      return cors(NextResponse.json({
        products: products ?? 0,
        active_products: activeProducts ?? 0,
        categories: categories ?? 0,
        newsletter: newsletter ?? 0,
        contact: contact ?? 0,
        orders: orders ?? 0,
      }))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error?.name, error?.message)
    if (isDbUnavailable(error)) {
      const safe = (route === '/products' || route === '/categories') ? [] : {}
      return cors(NextResponse.json(safe, {
        status: 200,
        headers: { 'x-hexpose-db': 'unavailable', 'x-hexpose-db-error': String(error?.name || 'unknown') },
      }))
    }
    return cors(NextResponse.json({ error: 'Internal server error', detail: String(error?.message || error) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
