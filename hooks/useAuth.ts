import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            // If user doesn't exist in users table, create a basic profile
            if (profileError.code === 'PGRST116') {
              console.log('User not found in users table, creating basic profile...')
              const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert([{
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  role: 'student', // Default role
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }])
                .select()
                .single()

              if (insertError) {
                console.error('Error creating user profile:', insertError)
                setLoading(false)
                return
              }

              setUser(newProfile)
            } else {
              console.error('Error getting user profile:', profileError)
              setLoading(false)
              return
            }
          } else {
            setUser(profile)
          }
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
              // If user doesn't exist in users table, create a basic profile
              if (profileError.code === 'PGRST116') {
                console.log('User not found in users table, creating basic profile...')
                const { data: newProfile, error: insertError } = await supabase
                  .from('users')
                  .insert([{
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    role: 'student', // Default role
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }])
                  .select()
                  .single()

                if (insertError) {
                  console.error('Error creating user profile:', insertError)
                  setUser(null)
                  return
                }

                setUser(newProfile)
              } else {
                console.error('Error getting user profile:', profileError)
                setUser(null)
                return
              }
            } else {
              setUser(profile)
            }
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
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single()

        if (profileError) {
          // If user already exists, try to get existing profile
          if (profileError.code === '23505') { // Unique violation
            console.log('User profile already exists, getting existing profile...')
            const { data: existingProfile, error: getError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            if (getError) throw getError
            return { user: existingProfile, error: null }
          } else {
            throw profileError
          }
        }

        return { user: profile, error: null }
      }

      return { user: null, error: null }
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