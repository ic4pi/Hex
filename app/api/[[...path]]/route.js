import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { seedCategories, seedProducts, seedHero, seedBranding } from '@/lib/seed-data'

let client, db, lastConnectError = null
async function connectToMongo() {
  if (!process.env.MONGO_URL) {
    const err = new Error('MONGO_URL is not configured. Set it in your Vercel project environment variables.')
    err.code = 'NO_MONGO_URL'
    throw err
  }
  if (!client) {
    try {
      client = new MongoClient(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      })
      await client.connect()
      db = client.db(process.env.DB_NAME || 'hexpose')
      // Verify actual reachability (not just successful URL parse)
      await db.command({ ping: 1 })
      lastConnectError = null
    } catch (e) {
      lastConnectError = { name: e?.name, message: String(e?.message || e), code: e?.code }
      // Reset so the next request retries a fresh connection instead of caching a broken client
      try { await client?.close?.() } catch {}
      client = null
      db = null
      throw e
    }
  }
  return db
}

function isDbUnavailable(error) {
  if (!error) return false
  if (error.code === 'NO_MONGO_URL') return true
  const name = error.name || ''
  const msg = String(error.message || '')
  return (
    /Mongo(Network|ServerSelection|Server|Parse|Client|Timeout)?Error/i.test(name) ||
    /ECONNREFUSED|EAI_AGAIN|ETIMEDOUT|ENOTFOUND|failed to connect|querySrv|Authentication failed|Server selection|bad auth|not authorized/i.test(msg)
  )
}

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

const clean = (doc) => { if (!doc) return doc; const { _id, ...rest } = doc; return rest }
const cleanMany = (arr) => arr.map(clean)

async function ensureSeeded(db) {
  const seeded = await db.collection('settings').findOne({ id: 'seed_marker' })
  if (seeded) return
  const cats = seedCategories()
  await db.collection('categories').insertMany(cats)
  await db.collection('products').insertMany(seedProducts())
  await db.collection('hero_sections').insertOne(seedHero())
  await db.collection('branding_settings').insertOne(seedBranding())
  await db.collection('settings').insertOne({ id: 'seed_marker', seeded_at: new Date() })
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

  try {
    const db = await connectToMongo()
    await ensureSeeded(db)

    if (route === '/root' && method === 'GET') return cors(NextResponse.json({ message: 'Hexpose API', ok: true }))

    // Diagnostic endpoint - reports DB health, safe to expose (no secrets)
    if (route === '/health' && method === 'GET') {
      const hasUrl = !!process.env.MONGO_URL
      const scheme = hasUrl ? (process.env.MONGO_URL.startsWith('mongodb+srv://') ? 'srv' : 'standard') : 'none'
      try {
        const _db = await connectToMongo()
        await _db.command({ ping: 1 })
        const productCount = await _db.collection('products').countDocuments({})
        return cors(NextResponse.json({
          ok: true,
          mongo_url_configured: hasUrl,
          mongo_url_scheme: scheme,
          db_name: process.env.DB_NAME || 'hexpose',
          db_reachable: true,
          product_count: productCount,
          admin_password_set: !!process.env.ADMIN_PASSWORD,
        }))
      } catch (e) {
        return cors(NextResponse.json({
          ok: false,
          mongo_url_configured: hasUrl,
          mongo_url_scheme: scheme,
          db_name: process.env.DB_NAME || 'hexpose',
          db_reachable: false,
          error_name: e?.name || 'Error',
          error_message: String(e?.message || e).slice(0, 400),
          admin_password_set: !!process.env.ADMIN_PASSWORD,
          hint: /Authentication failed|bad auth/i.test(String(e?.message || '')) ? 'Bad username or password in MONGO_URL' :
                /ETIMEDOUT|ENOTFOUND|Server selection|querySrv/i.test(String(e?.message || '')) ? 'Cannot reach cluster. Check Atlas Network Access allows 0.0.0.0/0 and connection string host is correct.' :
                /not authorized/i.test(String(e?.message || '')) ? 'DB user lacks permissions. Grant Atlas admin or readWrite on your database.' :
                'Unknown DB error. See error_message.',
        }))
      }
    }

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

    // ============ PRODUCTS ============
    if (route === '/products' && method === 'GET') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const featured = url.searchParams.get('featured')
      const q = url.searchParams.get('q')
      const includeInactive = url.searchParams.get('all') === '1' && isAdmin(request)
      const filter = {}
      if (!includeInactive) filter.active = true
      if (category && category !== 'all') filter.category = category
      if (featured === '1') filter.featured = true
      if (q) filter.name = { $regex: q, $options: 'i' }
      const list = await db.collection('products').find(filter).sort({ created_at: -1 }).toArray()
      return cors(NextResponse.json(cleanMany(list)))
    }

    if (route === '/products' && method === 'POST') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const now = new Date()
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
        created_at: now, updated_at: now,
      }
      await db.collection('products').insertOne(doc)
      return cors(NextResponse.json(clean(doc)))
    }

    // /products/slug/:slug
    if (path[0] === 'products' && path[1] === 'slug' && path[2] && method === 'GET') {
      const p = await db.collection('products').findOne({ slug: path[2] })
      if (!p) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
      return cors(NextResponse.json(clean(p)))
    }

    // /products/:id
    if (path[0] === 'products' && path[1] && !['slug'].includes(path[1])) {
      const id = path[1]
      if (method === 'GET') {
        const p = await db.collection('products').findOne({ id })
        if (!p) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
        return cors(NextResponse.json(clean(p)))
      }
      if (method === 'PUT') {
        const auth = requireAdmin(); if (auth) return auth
        const body = await request.json()
        const update = { ...body, updated_at: new Date() }
        delete update._id; delete update.id
        await db.collection('products').updateOne({ id }, { $set: update })
        const p = await db.collection('products').findOne({ id })
        return cors(NextResponse.json(clean(p)))
      }
      if (method === 'DELETE') {
        const auth = requireAdmin(); if (auth) return auth
        await db.collection('products').deleteOne({ id })
        return cors(NextResponse.json({ ok: true }))
      }
    }

    // ============ CATEGORIES ============
    if (route === '/categories' && method === 'GET') {
      const list = await db.collection('categories').find({}).toArray()
      return cors(NextResponse.json(cleanMany(list)))
    }
    if (route === '/categories' && method === 'POST') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const doc = { id: uuidv4(), name: body.name, slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: body.description || '', created_at: new Date() }
      await db.collection('categories').insertOne(doc)
      return cors(NextResponse.json(clean(doc)))
    }
    if (path[0] === 'categories' && path[1] && method === 'DELETE') {
      const auth = requireAdmin(); if (auth) return auth
      await db.collection('categories').deleteOne({ id: path[1] })
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ HERO ============
    if (route === '/hero' && method === 'GET') {
      const h = await db.collection('hero_sections').findOne({})
      return cors(NextResponse.json(clean(h)))
    }
    if (route === '/hero' && method === 'PUT') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const existing = await db.collection('hero_sections').findOne({})
      const update = { ...body, updated_at: new Date() }
      delete update._id
      if (existing) {
        await db.collection('hero_sections').updateOne({ id: existing.id }, { $set: update })
      } else {
        await db.collection('hero_sections').insertOne({ id: uuidv4(), ...update })
      }
      const h = await db.collection('hero_sections').findOne({})
      return cors(NextResponse.json(clean(h)))
    }

    // ============ BRANDING ============
    if (route === '/branding' && method === 'GET') {
      const b = await db.collection('branding_settings').findOne({})
      return cors(NextResponse.json(clean(b)))
    }
    if (route === '/branding' && method === 'PUT') {
      const auth = requireAdmin(); if (auth) return auth
      const body = await request.json()
      const update = { ...body, updated_at: new Date() }
      delete update._id
      const existing = await db.collection('branding_settings').findOne({})
      if (existing) {
        await db.collection('branding_settings').updateOne({}, { $set: update })
      } else {
        await db.collection('branding_settings').insertOne({ id: 'default', ...update })
      }
      const b = await db.collection('branding_settings').findOne({})
      return cors(NextResponse.json(clean(b)))
    }

    // ============ NEWSLETTER ============
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body.email) return cors(NextResponse.json({ error: 'email required' }, { status: 400 }))
      await db.collection('newsletter').insertOne({ id: uuidv4(), email: body.email, created_at: new Date() })
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ CONTACT ============
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      if (!body.email || !body.message) return cors(NextResponse.json({ error: 'email and message required' }, { status: 400 }))
      await db.collection('contact_messages').insertOne({ id: uuidv4(), name: body.name || '', email: body.email, subject: body.subject || '', message: body.message, created_at: new Date() })
      return cors(NextResponse.json({ ok: true }))
    }

    // ============ OVERVIEW STATS ============
    if (route === '/admin/overview' && method === 'GET') {
      const auth = requireAdmin(); if (auth) return auth
      const [products, categories, newsletter, contact] = await Promise.all([
        db.collection('products').countDocuments({}),
        db.collection('categories').countDocuments({}),
        db.collection('newsletter').countDocuments({}),
        db.collection('contact_messages').countDocuments({}),
      ])
      const active = await db.collection('products').countDocuments({ active: true })
      return cors(NextResponse.json({ products, active_products: active, categories, newsletter, contact }))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error?.name, error?.message)
    if (isDbUnavailable(error)) {
      const safe = (route === '/products' || route === '/categories') ? [] : {}
      return cors(NextResponse.json(safe, { status: 200, headers: { 'x-hexpose-db': 'unavailable', 'x-hexpose-db-error': String(error?.name || 'unknown') } }))
    }
    return cors(NextResponse.json({ error: 'Internal server error', detail: String(error?.message || error) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
