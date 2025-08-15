"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { FaceRecognition } from "@/components/face-recognition"
import { LocationStatus } from "@/components/location-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { AuthProvider } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { addAttendanceRecord } from "@/lib/attendance"
import { getUserLocation } from "@/lib/location"
import type { LocationValidationResult } from "@/lib/location"

function CheckInContent() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [locationResult, setLocationResult] = useState<LocationValidationResult | null>(null)
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()

  const handleLocationChange = (result: LocationValidationResult) => {
    setLocationResult(result)
  }

  const handleCheckInSuccess = async () => {
    if (!locationResult?.isValid) {
      toast({
        title: "Location validation failed",
        description: "You must be within school premises to check in",
        variant: "destructive",
      })
      return
    }

    try {
      // Get user's current location
      const userLocation = await getUserLocation()
      
      // Save attendance record to Supabase
      const success = await addAttendanceRecord({
        student_id: user?.id || "",
        student_name: user?.name || "",
        timestamp: new Date().toISOString(),
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        status: "present",
        method: "face",
        distance: locationResult.distance,
      })

      if (success) {
        setIsCheckedIn(true)
        toast({
          title: "Check-in successful",
          description: "Your attendance has been recorded",
        })

        setTimeout(() => {
          router.push("/student")
        }, 3000)
      } else {
        toast({
          title: "Check-in failed",
          description: "Failed to save attendance record",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Check-in error:", error)
      toast({
        title: "Check-in failed",
        description: "An error occurred while recording attendance",
        variant: "destructive",
      })
    }
  }

  const handleCheckInError = (error: string) => {
    console.error("Check-in error:", error)
  }

  // Check if user has enrolled face
  const hasEnrolledFace = user?.face_descriptor && user?.enrolled_at

  if (isCheckedIn) {
    return (
      <AuthGuard requiredRole="student">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-in Complete!</h1>
            <p className="text-gray-600 mb-4">Your attendance has been recorded successfully.</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Time: {new Date().toLocaleTimeString()}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Method: Face Recognition</p>
              {locationResult && <p>Distance: {locationResult.distance}m from school</p>}
            </div>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!hasEnrolledFace) {
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
                  <h1 className="text-lg font-semibold text-gray-900">Face Recognition Check-in</h1>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Face Enrollment Required</CardTitle>
                <CardDescription>You need to enroll your face before using face recognition check-in</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  To use face recognition for attendance, you must first register your face. This is a one-time setup
                  process that takes just a few minutes.
                </p>
                <Button onClick={() => router.push("/student/enroll")}>Enroll Face Now</Button>
              </CardContent>
            </Card>
          </main>
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
                <h1 className="text-lg font-semibold text-gray-900">Face Recognition Check-in</h1>
                <p className="text-sm text-gray-500">Mark your attendance using face recognition</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome, {user?.name}</h2>
            <p className="text-gray-600">
              Position your face in the camera view to mark your attendance. Make sure you're within school premises.
            </p>
          </div>

          <div className="mb-6">
            <LocationStatus onLocationChange={handleLocationChange} autoRefresh={true} />
          </div>

          {locationResult && !locationResult.isValid && !locationResult.error && (
            <div className="mb-6">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Location Validation Required</p>
                      <p className="text-sm">
                        You are {locationResult.distance}m away from school. You must be within 100m to check in.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <FaceRecognition mode="recognize" onSuccess={handleCheckInSuccess} onError={handleCheckInError} />

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Check-in Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Face enrolled and recognized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {locationResult?.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                    <span>Within 100m of school premises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Location permissions enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

export default function CheckInPage() {
  return (
    <AuthProvider>
      <CheckInContent />
    </AuthProvider>
  )
}
