import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { User, LogOut, AlertCircle, Fish, Ruler, Scale } from 'lucide-react'

export function ProfilePage() {
  const { user, signIn, signUp, signOut, loading, isConfigured } = useAuth()
  const { catches } = useCatches()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Beräkna statistik
  const stats = {
    totalCatches: catches.length,
    totalLength: catches.reduce((sum, c) => sum + (c.lengthCm || 0), 0),
    totalWeight: catches.reduce((sum, c) => sum + (c.weightGrams || 0), 0),
    uniqueSpecies: new Set(catches.map(c => c.species)).size,
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAuthLoading(true)

    try {
      const { error: authError } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password)

      if (authError) {
        setError(authError.message)
      }
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p className="text-gray-500">Laddar...</p>
      </div>
    )
  }

  // Inloggad
  if (user) {
    return (
      <div className="p-4 pb-24 space-y-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.email?.split('@')[0] || 'Fiskare'}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Din statistik</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Fish className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalCatches}</p>
              <p className="text-xs text-gray-500">Fångster</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 mx-auto text-blue-600 mb-1 font-bold">#</div>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpecies}</p>
              <p className="text-xs text-gray-500">Arter</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Ruler className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalLength}</p>
              <p className="text-xs text-gray-500">Total cm</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Scale className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalWeight / 1000).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Total kg</p>
            </div>
          </div>
        </Card>

        <Button variant="outline" onClick={signOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logga ut
        </Button>
      </div>
    )
  }

  // Ej konfigurerad Supabase
  if (!isConfigured) {
    return (
      <div className="p-4 pb-24">
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Demo-läge</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Supabase är inte konfigurerad. Fångster sparas lokalt i webbläsaren.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                För att aktivera molnlagring och inloggning, skapa ett Supabase-projekt och
                lägg till miljövariabler i <code className="bg-yellow-100 px-1 rounded">.env</code>
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Din lokala statistik</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Fish className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalCatches}</p>
              <p className="text-xs text-gray-500">Fångster</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 mx-auto text-blue-600 mb-1 font-bold">#</div>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpecies}</p>
              <p className="text-xs text-gray-500">Arter</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Inloggningsformulär
  return (
    <div className="p-4 pb-24">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          {isSignUp ? 'Skapa konto' : 'Logga in'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="email"
            label="E-post"
            placeholder="din@email.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Lösenord"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" className="w-full" disabled={authLoading}>
            {authLoading ? 'Laddar...' : isSignUp ? 'Skapa konto' : 'Logga in'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp ? 'Har du redan ett konto? Logga in' : 'Inget konto? Skapa ett'}
          </button>
        </div>
      </Card>
    </div>
  )
}
