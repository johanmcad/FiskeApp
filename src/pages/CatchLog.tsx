import { useState } from 'react'
import { CatchFormData, WeatherData } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CatchForm } from '@/components/catch/CatchForm'
import { CatchList } from '@/components/catch/CatchList'
import { useCatches } from '@/hooks/useCatches'
import { usePublicCatches } from '@/hooks/usePublicCatches'
import { useAuth } from '@/hooks/useAuth'
import { Plus, X, Users, User } from 'lucide-react'

type Tab = 'mine' | 'public'

export function CatchLogPage() {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('mine')
  const { catches, loading, addCatch, deleteCatch } = useCatches()
  const { catches: publicCatches, loading: publicLoading } = usePublicCatches()
  const { user, isConfigured } = useAuth()

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

  const displayCatches = activeTab === 'mine' ? catches : publicCatches
  const displayLoading = activeTab === 'mine' ? loading : publicLoading
  const isOwnCatch = (userId: string) => user?.id === userId

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Fångstlogg</h1>
        {activeTab === 'mine' && (
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
        )}
      </div>

      {/* Flikar */}
      {isConfigured && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mine'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            Mina fångster
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'public'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Alla publika
          </button>
        </div>
      )}

      {showForm && activeTab === 'mine' && (
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
          {activeTab === 'mine'
            ? `Dina fångster (${catches.length})`
            : `Publika fångster (${publicCatches.length})`
          }
        </h2>
        <CatchList
          catches={displayCatches}
          onDelete={activeTab === 'mine' ? handleDelete : undefined}
          loading={displayLoading}
          showOwner={activeTab === 'public'}
          isOwnCatch={isOwnCatch}
        />
      </div>
    </div>
  )
}
