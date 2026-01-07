import { useState } from 'react'
import { WaterMap } from '@/components/map/WaterMap'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, MapPin, ExternalLink, Navigation } from 'lucide-react'

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

export function WaterMapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWater, setSelectedWater] = useState<typeof POPULAR_WATERS[0] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([62.5, 17.5])
  const [mapZoom, setMapZoom] = useState(5)

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
      </div>

      {/* Karta */}
      <div className="flex-1 relative">
        <WaterMap
          center={mapCenter}
          zoom={mapZoom}
          markers={selectedWater ? [{
            id: selectedWater.id,
            position: [selectedWater.lat, selectedWater.lon],
            title: selectedWater.name,
            description: selectedWater.type,
          }] : []}
          className="h-full"
        />

        {/* Info-panel */}
        {selectedWater && (
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
      </div>

      {/* Populära vatten (om inget valt) */}
      {!selectedWater && (
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
