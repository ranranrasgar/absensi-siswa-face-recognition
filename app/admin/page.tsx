"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuthContext } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Calendar, BarChart3, LogOut, MapPin, UserPlus, Clock, TrendingUp } from "lucide-react"
import { getAllAttendance, getDailyAttendanceSummary, getWeeklyAttendanceSummary } from "@/lib/attendance"
import { AuthProvider } from "@/components/AuthProvider"

function AdminDashboardContent() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    enrolledStudents: 0,
    todayAttendance: 0,
    weeklyAverage: 0,
    totalRecords: 0,
    faceRecognitionUsage: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Mock data for now - replace with actual API calls
        setDashboardStats({
          totalStudents: 150,
          enrolledStudents: 120,
          todayAttendance: 85,
          weeklyAverage: 82,
          totalRecords: 1250,
          faceRecognitionUsage: 75,
        })

        const recent = [
          { id: 1, action: "Student enrolled", student: "John Doe", time: "2 hours ago" },
          { id: 2, action: "Attendance recorded", student: "Jane Smith", time: "3 hours ago" },
          { id: 3, action: "Location updated", student: "Admin", time: "5 hours ago" },
        ]
        setRecentActivity(recent)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }

    loadDashboardData()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const quickActions = [
    {
      title: "Student Management",
      description: "View and manage student accounts",
      icon: Users,
      color: "bg-blue-600",
      action: () => router.push("/admin/students"),
    },
    {
      title: "Attendance Reports",
      description: "View detailed attendance analytics",
      icon: BarChart3,
      color: "bg-green-600",
      action: () => router.push("/admin/reports"),
    },
    {
      title: "Location Settings",
      description: "Configure school location and radius",
      icon: MapPin,
      color: "bg-orange-600",
      action: () => router.push("/admin/location"),
    },
    {
      title: "Manual Check-in",
      description: "Add attendance records manually",
      icon: UserPlus,
      color: "bg-purple-600",
      action: () => router.push("/admin/manual-checkin"),
    },
  ]

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                <p className="text-xs text-gray-500">{dashboardStats.enrolledStudents} enrolled in face recognition</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.todayAttendance}%</div>
                <p className="text-xs text-gray-500">Current attendance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Weekly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.weeklyAverage}%</div>
                <p className="text-xs text-gray-500">Last 7 days average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Face Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.faceRecognitionUsage}%</div>
                <p className="text-xs text-gray-500">Usage rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Recognition</span>
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Services</span>
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Storage</span>
                  <Badge variant="default" className="bg-green-600">
                    Healthy
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Student Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Enrolled</span>
                  <Badge variant="default">{dashboardStats.enrolledStudents}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Enrollment</span>
                  <Badge variant="secondary">{dashboardStats.totalStudents - dashboardStats.enrolledStudents}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Today</span>
                  <Badge variant="outline">
                    {Math.round((dashboardStats.todayAttendance / 100) * dashboardStats.totalStudents)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Records</span>
                  <Badge variant="outline">{dashboardStats.totalRecords}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Week</span>
                  <Badge variant="outline">
                    {
                      recentActivity.filter((r) => {
                        const recordDate = new Date(r.timestamp)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return recordDate >= weekAgo
                      }).length
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Today</span>
                  <Badge variant="outline">
                    {
                      recentActivity.filter((r) => new Date(r.timestamp).toDateString() === new Date().toDateString())
                        .length
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest attendance check-ins and system activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleDateString()} at{" "}
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {record.method === "face" ? "Face Recognition" : "Manual"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => router.push("/admin/reports")} className="bg-transparent">
                      View All Records
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here once students start checking in</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  )
}
