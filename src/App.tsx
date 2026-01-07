import { Suspense, lazy } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { Fish, Map, User, Loader2 } from 'lucide-react'

// Lazy load sidor för code-splitting
const CatchLogPage = lazy(() => import('@/pages/CatchLog').then(m => ({ default: m.CatchLogPage })))
const WaterMapPage = lazy(() => import('@/pages/WaterMapPage').then(m => ({ default: m.WaterMapPage })))
const ProfilePage = lazy(() => import('@/pages/Profile').then(m => ({ default: m.ProfilePage })))

// Laddningsindikator
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )
}

function App() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Fish className="w-6 h-6" />
          FiskeApp
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<CatchLogPage />} />
            <Route path="/map" element={<WaterMapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Fish className="w-6 h-6" />
            <span className="text-xs mt-1">Fångster</span>
          </NavLink>

          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Map className="w-6 h-6" />
            <span className="text-xs mt-1">Kartor</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

export default App
