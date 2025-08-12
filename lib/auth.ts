export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "student"
  studentId?: string
  faceDescriptor?: number[]
  enrolledAt?: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  status: "present" | "late"
  method: "face" | "manual"
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem("currentUser")
  window.location.href = "/"
}

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}

export const isStudent = (user: User | null): boolean => {
  return user?.role === "student"
}

// Initialize demo data
export const initializeDemoData = () => {
  const users = localStorage.getItem("users")
  if (!users) {
    const demoUsers: User[] = [
      {
        id: "admin123",
        email: "admin@school.com",
        name: "School Administrator",
        role: "admin",
      },
      {
        id: "student123",
        email: "student@school.com",
        name: "John Doe",
        role: "student",
        studentId: "STU001",
      },
    ]
    localStorage.setItem("users", JSON.stringify(demoUsers))
  }

  // Initialize school location (demo: Jakarta coordinates)
  const schoolLocation = localStorage.getItem("schoolLocation")
  if (!schoolLocation) {
    localStorage.setItem(
      "schoolLocation",
      JSON.stringify({
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 100, // 100 meters
      }),
    )
  }
}
