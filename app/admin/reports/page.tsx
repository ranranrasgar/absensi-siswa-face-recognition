"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { AttendanceChart } from "@/components/attendance-chart"
import { AttendanceTable } from "@/components/attendance-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { getAllAttendance, getWeeklyAttendanceSummary, type DailyAttendanceSummary } from "@/lib/attendance"

export default function AttendanceReportsPage() {
  const [weeklyData, setWeeklyData] = useState<DailyAttendanceSummary[]>([])
  const [allAttendance, setAllAttendance] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const router = useRouter()

  useEffect(() => {
    const weekly = getWeeklyAttendanceSummary()
    setWeeklyData(weekly)

    const all = getAllAttendance()
    setAllAttendance(all)
  }, [])

  const totalStudents = JSON.parse(localStorage.getItem("users") || "[]").filter(
    (user: any) => user.role === "student",
  ).length

  const todayAttendance = weeklyData[weeklyData.length - 1]
  const weeklyAverage =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, day) => sum + day.attendanceRate, 0) / weeklyData.length)
      : 0

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" onClick={() => router.push("/admin")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Attendance Reports</h1>
                <p className="text-sm text-gray-500">View attendance analytics and generate reports</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-gray-500">Registered students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayAttendance ? `${todayAttendance.attendanceRate}%` : "0%"}
                </div>
                <p className="text-xs text-gray-500">
                  {todayAttendance ? `${todayAttendance.presentCount} of ${todayAttendance.totalStudents}` : "No data"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Weekly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyAverage}%</div>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allAttendance.length}</div>
                <p className="text-xs text-gray-500">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AttendanceChart
              data={weeklyData}
              type="bar"
              title="Weekly Attendance Overview"
              description="Daily attendance breakdown for the past week"
            />

            <AttendanceChart
              data={weeklyData}
              type="line"
              title="Attendance Rate Trend"
              description="Attendance rate percentage over time"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <AttendanceChart
                data={weeklyData}
                type="pie"
                title="Overall Distribution"
                description="Present, late, and absent breakdown"
              />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Weekly Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Best Attendance Day</p>
                        <p className="text-sm text-green-700">
                          {weeklyData.length > 0
                            ? weeklyData.reduce((best, day) => (day.attendanceRate > best.attendanceRate ? day : best))
                                .date
                            : "No data"}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {weeklyData.length > 0
                          ? `${
                              weeklyData.reduce((best, day) => (day.attendanceRate > best.attendanceRate ? day : best))
                                .attendanceRate
                            }%`
                          : "0%"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Face Recognition Usage</p>
                        <p className="text-sm text-blue-700">
                          {allAttendance.filter((r) => r.method === "face").length} of {allAttendance.length} check-ins
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {allAttendance.length > 0
                          ? `${Math.round((allAttendance.filter((r) => r.method === "face").length / allAttendance.length) * 100)}%`
                          : "0%"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-900">Average Check-in Distance</p>
                        <p className="text-sm text-amber-700">From school premises</p>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">
                        {allAttendance.filter((r) => r.distance).length > 0
                          ? `${Math.round(
                              allAttendance.filter((r) => r.distance).reduce((sum, r) => sum + r.distance, 0) /
                                allAttendance.filter((r) => r.distance).length,
                            )}m`
                          : "0m"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Attendance Table */}
          <AttendanceTable
            records={allAttendance}
            title="All Attendance Records"
            description="Complete attendance history with filtering and export options"
          />
        </main>
      </div>
    </AuthGuard>
  )
}
