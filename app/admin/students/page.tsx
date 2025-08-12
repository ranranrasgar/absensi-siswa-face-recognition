"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, Search, UserPlus, CheckCircle, XCircle, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getStudentAttendance, calculateStudentStats } from "@/lib/attendance"

interface Student {
  id: string
  email: string
  name: string
  role: "student"
  studentId: string
  faceDescriptor?: number[]
  enrolledAt?: string
}

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const studentUsers = users.filter((user: any) => user.role === "student")
    setStudents(studentUsers)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.studentId || !newStudent.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const existingUser = users.find((u: any) => u.email === newStudent.email || u.studentId === newStudent.studentId)

    if (existingUser) {
      toast({
        title: "Student Already Exists",
        description: "A student with this email or ID already exists",
        variant: "destructive",
      })
      return
    }

    const student: Student = {
      id: newStudent.password, // Using password as ID for demo
      email: newStudent.email,
      name: newStudent.name,
      role: "student",
      studentId: newStudent.studentId,
    }

    users.push(student)
    localStorage.setItem("users", JSON.stringify(users))
    loadStudents()

    toast({
      title: "Student Added",
      description: `${newStudent.name} has been added successfully`,
    })

    setNewStudent({ name: "", email: "", studentId: "", password: "" })
    setIsAddDialogOpen(false)
  }

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to delete ${studentName}?`)) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const filteredUsers = users.filter((u: any) => u.id !== studentId)
      localStorage.setItem("users", JSON.stringify(filteredUsers))

      // Also remove their attendance records
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
      const filteredAttendance = attendance.filter((r: any) => r.studentId !== studentId)
      localStorage.setItem("attendance", JSON.stringify(filteredAttendance))

      loadStudents()
      toast({
        title: "Student Deleted",
        description: `${studentName} has been removed from the system`,
      })
    }
  }

  const resetFaceEnrollment = (studentId: string, studentName: string) => {
    if (confirm(`Reset face enrollment for ${studentName}?`)) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === studentId)
      if (userIndex !== -1) {
        delete users[userIndex].faceDescriptor
        delete users[userIndex].enrolledAt
        localStorage.setItem("users", JSON.stringify(users))
        loadStudents()

        toast({
          title: "Face Enrollment Reset",
          description: `${studentName} will need to enroll their face again`,
        })
      }
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={() => router.push("/admin")} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Student Management</h1>
                  <p className="text-sm text-gray-500">Manage student accounts and face recognition enrollment</p>
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>Create a new student account for the attendance system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        placeholder="Enter student's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        placeholder="Enter student's email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newStudent.studentId}
                        onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <Button onClick={handleAddStudent} className="w-full">
                      Add Student
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Stats */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Total: {students.length}</span>
                <span>Enrolled: {students.filter((s) => s.faceDescriptor).length}</span>
                <span>Pending: {students.filter((s) => !s.faceDescriptor).length}</span>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const attendance = getStudentAttendance(student.studentId || student.id)
              const stats = calculateStudentStats(student.studentId || student.id, 30)
              const isEnrolled = student.faceDescriptor && student.enrolledAt

              return (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.studentId}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Email: {student.email}</p>
                      {isEnrolled && <p>Enrolled: {new Date(student.enrolledAt!).toLocaleDateString()}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-lg">{stats.attendanceRate}%</div>
                        <div className="text-gray-500">Attendance</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-lg">{attendance.length}</div>
                        <div className="text-gray-500">Records</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isEnrolled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetFaceEnrollment(student.id, student.name)}
                          className="flex-1 bg-transparent"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Reset Face
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No students found" : "No students yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Add your first student to get started with the attendance system"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Student
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
