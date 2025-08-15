"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboard } from "@/components/UserDashboard"
import { AuthProvider } from "@/components/AuthProvider"

function StudentDashboardContent() {
  return (
    <AuthGuard requiredRole="student">
      <UserDashboard />
    </AuthGuard>
  )
}

export default function StudentPage() {
  return (
    <AuthProvider>
      <StudentDashboardContent />
    </AuthProvider>
  )
}
