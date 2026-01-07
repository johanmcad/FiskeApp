import { useState } from 'react'
import { CatchFormData, WeatherData } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CatchForm } from '@/components/catch/CatchForm'
import { CatchList } from '@/components/catch/CatchList'
import { useCatches } from '@/hooks/useCatches'
import { Plus, X } from 'lucide-react'

export function CatchLogPage() {
  const [showForm, setShowForm] = useState(false)
  const { catches, loading, addCatch, deleteCatch } = useCatches()

  const handleSubmit = async (data: CatchFormData, weather?: WeatherData) => {
    const result = await addCatch(data, weather ? {
      temp: weather.temperature,
      wind: weather.windSpeed,
      conditions: weather.conditions,
      pressure: weather.pressure,
    } : undefined)

    if (result) {
      setShowForm(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Är du säker på att du vill ta bort denna fångst?')) {
      await deleteCatch(id)
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Fångstlogg</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'primary'}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Stäng
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Ny fångst
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h2 className="text-lg font-semibold mb-4">Registrera ny fångst</h2>
          <CatchForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Dina fångster ({catches.length})
        </h2>
        <CatchList
          catches={catches}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}
