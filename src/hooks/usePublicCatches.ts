import { useState, useEffect, useCallback } from 'react'
import { Catch } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface UsePublicCatchesResult {
  catches: Catch[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePublicCatches(): UsePublicCatchesResult {
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('catches')
        .select('*')
        .eq('is_public', true)
        .order('caught_at', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError

      setCatches(data?.map(mapFromDb) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta publika fångster')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { catches, loading, error, refresh }
}

// Mappning mellan databas-format och TypeScript-format
function mapFromDb(row: Record<string, unknown>): Catch {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    species: row.species as string,
    lengthCm: row.length_cm as number | null,
    weightGrams: row.weight_grams as number | null,
    caughtAt: row.caught_at as string,
    latitude: row.latitude as number | null,
    longitude: row.longitude as number | null,
    photoUrl: row.photo_url as string | null,
    weatherTemp: row.weather_temp as number | null,
    weatherWind: row.weather_wind as number | null,
    weatherConditions: row.weather_conditions as string | null,
    weatherPressure: row.weather_pressure as number | null,
    waterName: row.water_name as string | null,
    notes: row.notes as string | null,
    isPublic: row.is_public as boolean,
    createdAt: row.created_at as string,
  }
}
