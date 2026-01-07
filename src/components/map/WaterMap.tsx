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

L.Marker.prototype.options.icon = defaultIcon

interface MapMarker {
  id: string
  position: [number, number]
  title: string
  description?: string
  popupHtml?: string
}

interface WaterMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  className?: string
  showDepthChart?: boolean
  depthChartType?: 'nautical' | 'sonar'
}

export function WaterMap({
  center = [62.5, 17.5],
  zoom = 5,
  markers = [],
  onMarkerClick,
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

    // Lägg till nya markers
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
  }, [markers, onMarkerClick])

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
