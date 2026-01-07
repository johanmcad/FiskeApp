import { GeoLocation } from '@/types'

export function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation stöds inte av din webbläsare'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Du nekade åtkomst till din plats'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Din plats kunde inte fastställas'))
            break
          case error.TIMEOUT:
            reject(new Error('Timeout vid hämtning av plats'))
            break
          default:
            reject(new Error('Ett okänt fel uppstod'))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })
}

export function watchPosition(
  onSuccess: (location: GeoLocation) => void,
  onError: (error: Error) => void
): number | null {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation stöds inte av din webbläsare'))
    return null
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    },
    (error) => {
      onError(new Error(error.message))
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  )
}

export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId)
}

// Beräkna avstånd mellan två punkter (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Jordens radie i km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
