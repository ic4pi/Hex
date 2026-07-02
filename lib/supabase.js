import { createClient } from '@supabase/supabase-js'

let _client = null

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    const err = new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project environment variables.'
    )
    err.code = 'NO_SUPABASE_CONFIG'
    throw err
  }

  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false },
    })
  }

  return _client
}
