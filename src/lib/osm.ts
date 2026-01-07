// OpenStreetMap Overpass API integration för båtramper

export interface OSMBoatRamp {
  id: number
  lat: number
  lon: number
  tags: {
    name?: string
    'name:sv'?: string
    access?: string
    fee?: string
    surface?: string
    description?: string
    [key: string]: string | undefined
  }
}

interface OverpassResponse {
  elements: Array<{
    type: 'node' | 'way'
    id: number
    lat?: number
    lon?: number
    center?: { lat: number; lon: number }
    tags?: Record<string, string>
  }>
}

/**
 * Hämta båtramper från OpenStreetMap inom ett geografiskt område
 * @param bounds - [south, west, north, east] i decimalgrader
 * @returns Array av båtramper
 */
export async function fetchOSMBoatRamps(
  bounds: [number, number, number, number]
): Promise<OSMBoatRamp[]> {
  const [south, west, north, east] = bounds

  // Overpass API query för att hämta slipways (båtramper)
  const query = `
    [out:json][timeout:10];
    (
      node["leisure"="slipway"](${south},${west},${north},${east});
      way["leisure"="slipway"](${south},${west},${north},${east});
    );
    out center;
  `

  try {
    // Skapa en AbortController för fetch timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 sekunder timeout

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Overpass API error:', errorText)
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
    }

    const data: OverpassResponse = await response.json()
    console.log('Overpass API response:', data)

    return data.elements.map((element) => {
      // För ways, använd center; för nodes, använd lat/lon
      const lat = element.type === 'way' ? element.center!.lat : element.lat!
      const lon = element.type === 'way' ? element.center!.lon : element.lon!

      return {
        id: element.id,
        lat,
        lon,
        tags: element.tags || {},
      }
    })
  } catch (error) {
    console.error('Error fetching OSM boat ramps:', error)

    // Hantera timeout specifikt
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: Försök med mindre område eller försök igen senare')
    }

    throw error
  }
}

/**
 * Hämta båtramper runt en punkt med en radie
 * @param lat - Latitud
 * @param lon - Longitud
 * @param radiusKm - Radie i kilometer
 */
export async function fetchOSMBoatRampsNearby(
  lat: number,
  lon: number,
  radiusKm: number = 50
): Promise<OSMBoatRamp[]> {
  // Konvertera km till ungefärliga grader (1 grad ≈ 111 km)
  const radiusDeg = radiusKm / 111

  const bounds: [number, number, number, number] = [
    lat - radiusDeg, // south
    lon - radiusDeg, // west
    lat + radiusDeg, // north
    lon + radiusDeg, // east
  ]

  return fetchOSMBoatRamps(bounds)
}

/**
 * Hämta båtramper för hela Sverige
 * Detta kan ta lite tid, använd med försiktighet
 */
export async function fetchOSMBoatRampsSweden(): Promise<OSMBoatRamp[]> {
  // Sveriges ungefärliga bounding box
  const bounds: [number, number, number, number] = [
    55.0, // south
    10.5, // west
    69.5, // north
    24.5, // east
  ]

  return fetchOSMBoatRamps(bounds)
}
