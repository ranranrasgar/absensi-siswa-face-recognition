'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from './AuthProvider'
import { getAllAttendance, getDailyAttendanceSummary, getWeeklyAttendanceSummary } from '@/lib/attendance'
import { getAllUsers } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Calendar, Clock, MapPin, LogOut, User } from 'lucide-react'
import type { AttendanceRecord, DailyAttendanceSummary } from '@/lib/attendance'
import type { User as UserType } from '@/lib/auth'

export function Dashboard() {
  const { user, signOut, isAdmin } = useAuthContext()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [dailySummary, setDailySummary] = useState<DailyAttendanceSummary | null>(null)
  const [weeklySummary, setWeeklySummary] = useState<DailyAttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [attendanceData, usersData, dailyData, weeklyData] = await Promise.all([
          getAllAttendance(),
          getAllUsers(),
          getDailyAttendanceSummary(new Date().toISOString().split('T')[0]),
          getWeeklyAttendanceSummary(),
        ])

        setAttendance(attendanceData)
        setUsers(usersData)
        setDailySummary(dailyData)
        setWeeklySummary(weeklyData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    // Redirect will be handled by useAuth hook
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalStudents = users.filter(u => u.role === 'student').length
  const totalAttendance = attendance.length
  const todayAttendance = attendance.filter(a => {
    const today = new Date().toDateString()
    const recordDate = new Date(a.timestamp).toDateString()
    return today === recordDate
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Absensi
              </h1>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? 'Admin' : 'Student'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                {dailySummary ? `${dailySummary.attendanceRate}% attendance rate` : 'Loading...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Jakarta, Indonesia</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{record.student_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                      <Badge variant="outline">{record.method}</Badge>
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No attendance records yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription>Attendance overview for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklySummary.map((summary, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(summary.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {summary.presentCount} present, {summary.lateCount} late
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{summary.attendanceRate}%</p>
                      <p className="text-sm text-gray-500">
                        {summary.totalStudents} students
                      </p>
                    </div>
                  </div>
                ))}
                {weeklySummary.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No weekly data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Only: User Management */}
        {isAdmin && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage students and admin accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Student ID</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2">{user.student_id || '-'}</td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 