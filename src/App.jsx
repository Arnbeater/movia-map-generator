import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import PreviewGrid from './components/PreviewGrid.jsx'
import EmptyState from './components/EmptyState.jsx'
import './styles/app.css'

export default function App() {
  const [geoData, setGeoData]     = useState(null)   // parsed GeoJSON
  const [selectedLine, setSelectedLine] = useState(null)
  const [stops, setStops]         = useState([])      // stops on selected line
  const [exportReady, setExportReady] = useState(false)

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">M</span>
        <h1 className="app-title">Kortgenerator</h1>
        <span className="app-subtitle">Movia stoppestedskort</span>
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
