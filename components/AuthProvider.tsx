'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<{ user: any; error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error: any }>
  isAuthenticated: boolean
  isAdmin: boolean
  isStudent: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
} 