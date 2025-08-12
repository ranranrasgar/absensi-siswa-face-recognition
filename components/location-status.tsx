"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { validateLocation, type LocationValidationResult } from "@/lib/location"
import { useToast } from "@/hooks/use-toast"

interface LocationStatusProps {
  onLocationChange?: (result: LocationValidationResult) => void
  autoRefresh?: boolean
  showActions?: boolean
}

export function LocationStatus({ onLocationChange, autoRefresh = false, showActions = true }: LocationStatusProps) {
  const [locationResult, setLocationResult] = useState<LocationValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const checkLocation = async () => {
    setIsLoading(true)
    try {
      const result = await validateLocation()
      setLocationResult(result)
      onLocationChange?.(result)

      if (result.error) {
        toast({
          title: "Location Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorResult: LocationValidationResult = {
        isValid: false,
        distance: 0,
        error: "Failed to check location",
      }
      setLocationResult(errorResult)
      onLocationChange?.(errorResult)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkLocation()

    if (autoRefresh) {
      const interval = setInterval(checkLocation, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />
    if (locationResult?.error) return <AlertTriangle className="h-5 w-5 text-amber-600" />
    if (locationResult?.isValid) return <CheckCircle className="h-5 w-5 text-green-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusText = () => {
    if (isLoading) return "Checking location..."
    if (locationResult?.error) return locationResult.error
    if (locationResult?.isValid) return `Within school premises (${locationResult.distance}m away)`
    if (locationResult) return `Outside school premises (${locationResult.distance}m away)`
    return "Location unknown"
  }

  const getStatusVariant = () => {
    if (locationResult?.error) return "secondary"
    if (locationResult?.isValid) return "default"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location Status
        </CardTitle>
        <CardDescription>Your current location relative to school premises</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusVariant()} className="flex-1 justify-center">
            {getStatusText()}
          </Badge>
        </div>

        {locationResult && !locationResult.error && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• School radius: 100 meters</p>
            <p>• Distance from school: {locationResult.distance}m</p>
            <p>
              • Status:{" "}
              {locationResult.isValid ? (
                <span className="text-green-600 font-medium">Within range</span>
              ) : (
                <span className="text-red-600 font-medium">Too far from school</span>
              )}
            </p>
          </div>
        )}

        {locationResult?.error && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <p className="font-medium">Location access required</p>
            <p>Please enable location permissions to check in for attendance.</p>
          </div>
        )}

        {showActions && (
          <Button onClick={checkLocation} disabled={isLoading} variant="outline" className="w-full bg-transparent">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Checking..." : "Refresh Location"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
