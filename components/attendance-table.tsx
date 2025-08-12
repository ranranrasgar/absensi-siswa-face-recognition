"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Calendar } from "lucide-react"
import type { AttendanceRecord } from "@/lib/attendance"
import { exportAttendanceCSV, downloadCSV } from "@/lib/attendance"

interface AttendanceTableProps {
  records: AttendanceRecord[]
  title: string
  description?: string
  showExport?: boolean
  showFilters?: boolean
}

export function AttendanceTable({
  records,
  title,
  description,
  showExport = true,
  showFilters = true,
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesMethod = methodFilter === "all" || record.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleExport = () => {
    const csvContent = exportAttendanceCSV(filteredRecords)
    const filename = `attendance-${new Date().toISOString().split("T")[0]}.csv`
    downloadCSV(csvContent, filename)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="default" className="bg-green-600">
            Present
          </Badge>
        )
      case "late":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            Late
          </Badge>
        )
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "face":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Face Recognition
          </Badge>
        )
      case "manual":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            Manual
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showExport && (
            <Button onClick={handleExport} variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="face">Face Recognition</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium">Date & Time</th>
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Distance</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{new Date(record.timestamp).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{record.studentName}</div>
                          <div className="text-sm text-gray-500">{record.studentId}</div>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4">{getMethodBadge(record.method)}</td>
                      <td className="p-4">{record.distance ? `${record.distance}m` : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No attendance records found</p>
                      <p className="text-sm">Records will appear here once students start checking in</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecords.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        )}
      </CardContent>
    </Card>
  )
}
