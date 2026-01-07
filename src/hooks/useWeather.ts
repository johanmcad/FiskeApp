import { useState, useEffect, useCallback } from 'react'
import { WeatherData } from '@/types'
import { fetchWeather } from '@/lib/weather'

interface UseWeatherResult {
  weather: WeatherData | null
  error: string | null
  loading: boolean
  refresh: (lat: number, lon: number) => Promise<void>
}

export function useWeather(lat?: number, lon?: number): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(latitude, longitude)
      if (data) {
        setWeather(data)
      } else {
        setError('Kunde inte hämta väderdata')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fel vid hämtning av väder')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      refresh(lat, lon)
    }
  }, [lat, lon, refresh])

  return { weather, error, loading, refresh }
}
