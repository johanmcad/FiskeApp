import { WeatherData } from '@/types'
import { Cloud, Wind, Droplets, Gauge } from 'lucide-react'

interface WeatherDisplayProps {
  weather: WeatherData
  compact?: boolean
}

export function WeatherDisplay({ weather, compact = false }: WeatherDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Cloud className="w-4 h-4" />
          {weather.temperature.toFixed(1)}°C
        </span>
        <span className="flex items-center gap-1">
          <Wind className="w-4 h-4" />
          {weather.windSpeed.toFixed(1)} m/s
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        <Cloud className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Temperatur</p>
          <p className="font-medium">{weather.temperature.toFixed(1)}°C</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700">
        <Wind className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Vind</p>
          <p className="font-medium">{weather.windSpeed.toFixed(1)} m/s</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700">
        <Droplets className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Luftfuktighet</p>
          <p className="font-medium">{weather.humidity}%</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700">
        <Gauge className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Lufttryck</p>
          <p className="font-medium">{weather.pressure.toFixed(0)} hPa</p>
        </div>
      </div>

      <div className="col-span-2 text-center pt-2 border-t">
        <p className="text-gray-600">{weather.conditions}</p>
      </div>
    </div>
  )
}
