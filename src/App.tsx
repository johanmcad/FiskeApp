import { Routes, Route, NavLink } from 'react-router-dom'
import { CatchLogPage } from '@/pages/CatchLog'
import { WaterMapPage } from '@/pages/WaterMapPage'
import { BoatRampsPage } from '@/pages/BoatRampsPage'
import { ProfilePage } from '@/pages/Profile'
import { Fish, Map, User, Anchor } from 'lucide-react'

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
        <Routes>
          <Route path="/" element={<CatchLogPage />} />
          <Route path="/map" element={<WaterMapPage />} />
          <Route path="/boat-ramps" element={<BoatRampsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
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
            to="/boat-ramps"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Anchor className="w-6 h-6" />
            <span className="text-xs mt-1">Ramper</span>
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
