export interface FishSpecies {
  id: string
  swedishName: string
  latinName: string
  category: 'freshwater' | 'saltwater' | 'both'
  minSizeCm?: number
}

export interface Catch {
  id: string
  userId: string
  species: string
  lengthCm: number | null
  weightGrams: number | null
  caughtAt: string
  latitude: number | null
  longitude: number | null
  photoUrl: string | null
  weatherTemp: number | null
  weatherWind: number | null
  weatherConditions: string | null
  weatherPressure: number | null
  waterName: string | null
  notes: string | null
  isPublic: boolean
  createdAt: string
}

export interface CatchFormData {
  species: string
  lengthCm: number | null
  weightGrams: number | null
  caughtAt: string
  latitude: number | null
  longitude: number | null
  waterName: string
  notes: string
  isPublic: boolean
  photo: File | null
}

export interface WeatherData {
  temperature: number
  windSpeed: number
  windDirection: number
  conditions: string
  pressure: number
  humidity: number
}

export interface BoatRamp {
  id: string
  name: string
  latitude: number
  longitude: number
  waterName: string
  description: string | null
  parking: boolean
  fee: boolean
  addedByUserId: string
  verified: boolean
  createdAt: string
}

export interface UserProfile {
  id: string
  username: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy: number
}
