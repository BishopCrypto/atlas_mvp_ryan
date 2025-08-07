import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Atlas Intelligence database
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'sailings' | 'sailingstaff' | 'vendors' | 'frontdesk'
  department: string
  created_at: string
  updated_at: string
}

export interface Container {
  id: number
  type: 'sailing' | 'crew' | 'vendor' | 'guest' | 'visitor'
  name: string
  count: number
  status: 'clear' | 'attention' | 'in-progress' | 'active' | 'scheduled'
  due_date: string
  flagged: number
  department: 'sailings' | 'sailingstaff' | 'vendors' | 'frontdesk'
  created_at: string
  updated_at: string
}

export interface ScreeningRecord {
  id: string
  container_id: number
  person_name: string
  person_id?: string
  screening_status: 'pending' | 'clear' | 'flagged' | 'requires_review'
  notes?: string
  screened_by: string
  screened_at: string
  created_at: string
}