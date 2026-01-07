import { useState, useMemo } from 'react'
import { WaterMap } from '@/components/map/WaterMap'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, MapPin, ExternalLink, Navigation, Fish, Map, Ticket, Waves } from 'lucide-react'
import { usePublicCatches } from '@/hooks/usePublicCatches'
import { useCatches } from '@/hooks/useCatches'
import { useAuth } from '@/hooks/useAuth'
import { fishSpecies } from '@/data/fishSpecies'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { isNavionicsConfigured } from '@/lib/navionics'

// Populära fiskevatten i Sverige
const POPULAR_WATERS = [
  // Stora sjöar
  { id: '1', name: 'Vänern', lat: 58.9, lon: 13.1, type: 'Sjö' },
  { id: '2', name: 'Vättern', lat: 58.4, lon: 14.6, type: 'Sjö' },
  { id: '3', name: 'Mälaren', lat: 59.4, lon: 17.0, type: 'Sjö' },
  { id: '4', name: 'Hjälmaren', lat: 59.2, lon: 15.8, type: 'Sjö' },
  { id: '5', name: 'Storsjön', lat: 63.2, lon: 14.4, type: 'Sjö' },
  { id: '6', name: 'Siljan', lat: 60.9, lon: 14.8, type: 'Sjö' },
  { id: '7', name: 'Hornavan', lat: 66.2, lon: 17.6, type: 'Sjö' },
  { id: '8', name: 'Torneträsk', lat: 68.4, lon: 19.8, type: 'Sjö' },
  { id: '9', name: 'Stor-Avvakko', lat: 67.1, lon: 20.5, type: 'Sjö' },
  { id: '10', name: 'Uddjaure', lat: 66.1, lon: 17.3, type: 'Sjö' },
  { id: '11', name: 'Bolmen', lat: 56.9, lon: 13.7, type: 'Sjö' },
  { id: '12', name: 'Åsnen', lat: 56.6, lon: 14.7, type: 'Sjö' },
  { id: '13', name: 'Roxen', lat: 58.5, lon: 15.7, type: 'Sjö' },
  { id: '14', name: 'Glan', lat: 58.6, lon: 16.0, type: 'Sjö' },
  { id: '15', name: 'Sommen', lat: 58.1, lon: 15.1, type: 'Sjö' },
  { id: '16', name: 'Fegen', lat: 57.2, lon: 13.2, type: 'Sjö' },
  { id: '17', name: 'Unden', lat: 58.7, lon: 14.4, type: 'Sjö' },
  { id: '18', name: 'Ivösjön', lat: 56.1, lon: 14.5, type: 'Sjö' },
  { id: '19', name: 'Ringsjön', lat: 55.9, lon: 13.5, type: 'Sjö' },
  { id: '20', name: 'Immeln', lat: 56.3, lon: 14.3, type: 'Sjö' },
  // Älvar och åar
  { id: '21', name: 'Dalälven', lat: 60.6, lon: 17.4, type: 'Älv' },
  { id: '22', name: 'Klarälven', lat: 59.9, lon: 13.3, type: 'Älv' },
  { id: '23', name: 'Ljusnan', lat: 61.7, lon: 16.1, type: 'Älv' },
  { id: '24', name: 'Indalsälven', lat: 62.5, lon: 17.3, type: 'Älv' },
  { id: '25', name: 'Ångermanälven', lat: 63.3, lon: 17.9, type: 'Älv' },
  { id: '26', name: 'Umeälven', lat: 63.8, lon: 20.2, type: 'Älv' },
  { id: '27', name: 'Skellefteälven', lat: 64.7, lon: 20.9, type: 'Älv' },
  { id: '28', name: 'Piteälven', lat: 65.3, lon: 21.4, type: 'Älv' },
  { id: '29', name: 'Luleälven', lat: 65.6, lon: 22.0, type: 'Älv' },
  { id: '30', name: 'Kalixälven', lat: 66.0, lon: 23.1, type: 'Älv' },
  { id: '31', name: 'Torneälven', lat: 66.4, lon: 23.8, type: 'Älv' },
  { id: '32', name: 'Emån', lat: 57.1, lon: 16.4, type: 'Å' },
  { id: '33', name: 'Mörrumsån', lat: 56.2, lon: 14.7, type: 'Å' },
  { id: '34', name: 'Lagan', lat: 56.5, lon: 13.0, type: 'Å' },
  { id: '35', name: 'Nissan', lat: 56.7, lon: 12.9, type: 'Å' },
  { id: '36', name: 'Ätran', lat: 57.1, lon: 12.3, type: 'Å' },
  { id: '37', name: 'Viskan', lat: 57.5, lon: 12.3, type: 'Å' },
  { id: '38', name: 'Göta älv', lat: 58.3, lon: 12.3, type: 'Älv' },
  // Kust
  { id: '39', name: 'Stockholms skärgård', lat: 59.3, lon: 18.9, type: 'Kust' },
  { id: '40', name: 'Göteborgs skärgård', lat: 57.7, lon: 11.8, type: 'Kust' },
  { id: '41', name: 'Blekinge skärgård', lat: 56.1, lon: 15.6, type: 'Kust' },
  { id: '42', name: 'Öresund', lat: 55.9, lon: 12.7, type: 'Kust' },
  { id: '43', name: 'Kalmarsund', lat: 56.7, lon: 16.4, type: 'Kust' },
  { id: '44', name: 'Höga kusten', lat: 63.0, lon: 18.4, type: 'Kust' },
]

type ViewMode = 'waters' | 'catches'

export function WaterMapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWater, setSelectedWater] = useState<typeof POPULAR_WATERS[0] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([62.5, 17.5])
  const [mapZoom, setMapZoom] = useState(5)
  const [viewMode, setViewMode] = useState<ViewMode>('catches')
  const [showDepthChart, setShowDepthChart] = useState(false)
  const [depthChartType, setDepthChartType] = useState<'nautical' | 'sonar'>('sonar')

  const { catches: publicCatches } = usePublicCatches()
  const { catches: myCatches } = useCatches()
  const { isConfigured } = useAuth()
  const navionicsAvailable = isNavionicsConfigured()

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

  const openIniFiske = (name: string) => {
    window.open(`https://www.ifiske.se/index.php/fiskekortswebshop?search=${encodeURIComponent(name)}`, '_blank')
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

  // Markörer för alla fiskevatten
  const waterMarkers = useMemo(() => {
    return POPULAR_WATERS.map(water => ({
      id: water.id,
      position: [water.lat, water.lon] as [number, number],
      title: water.name,
      description: water.type,
    }))
  }, [])

  const handleWaterMarkerClick = (id: string) => {
    const water = POPULAR_WATERS.find(w => w.id === id)
    if (water) {
      setSelectedWater(water)
    }
  }

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
          onMarkerClick={viewMode === 'waters' ? handleWaterMarkerClick : undefined}
          showDepthChart={showDepthChart}
          depthChartType={depthChartType}
          className="h-full"
        />

        {/* Djupkarta-toggle */}
        {navionicsAvailable && (
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col gap-1">
              <button
                onClick={() => setShowDepthChart(!showDepthChart)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  showDepthChart
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Visa djupkarta"
              >
                <Waves className="w-4 h-4" />
                Djupkarta
              </button>
              {showDepthChart && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setDepthChartType('sonar')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      depthChartType === 'sonar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Sonar
                  </button>
                  <button
                    onClick={() => setDepthChartType('nautical')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      depthChartType === 'nautical'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Sjökort
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

              <div className="flex flex-col gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openIniFiske(selectedWater.name)}
                  className="w-full"
                >
                  <Ticket className="w-4 h-4 mr-1" />
                  Köp fiskekort
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInNavionics()}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Djupkarta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInEniro(selectedWater.name)}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Eniro
                  </Button>
                </div>
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
