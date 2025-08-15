'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from './AuthProvider'
import { getStudentAttendance, calculateStudentStats, getAllAttendance, getDailyAttendanceSummary, getWeeklyAttendanceSummary } from '@/lib/attendance'
import { getAllUsers } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Calendar, Clock, LogOut, Camera, CheckCircle, XCircle, History, Users, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AttendanceRecord, DailyAttendanceSummary } from '@/lib/attendance'
import type { User as UserType } from '@/lib/auth'

export function UserDashboard() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [dailySummary, setDailySummary] = useState<DailyAttendanceSummary | null>(null)
  const [weeklySummary, setWeeklySummary] = useState<DailyAttendanceSummary[]>([])
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    attendanceRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [attendanceData, allAttendanceData, usersData, dailyData, weeklyData, statsData] = await Promise.all([
          getStudentAttendance(user.id),
          getAllAttendance(),
          getAllUsers(),
          getDailyAttendanceSummary(new Date().toISOString().split('T')[0]),
          getWeeklyAttendanceSummary(),
          calculateStudentStats(user.id)
        ])
        
        setAttendance(attendanceData)
        setAllAttendance(allAttendanceData)
        setUsers(usersData)
        setDailySummary(dailyData)
        setWeeklySummary(weeklyData)
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data when user comes back from check-in
    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleCheckIn = () => {
    router.push('/student/checkin')
  }

  const todayAttendance = attendance.find(a => {
    const today = new Date().toDateString()
    const recordDate = new Date(a.timestamp).toDateString()
    return today === recordDate
  })

  const totalStudents = users.filter(u => u.role === 'student').length
  const totalAttendance = allAttendance.length
  const todayAttendanceCount = allAttendance.filter(a => {
    const today = new Date().toDateString()
    const recordDate = new Date(a.timestamp).toDateString()
    return today === recordDate
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <Badge variant="secondary">Student</Badge>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Here's your attendance overview and school statistics.
          </p>
        </div>

        {/* Today's Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Attendance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAttendance ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Present</p>
                      <p className="text-sm text-green-600">
                        Checked in at {new Date(todayAttendance.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {todayAttendance.method === 'face' ? 'Face Recognition' : 'Manual'}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800">Not Checked In</p>
                      <p className="text-sm text-yellow-600">
                        You haven't checked in today yet
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleCheckIn}>
                    <Camera className="h-4 w-4 mr-2" />
                    Check In Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAttendanceCount}</div>
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
              <p className="text-xs text-muted-foreground">
                All time records
              </p>
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

        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDays}</div>
              <p className="text-xs text-muted-foreground">
                Your records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <p className="text-xs text-muted-foreground">
                On time attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <p className="text-xs text-muted-foreground">
                Late arrivals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rate</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                Your attendance rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCheckIn}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Face Check-in
              </CardTitle>
              <CardDescription>
                Use face recognition to check in
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/student/history')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Attendance History
              </CardTitle>
              <CardDescription>
                View your complete attendance records
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/student/enroll')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Face Enrollment
              </CardTitle>
              <CardDescription>
                Register your face for recognition
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Attendance & Weekly Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allAttendance.slice(0, 5).map((record) => (
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
                {allAttendance.length === 0 && (
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

        {/* Your Recent Attendance */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Recent Attendance</CardTitle>
            <CardDescription>Your latest attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(record.timestamp).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
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
      </main>
    </div>
  )
} 