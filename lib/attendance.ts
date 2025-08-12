export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  status: "present" | "late" | "absent"
  method: "face" | "manual"
  distance?: number
  notes?: string
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  attendanceRate: number
}

export interface DailyAttendanceSummary {
  date: string
  totalStudents: number
  presentCount: number
  lateCount: number
  absentCount: number
  attendanceRate: number
}

// Get all attendance records
export const getAllAttendance = (): AttendanceRecord[] => {
  return JSON.parse(localStorage.getItem("attendance") || "[]")
}

// Get attendance for a specific student
export const getStudentAttendance = (studentId: string): AttendanceRecord[] => {
  const allAttendance = getAllAttendance()
  return allAttendance.filter((record) => record.studentId === studentId)
}

// Get attendance for a specific date
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  const allAttendance = getAllAttendance()
  return allAttendance.filter((record) => new Date(record.timestamp).toDateString() === new Date(date).toDateString())
}

// Get attendance for a date range
export const getAttendanceByDateRange = (startDate: string, endDate: string): AttendanceRecord[] => {
  const allAttendance = getAllAttendance()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return allAttendance.filter((record) => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= start && recordDate <= end
  })
}

// Calculate attendance statistics for a student
export const calculateStudentStats = (studentId: string, days = 30): AttendanceStats => {
  const studentAttendance = getStudentAttendance(studentId)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const relevantRecords = studentAttendance.filter((record) => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= startDate && recordDate <= endDate
  })

  const presentDays = relevantRecords.filter((r) => r.status === "present").length
  const lateDays = relevantRecords.filter((r) => r.status === "late").length
  const absentDays = days - presentDays - lateDays

  return {
    totalDays: days,
    presentDays,
    lateDays,
    absentDays,
    attendanceRate: days > 0 ? Math.round((presentDays / days) * 100) : 0,
  }
}

// Get daily attendance summary
export const getDailyAttendanceSummary = (date: string): DailyAttendanceSummary => {
  const dayAttendance = getAttendanceByDate(date)
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
  const students = allUsers.filter((user: any) => user.role === "student")

  const presentCount = dayAttendance.filter((r) => r.status === "present").length
  const lateCount = dayAttendance.filter((r) => r.status === "late").length
  const absentCount = students.length - presentCount - lateCount

  return {
    date,
    totalStudents: students.length,
    presentCount,
    lateCount,
    absentCount,
    attendanceRate: students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0,
  }
}

// Get weekly attendance summary
export const getWeeklyAttendanceSummary = (): DailyAttendanceSummary[] => {
  const summaries: DailyAttendanceSummary[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    summaries.push(getDailyAttendanceSummary(date.toDateString()))
  }

  return summaries
}

// Add manual attendance record (admin only)
export const addManualAttendance = (record: Omit<AttendanceRecord, "id">): void => {
  const attendance = getAllAttendance()
  const newRecord: AttendanceRecord = {
    ...record,
    id: Date.now().toString(),
  }
  attendance.push(newRecord)
  localStorage.setItem("attendance", JSON.stringify(attendance))
}

// Update attendance record
export const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>): void => {
  const attendance = getAllAttendance()
  const index = attendance.findIndex((record) => record.id === id)
  if (index !== -1) {
    attendance[index] = { ...attendance[index], ...updates }
    localStorage.setItem("attendance", JSON.stringify(attendance))
  }
}

// Delete attendance record
export const deleteAttendanceRecord = (id: string): void => {
  const attendance = getAllAttendance()
  const filtered = attendance.filter((record) => record.id !== id)
  localStorage.setItem("attendance", JSON.stringify(filtered))
}

// Export attendance data as CSV
export const exportAttendanceCSV = (records: AttendanceRecord[]): string => {
  const headers = ["Date", "Time", "Student ID", "Student Name", "Status", "Method", "Distance", "Notes"]
  const csvContent = [
    headers.join(","),
    ...records.map((record) =>
      [
        new Date(record.timestamp).toLocaleDateString(),
        new Date(record.timestamp).toLocaleTimeString(),
        record.studentId,
        `"${record.studentName}"`,
        record.status,
        record.method,
        record.distance || "",
        `"${record.notes || ""}"`,
      ].join(","),
    ),
  ].join("\n")

  return csvContent
}

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
