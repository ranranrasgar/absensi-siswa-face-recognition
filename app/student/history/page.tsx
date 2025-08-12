"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { AttendanceTable } from "@/components/attendance-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Award } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { getStudentAttendance, calculateStudentStats, type AttendanceStats } from "@/lib/attendance"
import { AuthProvider } from "@/components/AuthProvider"

function StudentHistoryContent() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      const loadAttendanceData = async () => {
        try {
          const studentAttendance = await getStudentAttendance(user.student_id || user.id)
          setAttendance(studentAttendance)

          const studentStats = await calculateStudentStats(user.student_id || user.id, 30)
          setStats(studentStats)
        } catch (error) {
          console.error("Error loading attendance data:", error)
        }
      }

      loadAttendanceData()
    }
  }, [user])

  const getAttendanceGrade = (rate: number) => {
    if (rate >= 95) return { grade: "A+", color: "bg-green-600", description: "Excellent" }
    if (rate >= 90) return { grade: "A", color: "bg-green-500", description: "Very Good" }
    if (rate >= 85) return { grade: "B+", color: "bg-blue-500", description: "Good" }
    if (rate >= 80) return { grade: "B", color: "bg-blue-400", description: "Satisfactory" }
    if (rate >= 75) return { grade: "C+", color: "bg-yellow-500", description: "Fair" }
    if (rate >= 70) return { grade: "C", color: "bg-yellow-400", description: "Needs Improvement" }
    return { grade: "D", color: "bg-red-500", description: "Poor" }
  }

  const attendanceGrade = stats ? getAttendanceGrade(stats.attendanceRate) : null

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
                <h1 className="text-lg font-semibold text-gray-900">Attendance History</h1>
                <p className="text-sm text-gray-500">View your attendance records and statistics</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Present Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
                  <p className="text-xs text-gray-500">Out of {stats.totalDays} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Late Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
                  <p className="text-xs text-gray-500">Late arrivals</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Absent Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
                  <p className="text-xs text-gray-500">Missed days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Grade */}
          {attendanceGrade && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Attendance Grade
                  </CardTitle>
                  <CardDescription>Your attendance performance evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`${attendanceGrade.color} text-white text-3xl font-bold px-4 py-2 rounded-lg`}>
                      {attendanceGrade.grade}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{attendanceGrade.description}</p>
                      <p className="text-sm text-gray-500">
                        Based on {stats?.attendanceRate}% attendance rate over the last 30 days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Records */}
          <AttendanceTable
            records={attendance}
            title="Your Attendance Records"
            description="Complete history of your check-ins and attendance"
            showFilters={false}
          />

          {attendance.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h3>
                <p className="text-gray-500 mb-4">
                  You haven't checked in yet. Start using face recognition to build your attendance history.
                </p>
                <Button onClick={() => router.push("/student/checkin")}>Check In Now</Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}

export default function StudentHistoryPage() {
  return (
    <AuthProvider>
      <StudentHistoryContent />
    </AuthProvider>
  )
}
