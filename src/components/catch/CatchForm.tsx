import { useState, useEffect, useRef } from 'react'
import { CatchFormData, WeatherData, Catch } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SpeciesSelect } from './SpeciesSelect'
import { WeatherDisplay } from '@/components/weather/WeatherDisplay'
import { LocationPicker } from '@/components/map/LocationPicker'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useWeather } from '@/hooks/useWeather'
import { MapPin, Loader2, Camera, ImagePlus, X, Map } from 'lucide-react'

interface CatchFormProps {
  onSubmit: (data: CatchFormData, weather?: WeatherData) => Promise<void>
  onCancel?: () => void
  initialData?: Catch | null
}

export function CatchForm({ onSubmit, onCancel, initialData }: CatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const { location, loading: geoLoading, refresh: refreshLocation } = useGeolocation()
  const { weather, loading: weatherLoading, refresh: refreshWeather } = useWeather()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.photoUrl || null)

  const [formData, setFormData] = useState<CatchFormData>({
    species: initialData?.species || '',
    lengthCm: initialData?.lengthCm || null,
    weightGrams: initialData?.weightGrams || null,
    caughtAt: initialData?.caughtAt.slice(0, 16) || new Date().toISOString().slice(0, 16),
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    waterName: initialData?.waterName || '',
    notes: initialData?.notes || '',
    isPublic: initialData?.isPublic ?? true,
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

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
    // Hämta väder för den nya platsen
    refreshWeather(lat, lng)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validera filtyp
      if (!file.type.startsWith('image/')) {
        alert('Välj en bildfil')
        return
      }
      // Validera storlek (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Bilden får max vara 5MB')
        return
      }

      setFormData(prev => ({ ...prev, photo: file }))

      // Skapa preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    setImagePreview(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
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

      {/* Bilduppladdning */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foto
        </label>
        {/* Kamera-input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />
        {/* Galleri-input */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 active:bg-blue-50 transition-colors"
            >
              <Camera className="w-10 h-10" />
              <span className="text-sm font-medium">Ta foto</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 active:bg-blue-50 transition-colors"
            >
              <ImagePlus className="w-10 h-10" />
              <span className="text-sm font-medium">Välj bild</span>
            </button>
          </div>
        )}
      </div>

      {/* Plats */}
      <Card padding="sm" className="bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Position</span>
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
        {formData.latitude && formData.longitude ? (
          <p className="text-sm text-gray-600">
            {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Ingen position angiven</p>
        )}
      </Card>

      {/* Kartväljare */}
      {showMap && (
        <LocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={handleLocationChange}
        />
      )}

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
              {initialData ? 'Uppdaterar...' : 'Sparar...'}
            </>
          ) : (
            initialData ? 'Uppdatera fångst' : 'Spara fångst'
          )}
        </Button>
      </div>
    </form>
  )
}
