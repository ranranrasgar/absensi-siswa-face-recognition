import { supabase } from './supabase'
import type { Database } from './supabase'

export type SchoolLocation = Database['public']['Tables']['school_locations']['Row']
export type SchoolLocationInsert = Database['public']['Tables']['school_locations']['Insert']
export type SchoolLocationUpdate = Database['public']['Tables']['school_locations']['Update']

export interface Location {
  latitude: number
  longitude: number
}

export interface SchoolLocationWithRadius extends Location {
  radius: number
}

export interface LocationValidationResult {
  isValid: boolean
  distance: number
  error?: string
}

// Get current school location (alias for getCurrentSchoolLocation)
export const getSchoolLocation = async (): Promise<SchoolLocationWithRadius | null> => {
  return getCurrentSchoolLocation()
}

// Get current school location
export const getCurrentSchoolLocation = async (): Promise<SchoolLocationWithRadius | null> => {
  try {
    const { data, error } = await supabase
      .from('school_locations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data ? {
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius
    } : null
  } catch (error) {
    console.error('Error getting school location:', error)
    return null
  }
}

// Get user's current location (alias for getUserLocation)
export const getCurrentLocation = (): Promise<Location> => {
  return getUserLocation()
}

// Validate if user is within school premises
export const validateLocation = async (): Promise<LocationValidationResult> => {
  try {
    const userLocation = await getUserLocation()
    const schoolLocation = await getCurrentSchoolLocation()
    
    if (!schoolLocation) {
      return {
        isValid: false,
        distance: 0,
        error: 'School location not configured'
      }
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      schoolLocation.latitude,
      schoolLocation.longitude
    )

    return {
      isValid: distance <= schoolLocation.radius,
      distance: Math.round(distance),
    }
  } catch (error) {
    return {
      isValid: false,
      distance: 0,
      error: error instanceof Error ? error.message : 'Location validation failed'
    }
  }
}

// Set school location
export const setSchoolLocation = async (location: SchoolLocationWithRadius): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('school_locations')
      .insert([{
        name: "Main Campus",
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius,
        created_at: new Date().toISOString(),
      }])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error setting school location:', error)
    return false
  }
}

// Update school location
export const updateSchoolLocation = async (id: string, updates: SchoolLocationUpdate): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('school_locations')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating school location:', error)
    return false
  }
}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Check if location is within school radius
export const isWithinSchoolRadius = async (userLat: number, userLon: number): Promise<boolean> => {
  try {
    const schoolLocation = await getCurrentSchoolLocation()
    if (!schoolLocation) return false

    const distance = calculateDistance(
      schoolLocation.latitude,
      schoolLocation.longitude,
      userLat,
      userLon
    )

    return distance <= schoolLocation.radius
  } catch (error) {
    console.error('Error checking if within school radius:', error)
    return false
  }
}

// Get user's current location
export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
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
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })
}

// Get formatted address from coordinates (using reverse geocoding)
export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()
    return data.display_name || 'Unknown location'
  } catch (error) {
    console.error('Error getting address from coordinates:', error)
    return 'Unknown location'
  }
}

// Initialize default school location (Jakarta)
export const initializeDefaultSchoolLocation = async (): Promise<void> => {
  try {
    const existingLocation = await getCurrentSchoolLocation()
    if (existingLocation) return

    await setSchoolLocation({
      latitude: -6.2088,
      longitude: 106.8456,
      radius: 100, // 100 meters
    })
  } catch (error) {
    console.error('Error initializing default school location:', error)
  }
}
