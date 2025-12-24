import { createClient } from '@supabase/supabase-js'

const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_KEY

if (!clientUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment; set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL')
}

// Client for browser usage (uses anon key)
export const supabase = createClient(clientUrl, anonKey || '')

// Admin/server client (use service role key). Keep this on the server only.
export function createSupabaseAdmin() {
  if (!serviceKey) throw new Error('Missing SUPABASE_KEY in environment')
  return createClient(clientUrl, serviceKey)
}

export default supabase
