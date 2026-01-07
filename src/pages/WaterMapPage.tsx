import { useState, useMemo } from 'react'
import { WaterMap } from '@/components/map/WaterMap'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, MapPin, ExternalLink, Navigation, Fish, Map } from 'lucide-react'
import { usePublicCatches } from '@/hooks/usePublicCatches'
import { useCatches } from '@/hooks/useCatches'
import { useAuth } from '@/hooks/useAuth'
import { fishSpecies } from '@/data/fishSpecies'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

// Exempel på populära fiskevatten
const POPULAR_WATERS = [
  { id: '1', name: 'Vänern', lat: 58.9, lon: 13.1, type: 'Sjö' },
  { id: '2', name: 'Vättern', lat: 58.4, lon: 14.6, type: 'Sjö' },
  { id: '3', name: 'Mälaren', lat: 59.4, lon: 17.0, type: 'Sjö' },
  { id: '4', name: 'Storsjön', lat: 63.2, lon: 14.4, type: 'Sjö' },
  { id: '5', name: 'Siljan', lat: 60.9, lon: 14.8, type: 'Sjö' },
  { id: '6', name: 'Hjälmaren', lat: 59.2, lon: 15.8, type: 'Sjö' },
  { id: '7', name: 'Dalälven', lat: 60.4, lon: 17.4, type: 'Älv' },
  { id: '8', name: 'Klarälven', lat: 59.9, lon: 13.3, type: 'Älv' },
]

type ViewMode = 'waters' | 'catches'

export function WaterMapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWater, setSelectedWater] = useState<typeof POPULAR_WATERS[0] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([62.5, 17.5])
  const [mapZoom, setMapZoom] = useState(5)
  const [viewMode, setViewMode] = useState<ViewMode>('catches')

  const { catches: publicCatches } = usePublicCatches()
  const { catches: myCatches } = useCatches()
  const { isConfigured } = useAuth()

  const filteredWaters = POPULAR_WATERS.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectWater = (water: typeof POPULAR_WATERS[0]) => {
    setSelectedWater(water)
    setMapCenter([water.lat, water.lon])
    setMapZoom(9)
  }

  const openInNavionics = () => {
    window.open(`https://webapp.navionics.com/#boating@8&key=gf%60tJmltfC`, '_blank')
  }

  const openInEniro = (name: string) => {
    window.open(`https://kartor.eniro.se/?q=${encodeURIComponent(name)}`, '_blank')
  }

  // Kombinera mina och publika fångster, ta bort dubbletter
  const allCatches = useMemo(() => {
    const publicIds = new Set(publicCatches.map(c => c.id))
    const uniqueMine = myCatches.filter(c => !publicIds.has(c.id))
    return [...uniqueMine, ...publicCatches]
  }, [myCatches, publicCatches])

  // Konvertera fångster till kartmarkörer
  const catchMarkers = useMemo(() => {
    return allCatches
      .filter(c => c.latitude && c.longitude)
      .map(c => {
        const species = fishSpecies.find(s => s.id === c.species)
        const speciesName = species?.swedishName || c.species
        const dateStr = format(new Date(c.caughtAt), "d MMM yyyy", { locale: sv })

        // Skapa HTML för popup med bild
        const popupHtml = `
          <div style="min-width: 200px;">
            ${c.photoUrl ? `<img src="${c.photoUrl}" alt="${speciesName}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
            <div style="font-weight: 600; font-size: 14px;">${speciesName}</div>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">${dateStr}</div>
            ${c.waterName ? `<div style="font-size: 12px; color: #666;">${c.waterName}</div>` : ''}
            <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: #444;">
              ${c.lengthCm ? `<span>${c.lengthCm} cm</span>` : ''}
              ${c.weightGrams ? `<span>${c.weightGrams >= 1000 ? (c.weightGrams / 1000).toFixed(2) + ' kg' : c.weightGrams + ' g'}</span>` : ''}
            </div>
            ${c.notes ? `<div style="font-size: 11px; color: #888; margin-top: 6px; font-style: italic;">"${c.notes}"</div>` : ''}
          </div>
        `

        return {
          id: c.id,
          position: [c.latitude!, c.longitude!] as [number, number],
          title: speciesName,
          description: dateStr,
          popupHtml,
        }
      })
  }, [allCatches])

  // Markörer för vatten
  const waterMarkers = selectedWater ? [{
    id: selectedWater.id,
    position: [selectedWater.lat, selectedWater.lon] as [number, number],
    title: selectedWater.name,
    description: selectedWater.type,
  }] : []

  const displayMarkers = viewMode === 'catches' ? catchMarkers : waterMarkers

  return (
    <div className="h-full flex flex-col">
      {/* Sökfält */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Sök sjö eller vattendrag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Snabbval */}
        {searchQuery && filteredWaters.length > 0 && (
          <div className="absolute z-20 left-4 right-4 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredWaters.map((water) => (
              <button
                key={water.id}
                onClick={() => {
                  handleSelectWater(water)
                  setSearchQuery('')
                  setViewMode('waters')
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{water.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{water.type}</span>
              </button>
            ))}
          </div>
        )}

        {/* Vy-växlare */}
        {isConfigured && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setViewMode('catches')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'catches'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Fish className="w-4 h-4" />
              Fångster ({catchMarkers.length})
            </button>
            <button
              onClick={() => setViewMode('waters')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'waters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              Fiskevatten
            </button>
          </div>
        )}
      </div>

      {/* Karta */}
      <div className="flex-1 relative">
        <WaterMap
          center={mapCenter}
          zoom={mapZoom}
          markers={displayMarkers}
          className="h-full"
        />

        {/* Info-panel för vatten */}
        {viewMode === 'waters' && selectedWater && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedWater.name}</h3>
                  <p className="text-sm text-gray-500">{selectedWater.type}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedWater.lat.toFixed(4)}, {selectedWater.lon.toFixed(4)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWater(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInNavionics()}
                  className="flex-1"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Djupkarta
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInEniro(selectedWater.name)}
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Eniro
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Info för fångstvy */}
        {viewMode === 'catches' && catchMarkers.length === 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="text-center py-4">
              <Fish className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Inga fångster med platsdata ännu</p>
              <p className="text-gray-400 text-xs mt-1">Registrera fångster med GPS för att se dem på kartan</p>
            </Card>
          </div>
        )}
      </div>

      {/* Populära vatten (om inget valt och i vattenläge) */}
      {viewMode === 'waters' && !selectedWater && (
        <div className="p-4 bg-white border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Populära fiskevatten</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {POPULAR_WATERS.slice(0, 5).map((water) => (
              <button
                key={water.id}
                onClick={() => handleSelectWater(water)}
                className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100"
              >
                {water.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
