'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from './AuthProvider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'student'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading, isAdmin, isStudent } = useAuthContext()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setAuthorized(false)
        return
      }

      if (requiredRole === 'admin' && !isAdmin) {
        setAuthorized(false)
        return
      }

      if (requiredRole === 'student' && !isStudent) {
        setAuthorized(false)
        return
      }

      setAuthorized(true)
    }
  }, [user, loading, isAdmin, isStudent, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
            {requiredRole && ` Required role: ${requiredRole}`}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
