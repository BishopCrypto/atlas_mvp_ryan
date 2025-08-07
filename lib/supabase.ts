import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Multi-tenant database types
export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  brand_colors: {
    primary: string
    secondary: string
    accent?: string
  }
  settings: Record<string, any>
  is_active: boolean
}

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name?: string
  role: 'sailings' | 'sailingstaff' | 'vendors' | 'frontdesk' | 'admin'
  department: string
  permissions: string[]
  is_active: boolean
}

export interface Container {
  id: number
  tenant_id: string
  type: 'sailing' | 'crew' | 'vendor' | 'guest' | 'visitor'
  name: string
  count: number
  status: 'clear' | 'attention' | 'in-progress' | 'active' | 'scheduled'
  due_date?: string
  flagged: number
  department: string
  metadata: Record<string, any>
}

export interface ScreeningRecord {
  id: string
  tenant_id: string
  container_id: number
  person_name: string
  person_id?: string
  screening_status: 'pending' | 'clear' | 'flagged' | 'requires_review'
  risk_score?: number
  notes?: string
  flags: any[]
  screened_by: string
  screened_at?: string
}