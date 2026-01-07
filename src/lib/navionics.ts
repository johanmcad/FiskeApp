// Navionics Web API integration
// Dokumentation: https://webapiv2.navionics.com/

declare global {
  interface Window {
    JNC: {
      Leaflet: {
        NavionicsOverlay: new (options: NavionicsOverlayOptions) => NavionicsOverlay
      }
      NAVIONICS_CHARTS: {
        NAUTICAL: string
        SONARCHART: string
      }
    }
  }
}

interface NavionicsOverlayOptions {
  navKey: string
  chartType: string
  isTransparent?: boolean
  zIndex?: number
  logoPayoff?: boolean
}

interface NavionicsOverlay {
  addTo: (map: L.Map) => void
  remove: () => void
}

const NAVIONICS_CSS = 'https://webapiv2.navionics.com/dist/webapi/webapi.min.css'
const NAVIONICS_JS = 'https://webapiv2.navionics.com/dist/webapi/webapi.min.js'

let isLoading = false
let isLoaded = false

export const isNavionicsConfigured = () => {
  return Boolean(import.meta.env.VITE_NAVIONICS_API_KEY)
}

export const getNavionicsApiKey = () => {
  return import.meta.env.VITE_NAVIONICS_API_KEY || ''
}

export const loadNavionicsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve()
      return
    }

    if (isLoading) {
      // Vänta på att scriptet laddas
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      return
    }

    isLoading = true

    // Ladda CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = NAVIONICS_CSS
    document.head.appendChild(link)

    // Ladda JS
    const script = document.createElement('script')
    script.src = NAVIONICS_JS
    script.async = true

    script.onload = () => {
      isLoaded = true
      isLoading = false
      resolve()
    }

    script.onerror = () => {
      isLoading = false
      reject(new Error('Kunde inte ladda Navionics script'))
    }

    document.head.appendChild(script)
  })
}

export const createNavionicsOverlay = (chartType: 'nautical' | 'sonar' = 'nautical') => {
  if (!window.JNC) {
    throw new Error('Navionics script är inte laddat')
  }

  const apiKey = getNavionicsApiKey()
  if (!apiKey) {
    throw new Error('Navionics API-nyckel saknas')
  }

  return new window.JNC.Leaflet.NavionicsOverlay({
    navKey: apiKey,
    chartType: chartType === 'sonar'
      ? window.JNC.NAVIONICS_CHARTS.SONARCHART
      : window.JNC.NAVIONICS_CHARTS.NAUTICAL,
    isTransparent: false,
    zIndex: 1,
    logoPayoff: true,
  })
}
