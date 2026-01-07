import { useState, useEffect, useCallback } from 'react'
import { BoatRamp } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from './useAuth'

// Lokal lagring för demo utan Supabase
const LOCAL_STORAGE_KEY = 'fiskeapp_boat_ramps'

function getLocalBoatRamps(): BoatRamp[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveLocalBoatRamps(ramps: BoatRamp[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ramps))
}

interface BoatRampFormData {
  name: string
  latitude: number
  longitude: number
  waterName: string
  description: string
  parking: boolean
  fee: boolean
}

interface UseBoatRampsResult {
  boatRamps: BoatRamp[]
  loading: boolean
  error: string | null
  addBoatRamp: (data: BoatRampFormData) => Promise<BoatRamp | null>
  refresh: () => Promise<void>
}

export function useBoatRamps(): UseBoatRampsResult {
  const [boatRamps, setBoatRamps] = useState<BoatRamp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isSupabaseConfigured()) {
        // Hämta från Supabase
        const { data, error: fetchError } = await supabase
          .from('boat_ramps')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setBoatRamps(data?.map(mapFromDb) || [])
      } else {
        // Använd localStorage
        setBoatRamps(getLocalBoatRamps())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta båtramper')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addBoatRamp = async (data: BoatRampFormData): Promise<BoatRamp | null> => {
    try {
      const newRamp: BoatRamp = {
        id: crypto.randomUUID(),
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        waterName: data.waterName,
        description: data.description || null,
        parking: data.parking,
        fee: data.fee,
        addedByUserId: user?.id || 'local',
        verified: false,
        createdAt: new Date().toISOString(),
      }

      if (isSupabaseConfigured() && user) {
        // Spara till Supabase
        const { data: inserted, error: insertError } = await supabase
          .from('boat_ramps')
          .insert([mapToDb(newRamp)])
          .select()
          .single()

        if (insertError) throw insertError

        const savedRamp = mapFromDb(inserted)
        setBoatRamps(prev => [savedRamp, ...prev])
        return savedRamp
      } else {
        // Spara lokalt
        const updated = [newRamp, ...boatRamps]
        saveLocalBoatRamps(updated)
        setBoatRamps(updated)
        return newRamp
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara båtramp')
      return null
    }
  }

  return { boatRamps, loading, error, addBoatRamp, refresh }
}

// Mappning mellan databas-format och TypeScript-format
function mapFromDb(row: Record<string, unknown>): BoatRamp {
  return {
    id: row.id as string,
    name: row.name as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    waterName: row.water_name as string,
    description: row.description as string | null,
    parking: row.parking as boolean,
    fee: row.fee as boolean,
    addedByUserId: row.added_by_user_id as string,
    verified: row.verified as boolean,
    createdAt: row.created_at as string,
  }
}

function mapToDb(ramp: BoatRamp): Record<string, unknown> {
  return {
    id: ramp.id,
    name: ramp.name,
    latitude: ramp.latitude,
    longitude: ramp.longitude,
    water_name: ramp.waterName,
    description: ramp.description,
    parking: ramp.parking,
    fee: ramp.fee,
    added_by_user_id: ramp.addedByUserId,
    verified: ramp.verified,
  }
}
