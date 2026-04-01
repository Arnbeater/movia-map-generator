import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import PreviewGrid from './components/PreviewGrid.jsx'
import EmptyState from './components/EmptyState.jsx'
import { extractLines, extractStopsForLine } from './utils/geoParser.js'
import './styles/app.css'

export default function App() {
  const [geoData, setGeoData]           = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)
  const [stops, setStops]               = useState([])
  const [exportReady, setExportReady]   = useState(false)

  // Load stop from URL param ?stop=<base64-geojson>
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const encoded = params.get('stop')
    if (!encoded) return
    try {
      const json  = JSON.parse(atob(encoded))
      setGeoData(json)
      const lines = extractLines(json)
      if (lines.length === 1) {
        setSelectedLine(lines[0])
        setStops(extractStopsForLine(json, lines[0]))
      }
    } catch {
      console.warn('Ugyldigt stop-parameter i URL')
    }
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">M</span>
        <h1 className="app-title">Kortgenerator</h1>
        <span className="app-subtitle">Movia</span>
      </header>

      <div className="app-body">
        <Sidebar
          geoData={geoData}
          setGeoData={setGeoData}
          selectedLine={selectedLine}
          setSelectedLine={setSelectedLine}
          setStops={setStops}
          exportReady={exportReady}
          stops={stops}
        />

        <main className="app-main">
          {stops.length > 0
            ? <PreviewGrid stops={stops} selectedLine={selectedLine} geoData={geoData} setExportReady={setExportReady} />
            : <EmptyState hasData={!!geoData} />
          }
        </main>
      </div>
    </div>
  )
}
