import { useState, useMemo } from 'react'
import { fishSpecies, searchSpecies } from '@/data/fishSpecies'
import { FishSpecies } from '@/types'

interface SpeciesSelectProps {
  value: string
  onChange: (speciesId: string) => void
  error?: string
}

export function SpeciesSelect({ value, onChange, error }: SpeciesSelectProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<'all' | 'freshwater' | 'saltwater'>('all')

  const filteredSpecies = useMemo(() => {
    let results: FishSpecies[]

    if (search) {
      results = searchSpecies(search)
    } else {
      results = fishSpecies
    }

    if (category !== 'all') {
      results = results.filter(s => s.category === category || s.category === 'both')
    }

    return results.sort((a, b) => a.swedishName.localeCompare(b.swedishName, 'sv'))
  }, [search, category])

  const selectedSpecies = fishSpecies.find(s => s.id === value)

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fiskart *
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 text-left border rounded-lg shadow-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          {selectedSpecies ? (
            <span>{selectedSpecies.swedishName}</span>
          ) : (
            <span className="text-gray-400">Välj fiskart...</span>
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Sök fiskart..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />

              <div className="flex gap-2 mt-2">
                {(['all', 'freshwater', 'saltwater'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      px-3 py-1 text-xs rounded-full transition-colors
                      ${category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                    {cat === 'all' ? 'Alla' : cat === 'freshwater' ? 'Sötvatten' : 'Saltvatten'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-52">
              {filteredSpecies.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 text-center">Inga arter hittades</p>
              ) : (
                filteredSpecies.map((species) => (
                  <button
                    key={species.id}
                    type="button"
                    onClick={() => {
                      onChange(species.id)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between
                      ${value === species.id ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div>
                      <p className="font-medium">{species.swedishName}</p>
                      <p className="text-xs text-gray-500 italic">{species.latinName}</p>
                    </div>
                    {species.minSizeCm && (
                      <span className="text-xs text-gray-400">
                        Min: {species.minSizeCm} cm
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
