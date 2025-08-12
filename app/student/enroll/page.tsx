"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { FaceRecognition } from "@/components/face-recognition"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default function FaceEnrollmentPage() {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const router = useRouter()
  const user = getCurrentUser()

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true)
    setTimeout(() => {
      router.push("/student")
    }, 2000)
  }

  const handleEnrollmentError = (error: string) => {
    console.error("Enrollment error:", error)
  }

  if (isEnrolled) {
    return (
      <AuthGuard requiredRole="student">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Complete!</h1>
            <p className="text-gray-600 mb-4">Your face has been successfully registered.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" onClick={() => router.push("/student")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Face Enrollment</h1>
                <p className="text-sm text-gray-500">Register your face for attendance</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Hello, {user?.name}</h2>
            <p className="text-gray-600">
              To use face recognition for attendance, you need to enroll your face first. This is a one-time setup
              process.
            </p>
          </div>

          <FaceRecognition mode="enroll" onSuccess={handleEnrollmentSuccess} onError={handleEnrollmentError} />
        </main>
      </div>
    </AuthGuard>
  )
}
