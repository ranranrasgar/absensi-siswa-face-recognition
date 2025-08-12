"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserCheck, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addManualAttendance } from "@/lib/attendance"
import { AuthProvider } from "@/components/AuthProvider"

interface Student {
  id: string
  name: string
  student_id: string
}

function ManualCheckinContent() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [status, setStatus] = useState<"present" | "late" | "absent">("present")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadStudents = async () => {
      try {
        // For now, we'll use mock data since we haven't implemented getAllUsers yet
        const mockStudents: Student[] = [
          { id: "1", name: "John Doe", student_id: "ST001" },
          { id: "2", name: "Jane Smith", student_id: "ST002" },
          { id: "3", name: "Bob Johnson", student_id: "ST003" },
        ]
        setStudents(mockStudents)
      } catch (error) {
        console.error("Error loading students:", error)
      }
    }

    loadStudents()
  }, [])

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast({
        title: "Validation Error",
        description: "Please select a student",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const student = students.find((s) => s.id === selectedStudent)
      if (!student) return

      // Check if student already checked in today
      const today = new Date().toDateString()
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
      const existingRecord = attendance.find(
        (record: any) => record.studentId === student.student_id && new Date(record.timestamp).toDateString() === today,
      )

      if (existingRecord) {
        toast({
          title: "Already Checked In",
          description: `${student.name} has already checked in today`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      await addManualAttendance({
        studentId: student.student_id,
        studentName: student.name,
        timestamp: new Date().toISOString(),
        latitude: -6.2088, // Default school location
        longitude: 106.8456,
        status,
        method: "manual",
        notes: notes.trim() || undefined,
      })

      toast({
        title: "Attendance Recorded",
        description: `${student.name} has been marked as ${status}`,
      })

      // Reset form
      setSelectedStudent("")
      setStatus("present")
      setNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <h1 className="text-lg font-semibold text-gray-900">Manual Check-in</h1>
                <p className="text-sm text-gray-500">Add attendance records manually</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Record Attendance
                  </CardTitle>
                  <CardDescription>Manually add attendance records for students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="student">Select Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Attendance Status</Label>
                    <Select value={status} onValueChange={(value: "present" | "late" | "absent") => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes about this attendance record..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Recording..." : "Record Attendance"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Today's Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {new Date().toLocaleTimeString()}
                    </p>
                    <p>
                      <span className="font-medium">Total Students:</span> {students.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Use manual check-in for students who can't use face recognition</p>
                    <p>• Students can only have one attendance record per day</p>
                    <p>• Notes are optional but helpful for tracking special circumstances</p>
                    <p>• All manual records are marked with "Manual" method</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

export default function ManualCheckinPage() {
  return (
    <AuthProvider>
      <ManualCheckinContent />
    </AuthProvider>
  )
}
