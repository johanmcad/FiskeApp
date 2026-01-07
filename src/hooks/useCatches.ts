import { useState, useEffect, useCallback } from 'react'
import { Catch, CatchFormData } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadCatchImage } from '@/lib/storage'
import { useAuth } from './useAuth'

// Lokal lagring för demo utan Supabase
const LOCAL_STORAGE_KEY = 'fiskeapp_catches'

function getLocalCatches(): Catch[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveLocalCatches(catches: Catch[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(catches))
}

interface UseCatchesResult {
  catches: Catch[]
  loading: boolean
  error: string | null
  addCatch: (data: CatchFormData, weather?: { temp: number; wind: number; conditions: string; pressure: number }) => Promise<Catch | null>
  updateCatch: (id: string, data: CatchFormData, weather?: { temp: number; wind: number; conditions: string; pressure: number }) => Promise<Catch | null>
  deleteCatch: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useCatches(): UseCatchesResult {
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isConfigured } = useAuth()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isConfigured && user) {
        // Hämta från Supabase
        const { data, error: fetchError } = await supabase
          .from('catches')
          .select('*')
          .eq('user_id', user.id)
          .order('caught_at', { ascending: false })

        if (fetchError) throw fetchError

        setCatches(data?.map(mapFromDb) || [])
      } else {
        // Använd localStorage
        setCatches(getLocalCatches())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta fångster')
    } finally {
      setLoading(false)
    }
  }, [isConfigured, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCatch = async (
    data: CatchFormData,
    weather?: { temp: number; wind: number; conditions: string; pressure: number }
  ): Promise<Catch | null> => {
    try {
      // Ladda upp bild om det finns en
      let photoUrl: string | null = null
      if (data.photo && user) {
        photoUrl = await uploadCatchImage(data.photo, user.id)
      }

      const newCatch: Catch = {
        id: crypto.randomUUID(),
        userId: user?.id || 'local',
        species: data.species,
        lengthCm: data.lengthCm,
        weightGrams: data.weightGrams,
        caughtAt: data.caughtAt,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl,
        weatherTemp: weather?.temp ?? null,
        weatherWind: weather?.wind ?? null,
        weatherConditions: weather?.conditions ?? null,
        weatherPressure: weather?.pressure ?? null,
        waterName: data.waterName || null,
        notes: data.notes || null,
        isPublic: data.isPublic,
        createdAt: new Date().toISOString(),
      }

      if (isConfigured && user) {
        // Spara till Supabase
        const { data: inserted, error: insertError } = await supabase
          .from('catches')
          .insert([mapToDb(newCatch)])
          .select()
          .single()

        if (insertError) throw insertError

        const savedCatch = mapFromDb(inserted)
        setCatches(prev => [savedCatch, ...prev])
        return savedCatch
      } else {
        // Spara lokalt
        const updated = [newCatch, ...catches]
        saveLocalCatches(updated)
        setCatches(updated)
        return newCatch
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara fångst')
      return null
    }
  }

  const updateCatch = async (
    id: string,
    data: CatchFormData,
    weather?: { temp: number; wind: number; conditions: string; pressure: number }
  ): Promise<Catch | null> => {
    try {
      const existingCatch = catches.find(c => c.id === id)
      if (!existingCatch) {
        throw new Error('Fångst hittades inte')
      }

      // Ladda upp ny bild om det finns en
      let photoUrl: string | null = existingCatch.photoUrl
      if (data.photo && user) {
        photoUrl = await uploadCatchImage(data.photo, user.id)
      }

      const updatedCatch: Catch = {
        ...existingCatch,
        species: data.species,
        lengthCm: data.lengthCm,
        weightGrams: data.weightGrams,
        caughtAt: data.caughtAt,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl,
        weatherTemp: weather?.temp ?? null,
        weatherWind: weather?.wind ?? null,
        weatherConditions: weather?.conditions ?? null,
        weatherPressure: weather?.pressure ?? null,
        waterName: data.waterName || null,
        notes: data.notes || null,
        isPublic: data.isPublic,
      }

      if (isConfigured && user) {
        // Uppdatera i Supabase
        const { data: updated, error: updateError } = await supabase
          .from('catches')
          .update(mapToDb(updatedCatch))
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError

        const savedCatch = mapFromDb(updated)
        setCatches(prev => prev.map(c => c.id === id ? savedCatch : c))
        return savedCatch
      } else {
        // Uppdatera lokalt
        const updated = catches.map(c => c.id === id ? updatedCatch : c)
        saveLocalCatches(updated)
        setCatches(updated)
        return updatedCatch
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte uppdatera fångst')
      return null
    }
  }

  const deleteCatch = async (id: string): Promise<boolean> => {
    try {
      if (isConfigured && user) {
        const { error: deleteError } = await supabase
          .from('catches')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
      }

      const updated = catches.filter(c => c.id !== id)
      if (!isConfigured) {
        saveLocalCatches(updated)
      }
      setCatches(updated)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte ta bort fångst')
      return false
    }
  }

  return { catches, loading, error, addCatch, updateCatch, deleteCatch, refresh }
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

function mapToDb(c: Catch): Record<string, unknown> {
  return {
    id: c.id,
    user_id: c.userId,
    species: c.species,
    length_cm: c.lengthCm,
    weight_grams: c.weightGrams,
    caught_at: c.caughtAt,
    latitude: c.latitude,
    longitude: c.longitude,
    photo_url: c.photoUrl,
    weather_temp: c.weatherTemp,
    weather_wind: c.weatherWind,
    weather_conditions: c.weatherConditions,
    weather_pressure: c.weatherPressure,
    water_name: c.waterName,
    notes: c.notes,
    is_public: c.isPublic,
  }
}
