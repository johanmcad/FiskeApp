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
    [out:json][timeout:25];
    (
      node["leisure"="slipway"](${south},${west},${north},${east});
      way["leisure"="slipway"](${south},${west},${north},${east});
    );
    out center;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Overpass API')
    }

    const data: OverpassResponse = await response.json()

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
