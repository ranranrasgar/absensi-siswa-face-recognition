'use client'

import { AuthProvider, useAuthContext } from '@/components/AuthProvider'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { UserDashboard } from '@/components/UserDashboard'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading, isAdmin } = useAuthContext()

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    )
  }

  // Show different dashboard based on user role
  if (isAdmin) {
    return <Dashboard />
  } else {
    return <UserDashboard />
  }
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
