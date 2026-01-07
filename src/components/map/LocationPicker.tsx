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

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
  className?: string
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  className = '',
}: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Default center (Sverige)
    const defaultCenter: [number, number] = latitude && longitude
      ? [latitude, longitude]
      : [62.5, 17.5]

    const defaultZoom = latitude && longitude ? 10 : 5

    // Skapa kartan
    const map = L.map(containerRef.current).setView(defaultCenter, defaultZoom)
    mapRef.current = map

    // Lägg till OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    // Lägg till befintlig markör om position finns
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map)
    }

    // Hantera klick på kartan
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      // Ta bort gammal markör
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Lägg till ny markör
      markerRef.current = L.marker([lat, lng]).addTo(map)

      // Meddela ändring
      onLocationChange(lat, lng)
    })

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Uppdatera markör när position ändras utifrån (t.ex. GPS)
  useEffect(() => {
    if (!mapRef.current) return

    if (latitude && longitude) {
      // Ta bort gammal markör
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Lägg till ny markör
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current)

      // Centrera kartan på nya positionen
      mapRef.current.setView([latitude, longitude], 10)
    }
  }, [latitude, longitude])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="w-full h-64 rounded-lg border border-gray-300"
      />
      <p className="text-xs text-gray-500 mt-1">
        Klicka på kartan för att välja position
      </p>
    </div>
  )
}
