import { supabase } from './supabase'
import type { Database } from './supabase'

export type AttendanceRecord = Database['public']['Tables']['attendance']['Row']
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update']

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
export const getAllAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting all attendance:', error)
    return []
  }
}

// Get attendance for a specific student
export const getStudentAttendance = async (studentId: string): Promise<AttendanceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting student attendance:', error)
    return []
  }
}

// Get attendance for a specific date
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('timestamp', startOfDay.toISOString())
      .lte('timestamp', endOfDay.toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting attendance by date:', error)
    return []
  }
}

// Get attendance for a date range
export const getAttendanceByDateRange = async (startDate: string, endDate: string): Promise<AttendanceRecord[]> => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting attendance by date range:', error)
    return []
  }
}

// Calculate attendance statistics for a student
export const calculateStudentStats = async (studentId: string, days = 30): Promise<AttendanceStats> => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    if (error) throw error

    const relevantRecords = data || []
    const presentDays = relevantRecords.filter((r) => r.status === 'present').length
    const lateDays = relevantRecords.filter((r) => r.status === 'late').length
    const absentDays = days - presentDays - lateDays

    return {
      totalDays: days,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate: days > 0 ? Math.round((presentDays / days) * 100) : 0,
    }
  } catch (error) {
    console.error('Error calculating student stats:', error)
    return {
      totalDays: days,
      presentDays: 0,
      lateDays: 0,
      absentDays: days,
      attendanceRate: 0,
    }
  }
}

// Get daily attendance summary
export const getDailyAttendanceSummary = async (date: string): Promise<DailyAttendanceSummary> => {
  try {
    const dayAttendance = await getAttendanceByDate(date)
    
    // Get total students count
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')

    if (studentsError) throw studentsError

    const totalStudents = students?.length || 0
    const presentCount = dayAttendance.filter((r) => r.status === 'present').length
    const lateCount = dayAttendance.filter((r) => r.status === 'late').length
    const absentCount = totalStudents - presentCount - lateCount

    return {
      date,
      totalStudents,
      presentCount,
      lateCount,
      absentCount,
      attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
    }
  } catch (error) {
    console.error('Error getting daily attendance summary:', error)
    return {
      date,
      totalStudents: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 0,
    }
  }
}

// Get weekly attendance summary
export const getWeeklyAttendanceSummary = async (): Promise<DailyAttendanceSummary[]> => {
  try {
    const summaries: DailyAttendanceSummary[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const summary = await getDailyAttendanceSummary(date.toISOString().split('T')[0])
      summaries.push(summary)
    }

    return summaries
  } catch (error) {
    console.error('Error getting weekly attendance summary:', error)
    return []
  }
}

// Get monthly attendance summary
export const getMonthlyAttendanceSummary = async (): Promise<DailyAttendanceSummary[]> => {
  try {
    const summaries: DailyAttendanceSummary[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const summary = await getDailyAttendanceSummary(date.toISOString().split('T')[0])
      summaries.push(summary)
    }

    return summaries
  } catch (error) {
    console.error('Error getting monthly attendance summary:', error)
    return []
  }
}

// Add attendance record
export const addAttendanceRecord = async (record: Omit<AttendanceInsert, 'id' | 'created_at'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('attendance')
      .insert([{
        ...record,
        created_at: new Date().toISOString(),
      }])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding attendance record:', error)
    return false
  }
}

// Add manual attendance record (admin only)
export const addManualAttendance = async (record: Omit<AttendanceInsert, 'id' | 'created_at'>): Promise<boolean> => {
  return addAttendanceRecord(record)
}

// Update attendance record
export const updateAttendanceRecord = async (id: string, updates: AttendanceUpdate): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return false
  }
}

// Delete attendance record
export const deleteAttendanceRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    return false
  }
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
        record.student_id,
        `"${record.student_name}"`,
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
