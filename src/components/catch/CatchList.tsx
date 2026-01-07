import { Catch } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { fishSpecies } from '@/data/fishSpecies'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Trash2, MapPin, Cloud, Scale, Ruler, Globe, Lock } from 'lucide-react'

interface CatchListProps {
  catches: Catch[]
  onDelete?: (id: string) => void
  loading?: boolean
}

export function CatchList({ catches, onDelete, loading }: CatchListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (catches.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500">Inga fångster registrerade ännu</p>
        <p className="text-sm text-gray-400 mt-1">Tryck på + för att lägga till din första</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {catches.map((c) => {
        const species = fishSpecies.find(s => s.id === c.species)

        return (
          <Card key={c.id} className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {species?.swedishName || c.species}
                  </h3>
                  {c.isPublic ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {format(new Date(c.caughtAt), "d MMMM yyyy 'kl.' HH:mm", { locale: sv })}
                </p>

                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  {c.lengthCm && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {c.lengthCm} cm
                    </span>
                  )}
                  {c.weightGrams && (
                    <span className="flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      {c.weightGrams >= 1000
                        ? `${(c.weightGrams / 1000).toFixed(2)} kg`
                        : `${c.weightGrams} g`}
                    </span>
                  )}
                  {c.waterName && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {c.waterName}
                    </span>
                  )}
                  {c.weatherTemp !== null && (
                    <span className="flex items-center gap-1">
                      <Cloud className="w-4 h-4" />
                      {c.weatherTemp.toFixed(1)}°C
                    </span>
                  )}
                </div>

                {c.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{c.notes}"</p>
                )}
              </div>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(c.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
