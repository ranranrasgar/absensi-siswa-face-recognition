import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'student'
          student_id?: string
          face_descriptor?: number[]
          enrolled_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'student'
          student_id?: string
          face_descriptor?: number[]
          enrolled_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'student'
          student_id?: string
          face_descriptor?: number[]
          enrolled_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          student_name: string
          timestamp: string
          latitude: number
          longitude: number
          status: 'present' | 'late' | 'absent'
          method: 'face' | 'manual'
          distance?: number
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          timestamp: string
          latitude: number
          longitude: number
          status: 'present' | 'late' | 'absent'
          method: 'face' | 'manual'
          distance?: number
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          timestamp?: string
          latitude?: number
          longitude?: number
          status?: 'present' | 'late' | 'absent'
          method?: 'face' | 'manual'
          distance?: number
          notes?: string
          created_at?: string
        }
      }
      school_locations: {
        Row: {
          id: string
          name: string
          latitude: number
          longitude: number
          radius: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          latitude: number
          longitude: number
          radius: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          latitude?: number
          longitude?: number
          radius?: number
          created_at?: string
        }
      }
    }
  }
} 