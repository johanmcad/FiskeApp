import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LocationPicker } from '@/components/map/LocationPicker'
import { useGeolocation } from '@/hooks/useGeolocation'
import { MapPin, Loader2, Map } from 'lucide-react'

interface BoatRampFormData {
  name: string
  latitude: number
  longitude: number
  waterName: string
  description: string
  parking: boolean
  fee: boolean
}

interface BoatRampFormProps {
  onSubmit: (data: BoatRampFormData) => Promise<void>
  onCancel?: () => void
}

export function BoatRampForm({ onSubmit, onCancel }: BoatRampFormProps) {
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const { location, loading: geoLoading, refresh: refreshLocation } = useGeolocation()

  const [formData, setFormData] = useState<BoatRampFormData>({
    name: '',
    latitude: 0,
    longitude: 0,
    waterName: '',
    description: '',
    parking: false,
    fee: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BoatRampFormData, string>>>({})

  // Uppdatera formuläret när plats hämtas
  if (location && formData.latitude === 0 && formData.longitude === 0) {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }))
  }

  const handleGetLocation = async () => {
    await refreshLocation()
  }

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BoatRampFormData, string>> = {}

    if (!formData.name) {
      newErrors.name = 'Namn krävs'
    }

    if (!formData.waterName) {
      newErrors.waterName = 'Vattennamn krävs'
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      newErrors.latitude = 'Position krävs'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label="Namn *"
        placeholder="ex. Torsås båtramp"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        error={errors.name}
      />

      <Input
        type="text"
        label="Vatten/Sjö *"
        placeholder="ex. Kalmarsund, Vättern..."
        value={formData.waterName}
        onChange={(e) => setFormData(prev => ({ ...prev, waterName: e.target.value }))}
        error={errors.waterName}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beskrivning
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Tillgänglighet, bredd, övrigt..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Plats */}
      <Card padding="sm" className="bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Position *</span>
          <div className="flex gap-2">
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
                  GPS
                </>
              )}
            </Button>
            <Button
              type="button"
              variant={showMap ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="w-4 h-4 mr-1" />
              Karta
            </Button>
          </div>
        </div>
        {formData.latitude !== 0 && formData.longitude !== 0 ? (
          <p className="text-sm text-gray-600">
            {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Ingen position angiven</p>
        )}
        {errors.latitude && (
          <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>
        )}
      </Card>

      {/* Kartväljare */}
      {showMap && (
        <LocationPicker
          latitude={formData.latitude !== 0 ? formData.latitude : null}
          longitude={formData.longitude !== 0 ? formData.longitude : null}
          onLocationChange={handleLocationChange}
        />
      )}

      {/* Checkboxar */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.parking}
            onChange={(e) => setFormData(prev => ({ ...prev, parking: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Parkering finns</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.fee}
            onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Avgift</span>
        </label>
      </div>

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
            'Spara båtramp'
          )}
        </Button>
      </div>
    </form>
  )
}
