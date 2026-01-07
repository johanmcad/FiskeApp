import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
}

interface WaterMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  className?: string
}

export function WaterMap({
  center = [62.5, 17.5],
  zoom = 5,
  markers = [],
  onMarkerClick,
  className = '',
}: WaterMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Skapa kartan
    mapRef.current = L.map(containerRef.current).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Uppdatera center och zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

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
      const m = L.marker(marker.position)
        .addTo(mapRef.current!)
        .bindPopup(`<b>${marker.title}</b>${marker.description ? `<br/>${marker.description}` : ''}`)

      if (onMarkerClick) {
        m.on('click', () => onMarkerClick(marker.id))
      }
    })
  }, [markers, onMarkerClick])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    />
  )
}
