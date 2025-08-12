"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Save, RefreshCw } from "lucide-react"
import { getSchoolLocation, updateSchoolLocation, getCurrentLocation, type SchoolLocation } from "@/lib/location"
import { useToast } from "@/hooks/use-toast"

export default function LocationSettingsPage() {
  const [schoolLocation, setSchoolLocation] = useState<SchoolLocation>({
    latitude: 0,
    longitude: 0,
    radius: 100,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const location = getSchoolLocation()
    setSchoolLocation(location)
  }, [])

  const handleSave = () => {
    updateSchoolLocation(schoolLocation)
    toast({
      title: "Location settings saved",
      description: "School location and radius have been updated",
    })
  }

  const handleUseCurrentLocation = async () => {
    setIsLoading(true)
    try {
      const currentLocation = await getCurrentLocation()
      setSchoolLocation({
        ...schoolLocation,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      })
      toast({
        title: "Current location set",
        description: "School location updated to your current position",
      })
    } catch (error) {
      toast({
        title: "Location error",
        description: error instanceof Error ? error.message : "Failed to get current location",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
                <h1 className="text-lg font-semibold text-gray-900">Location Settings</h1>
                <p className="text-sm text-gray-500">Configure school location and attendance radius</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                School Location Configuration
              </CardTitle>
              <CardDescription>
                Set the school's location coordinates and the allowed radius for attendance check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={schoolLocation.latitude}
                    onChange={(e) =>
                      setSchoolLocation({
                        ...schoolLocation,
                        latitude: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., -6.2088"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={schoolLocation.longitude}
                    onChange={(e) =>
                      setSchoolLocation({
                        ...schoolLocation,
                        longitude: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 106.8456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Attendance Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="10"
                  max="1000"
                  value={schoolLocation.radius}
                  onChange={(e) =>
                    setSchoolLocation({
                      ...schoolLocation,
                      radius: Number.parseInt(e.target.value) || 100,
                    })
                  }
                  placeholder="100"
                />
                <p className="text-sm text-gray-500">
                  Students must be within this distance from the school to check in (recommended: 50-200 meters)
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Getting Location..." : "Use Current Location"}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Settings</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Latitude: {schoolLocation.latitude}</p>
                  <p>Longitude: {schoolLocation.longitude}</p>
                  <p>Radius: {schoolLocation.radius} meters</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <h4 className="font-medium">How to find coordinates:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use Google Maps: Right-click on your school location and copy coordinates</li>
                  <li>Use GPS coordinates from your phone's location services</li>
                  <li>Click "Use Current Location" if you're currently at the school</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
