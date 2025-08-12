import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error getting user profile:', profileError)
            setLoading(false)
            return
          }

          setUser(profile)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Get user profile from users table
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Error getting user profile:', profileError)
              setUser(null)
              return
            }

            setUser(profile)
          } catch (error) {
            console.error('Error getting user profile on sign in:', error)
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local user state
      setUser({ ...user, ...updates })
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  }
} 