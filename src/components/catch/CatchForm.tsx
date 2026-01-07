import { useState, useEffect } from 'react'
import { CatchFormData, WeatherData } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SpeciesSelect } from './SpeciesSelect'
import { WeatherDisplay } from '@/components/weather/WeatherDisplay'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useWeather } from '@/hooks/useWeather'
import { MapPin, Loader2 } from 'lucide-react'

interface CatchFormProps {
  onSubmit: (data: CatchFormData, weather?: WeatherData) => Promise<void>
  onCancel?: () => void
}

export function CatchForm({ onSubmit, onCancel }: CatchFormProps) {
  const [loading, setLoading] = useState(false)
  const { location, loading: geoLoading, refresh: refreshLocation } = useGeolocation()
  const { weather, loading: weatherLoading, refresh: refreshWeather } = useWeather()

  const [formData, setFormData] = useState<CatchFormData>({
    species: '',
    lengthCm: null,
    weightGrams: null,
    caughtAt: new Date().toISOString().slice(0, 16),
    latitude: null,
    longitude: null,
    waterName: '',
    notes: '',
    isPublic: true,
    photo: null,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CatchFormData, string>>>({})

  // Uppdatera formuläret när plats hämtas
  useEffect(() => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }))
      // Hämta väder för platsen
      refreshWeather(location.latitude, location.longitude)
    }
  }, [location, refreshWeather])

  const handleGetLocation = async () => {
    await refreshLocation()
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CatchFormData, string>> = {}

    if (!formData.species) {
      newErrors.species = 'Välj en fiskart'
    }

    if (!formData.caughtAt) {
      newErrors.caughtAt = 'Ange datum och tid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(formData, weather ?? undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SpeciesSelect
        value={formData.species}
        onChange={(species) => setFormData(prev => ({ ...prev, species }))}
        error={errors.species}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Längd (cm)"
          placeholder="ex. 45"
          value={formData.lengthCm ?? ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            lengthCm: e.target.value ? Number(e.target.value) : null
          }))}
        />

        <Input
          type="number"
          label="Vikt (gram)"
          placeholder="ex. 1500"
          value={formData.weightGrams ?? ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            weightGrams: e.target.value ? Number(e.target.value) : null
          }))}
        />
      </div>

      <Input
        type="datetime-local"
        label="Datum och tid *"
        value={formData.caughtAt}
        onChange={(e) => setFormData(prev => ({ ...prev, caughtAt: e.target.value }))}
        error={errors.caughtAt}
      />

      <Input
        type="text"
        label="Vatten/Sjö"
        placeholder="ex. Mälaren, Vänern..."
        value={formData.waterName}
        onChange={(e) => setFormData(prev => ({ ...prev, waterName: e.target.value }))}
      />

      {/* Plats */}
      <Card padding="sm" className="bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Position</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                Hämta
              </>
            )}
          </Button>
        </div>
        {formData.latitude && formData.longitude ? (
          <p className="text-sm text-gray-600">
            {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Ingen position angiven</p>
        )}
      </Card>

      {/* Väder */}
      {(weather || weatherLoading) && (
        <Card padding="sm" className="bg-blue-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Väder just nu</p>
          {weatherLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Hämtar väderdata...</span>
            </div>
          ) : weather ? (
            <WeatherDisplay weather={weather} />
          ) : null}
        </Card>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anteckningar
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Bete, metod, förhållanden..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isPublic}
          onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Dela denna fångst publikt</span>
      </label>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Avbryt
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sparar...
            </>
          ) : (
            'Spara fångst'
          )}
        </Button>
      </div>
    </form>
  )
}
