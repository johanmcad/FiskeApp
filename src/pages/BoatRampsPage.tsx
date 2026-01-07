import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WaterMap, BoatRampMarker } from '@/components/map/WaterMap'
import { BoatRampForm } from '@/components/boat-ramps/BoatRampForm'
import { useBoatRamps } from '@/hooks/useBoatRamps'
import { fetchOSMBoatRampsNearby, OSMBoatRamp } from '@/lib/osm'
import { Plus, X, Loader2, Map as MapIcon, List } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'

type ViewMode = 'map' | 'list'

export function BoatRampsPage() {
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [osmRamps, setOsmRamps] = useState<OSMBoatRamp[]>([])
  const [loadingOSM, setLoadingOSM] = useState(false)
  const [osmError, setOsmError] = useState<string | null>(null)
  const { boatRamps, loading, addBoatRamp } = useBoatRamps()
  const { location } = useGeolocation()

  // Hämta OSM-båtramper när komponenten laddas
  const fetchOSMData = async () => {
    setLoadingOSM(true)
    setOsmError(null)
    try {
      // Om vi har användarens position, hämta nearby. Annars hämta för centrala Sverige
      const lat = location?.latitude || 59.3
      const lon = location?.longitude || 18.0
      const radiusKm = location ? 50 : 100 // Mindre radie för snabbare hämtning

      console.log(`Fetching boat ramps near ${lat}, ${lon} with radius ${radiusKm}km`)
      const data = await fetchOSMBoatRampsNearby(lat, lon, radiusKm)
      console.log(`Found ${data.length} OSM boat ramps`)
      setOsmRamps(data)
    } catch (error) {
      console.error('Failed to fetch OSM boat ramps:', error)
      setOsmError(error instanceof Error ? error.message : 'Kunde inte hämta data från OpenStreetMap')
    } finally {
      setLoadingOSM(false)
    }
  }

  useEffect(() => {
    fetchOSMData()
  }, [location])

  const handleSubmit = async (data: Parameters<typeof addBoatRamp>[0]) => {
    const result = await addBoatRamp(data)
    if (result) {
      setShowForm(false)
    }
  }

  // Kombinera OSM och användarramper för kartan
  const allBoatRamps: BoatRampMarker[] = [
    // Användarens egna ramper
    ...boatRamps.map(ramp => ({
      id: ramp.id,
      position: [ramp.latitude, ramp.longitude] as [number, number],
      name: ramp.name,
      waterName: ramp.waterName,
      parking: ramp.parking,
      fee: ramp.fee,
      description: ramp.description || undefined,
    })),
    // OSM ramper
    ...osmRamps.map(ramp => ({
      id: `osm-${ramp.id}`,
      position: [ramp.lat, ramp.lon] as [number, number],
      name: ramp.tags.name || ramp.tags['name:sv'] || 'Båtramp',
      waterName: undefined,
      parking: undefined,
      fee: ramp.tags.fee === 'yes',
      description: ramp.tags.description,
    })),
  ]

  // Beräkna kartcenter baserat på användarens position eller Sverige
  const mapCenter: [number, number] = location
    ? [location.latitude, location.longitude]
    : [62.5, 17.5]

  const mapZoom = location ? 10 : 5

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Båtramper</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'primary'}
            size="sm"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Stäng
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Lägg till
              </>
            )}
          </Button>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Karta
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>

        <div className="mt-2 text-sm">
          {loadingOSM ? (
            <span className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Hämtar båtramper från OpenStreetMap...
            </span>
          ) : osmError ? (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-700">{osmError}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchOSMData}
                className="ml-2"
              >
                Försök igen
              </Button>
            </div>
          ) : (
            <span className="text-gray-600">
              Visar {boatRamps.length} användarramper + {osmRamps.length} från OpenStreetMap
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 border-b bg-gray-50">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Lägg till ny båtramp</h2>
            <BoatRampForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <WaterMap
            center={mapCenter}
            zoom={mapZoom}
            boatRamps={allBoatRamps}
            className="h-full w-full"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : boatRamps.length === 0 && osmRamps.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-500">Inga båtramper hittades</p>
                <p className="text-sm text-gray-400 mt-1">
                  Lägg till din första eller ändra position för att se fler
                </p>
              </Card>
            ) : (
              <>
                {/* Användarens egna ramper */}
                {boatRamps.length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-900">Dina båtramper</h3>
                    {boatRamps.map((ramp) => (
                      <Card key={ramp.id} padding="sm">
                        <h4 className="font-semibold text-gray-900">{ramp.name}</h4>
                        <p className="text-sm text-gray-600">{ramp.waterName}</p>
                        {ramp.description && (
                          <p className="text-sm text-gray-500 mt-1">{ramp.description}</p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs">
                          {ramp.parking && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">🅿️ Parkering</span>}
                          {ramp.fee ? (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">💰 Avgift</span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🆓 Gratis</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </>
                )}

                {/* OSM ramper */}
                {osmRamps.length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-900 mt-4">
                      Från OpenStreetMap
                    </h3>
                    {osmRamps.map((ramp) => (
                      <Card key={ramp.id} padding="sm">
                        <h4 className="font-semibold text-gray-900">
                          {ramp.tags.name || ramp.tags['name:sv'] || 'Båtramp'}
                        </h4>
                        {ramp.tags.description && (
                          <p className="text-sm text-gray-500 mt-1">{ramp.tags.description}</p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs">
                          {ramp.tags.fee === 'yes' && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">💰 Avgift</span>
                          )}
                          {ramp.tags.fee === 'no' && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🆓 Gratis</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
