import { useState, useEffect, useCallback } from 'react'
import { GeoLocation } from '@/types'
import { getCurrentPosition } from '@/lib/geolocation'

interface UseGeolocationResult {
  location: GeoLocation | null
  error: string | null
  loading: boolean
  refresh: () => Promise<void>
}

export function useGeolocation(autoFetch = false): UseGeolocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const pos = await getCurrentPosition()
      setLocation(pos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta position')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      refresh()
    }
  }, [autoFetch, refresh])

  return { location, error, loading, refresh }
}
