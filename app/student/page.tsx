"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useAuthContext } from "@/components/AuthProvider"
import { LocationStatus } from "@/components/location-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Clock, LogOut, User, CheckCircle, XCircle, History, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import type { LocationValidationResult } from "@/lib/location"
import { AuthProvider } from "@/components/AuthProvider"

function StudentDashboardContent() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [locationResult, setLocationResult] = useState<LocationValidationResult | null>(null)

  useEffect(() => {
    if (!user?.id && !user?.student_id) return

    // Check today's attendance
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const today = new Date().toDateString()
    const todayRecord = attendance.find(
      (record: any) =>
        record.studentId === (user?.student_id || user?.id) && new Date(record.timestamp).toDateString() === today,
    )
    setTodayAttendance(todayRecord)

    // Get recent attendance (last 7 days)
    const recent = attendance
      .filter((record: any) => record.studentId === (user?.student_id || user?.id))
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7)
    setRecentAttendance(recent)
  }, [user?.id, user?.student_id])

  const handleLocationChange = (result: LocationValidationResult) => {
    setLocationResult(result)
  }

  const hasEnrolledFace = user?.face_descriptor && user?.enrolled_at

  // Added navigation buttons for attendance history
  const quickActions = [
    {
      title: "Attendance History",
      description: "View your complete attendance records",
      icon: History,
      color: "bg-purple-600",
      action: () => router.push("/student/history"),
    },
  ]

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Student Portal</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Face Recognition Check-in
                </CardTitle>
                <CardDescription>Use facial recognition to mark your attendance</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasEnrolledFace ? (
                  <>
                    <Button className="w-full mb-2" size="lg" onClick={() => router.push("/student/enroll")}>
                      Enroll Face First
                    </Button>
                    <p className="text-sm text-amber-600">Face enrollment required</p>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full mb-2"
                      size="lg"
                      onClick={() => router.push("/student/checkin")}
                      disabled={!!todayAttendance}
                    >
                      {todayAttendance ? "Already Checked In" : "Start Face Recognition"}
                    </Button>
                    <p className="text-sm text-gray-500">Make sure you're within 100m of the school</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Today's Status
                </CardTitle>
                <CardDescription>Your attendance status for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {todayAttendance ? (
                    <>
                      <Badge variant="default" className="mb-2 bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Present
                      </Badge>
                      <p className="text-sm text-gray-500">
                        Checked in at {new Date(todayAttendance.timestamp).toLocaleTimeString()}
                      </p>
                      {todayAttendance.distance && (
                        <p className="text-xs text-gray-400">Distance: {todayAttendance.distance}m</p>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="mb-2">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Checked In
                      </Badge>
                      <p className="text-sm text-gray-500">Please check in to mark your attendance</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div>
              <LocationStatus onLocationChange={handleLocationChange} showActions={false} />
            </div>
          </div>

          {/* Added quick actions section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`${action.color} p-2 rounded-lg`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your attendance history for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttendance.length > 0 ? (
                  <div className="space-y-3">
                    {recentAttendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(record.timestamp).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleTimeString()} •{" "}
                            {record.method === "face" ? "Face Recognition" : "Manual"}
                            {record.distance && ` • ${record.distance}m from school`}
                          </p>
                        </div>
                        <Badge variant={record.status === "present" ? "default" : "secondary"}>
                          {record.status === "present" ? "Present" : "Late"}
                        </Badge>
                      </div>
                    ))}
                    {/* Added view all button */}
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/student/history")}
                        className="bg-transparent"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Complete History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance records yet</p>
                    <p className="text-sm">Start checking in to see your history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

export default function StudentDashboard() {
  return (
    <AuthProvider>
      <StudentDashboardContent />
    </AuthProvider>
  )
}
