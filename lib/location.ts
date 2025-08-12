export interface Location {
  latitude: number
  longitude: number
}

export interface SchoolLocation extends Location {
  radius: number // in meters
}

export interface LocationValidationResult {
  isValid: boolean
  distance: number
  error?: string
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Get current user location
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        let errorMessage = "Failed to get location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  })
}

// Get school location from localStorage
export const getSchoolLocation = (): SchoolLocation => {
  const schoolLocation = localStorage.getItem("schoolLocation")
  if (schoolLocation) {
    return JSON.parse(schoolLocation)
  }
  // Default school location (Jakarta coordinates)
  return {
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 100,
  }
}

// Validate if user is within school premises
export const validateLocation = async (): Promise<LocationValidationResult> => {
  try {
    const userLocation = await getCurrentLocation()
    const schoolLocation = getSchoolLocation()

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      schoolLocation.latitude,
      schoolLocation.longitude,
    )

    return {
      isValid: distance <= schoolLocation.radius,
      distance: Math.round(distance),
    }
  } catch (error) {
    return {
      isValid: false,
      distance: 0,
      error: error instanceof Error ? error.message : "Location validation failed",
    }
  }
}

// Update school location (admin only)
export const updateSchoolLocation = (location: SchoolLocation): void => {
  localStorage.setItem("schoolLocation", JSON.stringify(location))
}
