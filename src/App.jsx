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
  const [selectedStop, setSelectedStop] = useState(null)  // null = vis alle
  const [exportReady, setExportReady]   = useState(false)

  // Reset stop filter when line changes
  function handleSetStops(newStops) {
    setStops(newStops)
    setSelectedStop(null)
  }

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
        setSelectedStop(null)
      }
    } catch {
      console.warn('Ugyldigt stop-parameter i URL')
    }
  }, [])

  const visibleStops = selectedStop !== null ? [stops[selectedStop]] : stops

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
          setStops={handleSetStops}
          exportReady={exportReady}
          stops={stops}
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
        />

        <main className="app-main">
          {visibleStops.length > 0
            ? <PreviewGrid stops={visibleStops} selectedLine={selectedLine} geoData={geoData} setExportReady={setExportReady} />
            : <EmptyState hasData={!!geoData} />
          }
        </main>
      </div>
    </div>
  )
}
