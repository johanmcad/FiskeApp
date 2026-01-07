import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { loadNavionicsScript, createNavionicsOverlay, isNavionicsConfigured } from '@/lib/navionics'

// Fix för Leaflet marker-ikoner
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Skapa en blå ikon för båtramper
const boatRampIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#2563eb" stroke="#1e40af" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.4 12.5 28.5 12.5 28.5S25 20.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="7" fill="white"/>
      <path fill="#2563eb" d="M12.5 6 L9 10 L11 10 L11 14 L14 14 L14 10 L16 10 Z"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

L.Marker.prototype.options.icon = defaultIcon

interface MapMarker {
  id: string
  position: [number, number]
  title: string
  description?: string
  popupHtml?: string
}

export interface BoatRampMarker {
  id: string
  position: [number, number]
  name: string
  waterName?: string
  parking?: boolean
  fee?: boolean
  description?: string
}

interface WaterMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  boatRamps?: BoatRampMarker[]
  onMarkerClick?: (id: string) => void
  onBoatRampClick?: (id: string) => void
  onMapMove?: (center: [number, number], zoom: number) => void
  className?: string
  showDepthChart?: boolean
  depthChartType?: 'nautical' | 'sonar'
}

export function WaterMap({
  center = [62.5, 17.5],
  zoom = 5,
  markers = [],
  boatRamps = [],
  onMarkerClick,
  onBoatRampClick,
  onMapMove,
  className = '',
  showDepthChart = false,
  depthChartType = 'sonar',
}: WaterMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navionicsOverlayRef = useRef<ReturnType<typeof createNavionicsOverlay> | null>(null)
  const osmLayerRef = useRef<L.TileLayer | null>(null)
  const [depthChartError, setDepthChartError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Skapa kartan
    mapRef.current = L.map(containerRef.current).setView(center, zoom)

    // Lägg till OpenStreetMap som baslager
    osmLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    osmLayerRef.current.addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      navionicsOverlayRef.current = null
      osmLayerRef.current = null
    }
  }, [])

  // Uppdatera center och zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Lyssna på kartans förflyttning och zoom
  useEffect(() => {
    if (!mapRef.current || !onMapMove) return

    const handleMoveEnd = () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter()
        const zoom = mapRef.current.getZoom()
        onMapMove([center.lat, center.lng], zoom)
      }
    }

    mapRef.current.on('moveend', handleMoveEnd)

    return () => {
      mapRef.current?.off('moveend', handleMoveEnd)
    }
  }, [onMapMove])

  // Hantera djupkarta
  useEffect(() => {
    if (!mapRef.current) return

    const toggleDepthChart = async () => {
      if (showDepthChart && isNavionicsConfigured()) {
        try {
          setDepthChartError(null)

          // Ladda Navionics script om det inte redan är laddat
          await loadNavionicsScript()

          // Ta bort OSM-lagret
          if (osmLayerRef.current) {
            mapRef.current?.removeLayer(osmLayerRef.current)
          }

          // Ta bort gammal overlay om den finns
          if (navionicsOverlayRef.current) {
            navionicsOverlayRef.current.remove()
          }

          // Skapa och lägg till Navionics overlay
          navionicsOverlayRef.current = createNavionicsOverlay(depthChartType)
          navionicsOverlayRef.current.addTo(mapRef.current!)
        } catch (error) {
          console.error('Kunde inte ladda djupkarta:', error)
          setDepthChartError(error instanceof Error ? error.message : 'Kunde inte ladda djupkarta')

          // Återställ OSM-lagret vid fel
          if (osmLayerRef.current && mapRef.current) {
            osmLayerRef.current.addTo(mapRef.current)
          }
        }
      } else {
        // Ta bort Navionics overlay
        if (navionicsOverlayRef.current) {
          navionicsOverlayRef.current.remove()
          navionicsOverlayRef.current = null
        }

        // Lägg tillbaka OSM-lagret
        if (osmLayerRef.current && mapRef.current) {
          if (!mapRef.current.hasLayer(osmLayerRef.current)) {
            osmLayerRef.current.addTo(mapRef.current)
          }
        }
      }
    }

    toggleDepthChart()
  }, [showDepthChart, depthChartType])

  // Uppdatera markers
  useEffect(() => {
    if (!mapRef.current) return

    // Ta bort gamla markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Lägg till nya markers (fångster, fiskevatten, etc.)
    markers.forEach((marker) => {
      const popupContent = marker.popupHtml ||
        `<b>${marker.title}</b>${marker.description ? `<br/>${marker.description}` : ''}`

      const m = L.marker(marker.position)
        .addTo(mapRef.current!)
        .bindPopup(popupContent, { maxWidth: 300 })

      if (onMarkerClick) {
        m.on('click', () => onMarkerClick(marker.id))
      }
    })

    // Lägg till båtramper med egen ikon
    boatRamps.forEach((ramp) => {
      const popupContent = `
        <div style="min-width: 200px;">
          <b>${ramp.name}</b>
          ${ramp.waterName ? `<br/><small>${ramp.waterName}</small>` : ''}
          ${ramp.description ? `<br/><br/>${ramp.description}` : ''}
          <br/><br/>
          <div style="display: flex; gap: 8px; font-size: 12px;">
            ${ramp.parking ? '<span>🅿️ Parkering</span>' : ''}
            ${ramp.fee ? '<span>💰 Avgift</span>' : '<span>🆓 Gratis</span>'}
          </div>
        </div>
      `

      const m = L.marker(ramp.position, { icon: boatRampIcon })
        .addTo(mapRef.current!)
        .bindPopup(popupContent, { maxWidth: 300 })

      if (onBoatRampClick) {
        m.on('click', () => onBoatRampClick(ramp.id))
      }
    })
  }, [markers, boatRamps, onMarkerClick, onBoatRampClick])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className={className}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      />
      {depthChartError && (
        <div className="absolute top-2 left-2 right-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm z-[1000]">
          {depthChartError}
        </div>
      )}
    </div>
  )
}
