import { WeatherData } from '@/types'

interface SMHIForecastPoint {
  validTime: string
  parameters: Array<{
    name: string
    values: number[]
  }>
}

interface SMHIResponse {
  timeSeries: SMHIForecastPoint[]
}

// SMHI parameter mappningar
const SMHI_PARAMS = {
  t: 'temperature',      // Temperatur (°C)
  ws: 'windSpeed',       // Vindhastighet (m/s)
  wd: 'windDirection',   // Vindriktning (grader)
  msl: 'pressure',       // Lufttryck (hPa)
  r: 'humidity',         // Relativ luftfuktighet (%)
  Wsymb2: 'symbol',      // Väderymbol
}

// Väderymboler från SMHI
const WEATHER_SYMBOLS: Record<number, string> = {
  1: 'Klart',
  2: 'Lätt molnighet',
  3: 'Halvklart',
  4: 'Molnigt',
  5: 'Mycket moln',
  6: 'Mulet',
  7: 'Dimma',
  8: 'Lätt regnskur',
  9: 'Regnskur',
  10: 'Kraftig regnskur',
  11: 'Åskväder',
  12: 'Lätt snöblandat regn',
  13: 'Snöblandat regn',
  14: 'Kraftigt snöblandat regn',
  15: 'Lätt snöfall',
  16: 'Snöfall',
  17: 'Kraftigt snöfall',
  18: 'Lätt regn',
  19: 'Regn',
  20: 'Kraftigt regn',
  21: 'Åska',
  22: 'Lätt snöblandat regn',
  23: 'Snöblandat regn',
  24: 'Kraftigt snöblandat regn',
  25: 'Lätt snöfall',
  26: 'Snöfall',
  27: 'Kraftigt snöfall',
}

export async function fetchWeatherFromSMHI(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // SMHI kräver koordinater avrundade till 6 decimaler
    const roundedLat = Math.round(lat * 1000000) / 1000000
    const roundedLon = Math.round(lon * 1000000) / 1000000

    const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${roundedLon}/lat/${roundedLat}/data.json`

    const response = await fetch(url)

    if (!response.ok) {
      console.error('SMHI API error:', response.status)
      return null
    }

    const data: SMHIResponse = await response.json()

    // Hämta närmaste tidpunkt (första i serien är nu)
    const currentForecast = data.timeSeries[0]

    if (!currentForecast) return null

    const params: Record<string, number> = {}

    for (const param of currentForecast.parameters) {
      if (param.name in SMHI_PARAMS) {
        params[param.name] = param.values[0]
      }
    }

    return {
      temperature: params.t ?? 0,
      windSpeed: params.ws ?? 0,
      windDirection: params.wd ?? 0,
      conditions: WEATHER_SYMBOLS[params.Wsymb2] ?? 'Okänt',
      pressure: params.msl ?? 0,
      humidity: params.r ?? 0,
    }
  } catch (error) {
    console.error('Error fetching weather from SMHI:', error)
    return null
  }
}

// Backup: OpenWeatherMap (kräver API-nyckel)
export async function fetchWeatherFromOpenWeatherMap(
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=se`

    const response = await fetch(url)

    if (!response.ok) {
      console.error('OpenWeatherMap API error:', response.status)
      return null
    }

    const data = await response.json()

    return {
      temperature: data.main.temp,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg ?? 0,
      conditions: data.weather[0]?.description ?? 'Okänt',
      pressure: data.main.pressure,
      humidity: data.main.humidity,
    }
  } catch (error) {
    console.error('Error fetching weather from OpenWeatherMap:', error)
    return null
  }
}

// Huvudfunktion som provar SMHI först, sedan OpenWeatherMap
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  // Prova SMHI först (gratis, ingen nyckel krävs)
  const smhiWeather = await fetchWeatherFromSMHI(lat, lon)
  if (smhiWeather) return smhiWeather

  // Fallback till OpenWeatherMap om API-nyckel finns
  const openWeatherKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
  if (openWeatherKey) {
    return fetchWeatherFromOpenWeatherMap(lat, lon, openWeatherKey)
  }

  return null
}
