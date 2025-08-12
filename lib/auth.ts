import { supabase } from './supabase'
import type { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  status: "present" | "late"
  method: "face" | "manual"
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null
    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Sign up new user
export const signUp = async (email: string, password: string, userData: Omit<UserInsert, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (user) {
      // Insert user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])

      if (profileError) throw profileError
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// Sign in user
export const signIn = async (email: string, password: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// Sign out user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Logout (redirect to home)
export const logout = async () => {
  await signOut()
  window.location.href = "/"
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}

// Check if user is student
export const isStudent = (user: User | null): boolean => {
  return user?.role === "student"
}

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

// Update user profile
export const updateUserProfile = async (id: string, updates: UserUpdate): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

// Delete user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Initialize demo data (for development)
export const initializeDemoData = async () => {
  try {
    // Check if demo data already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (existingUsers && existingUsers.length > 0) return

    // Insert demo users
    const demoUsers: Omit<UserInsert, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        email: "admin@school.com",
        name: "School Administrator",
        role: "admin",
      },
      {
        email: "student@school.com",
        name: "John Doe",
        role: "student",
        student_id: "STU001",
      },
    ]

    for (const userData of demoUsers) {
      await signUp('demo@example.com', 'password123', userData)
    }

    // Insert school location
    const { error: locationError } = await supabase
      .from('school_locations')
      .insert([{
        name: "Main Campus",
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 100,
        created_at: new Date().toISOString(),
      }])

    if (locationError) console.error('Error inserting school location:', locationError)
  } catch (error) {
    console.error('Error initializing demo data:', error)
  }
}
