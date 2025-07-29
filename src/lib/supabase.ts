import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Match {
  id: number
  name: string
  result: string
  created_at: string
}

export interface PlayerStats {
  name: string
  total_matches: number
  wins: number
  win_rate: number
  total_points: number
} 