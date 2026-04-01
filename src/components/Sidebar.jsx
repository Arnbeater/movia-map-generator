import { useRef } from 'react'
import { extractLines, extractStopsForLine } from '../utils/geoParser.js'
import { parseCsvToGeoJson } from '../utils/csvParser.js'
import { exportToPDF } from '../utils/exportPDF.js'
import './Sidebar.css'

export default function Sidebar({ geoData, setGeoData, selectedLine, setSelectedLine, setStops, stops, exportReady }) {
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    const isCsv = file.name.toLowerCase().endsWith('.csv')

    if (isCsv) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const { geoJson, errors } = parseCsvToGeoJson(ev.target.result)
        if (errors.length > 0) {
          console.warn('CSV-advarsler:', errors)
        }
        if (!geoJson || geoJson.features.length === 0) {
          alert('Ingen gyldige stoppesteder fundet i CSV.\n\n' + errors.join('\n'))
          return
        }
        setGeoData(geoJson)
        setSelectedLine(null)
        setStops([])
        if (errors.length > 0) {
          alert(`${geoJson.features.length} stoppesteder indlæst.\n\n${errors.length} rækker sprunget over:\n${errors.join('\n')}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result)
          setGeoData(parsed)
          setSelectedLine(null)
          setStops([])
        } catch {
          alert('Kunne ikke læse filen. Er det et gyldigt GeoJSON?')
        }
      }
      reader.readAsText(file)
    }
  }

  function handleLineChange(e) {
    const line = e.target.value
    setSelectedLine(line)
    if (line && geoData) {
      setStops(extractStopsForLine(geoData, line))
    } else {
      setStops([])
    }
  }

  const lines = geoData ? extractLines(geoData) : []

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <label className="section-label">1. Indlæs GIS-data</label>
        <p className="section-hint">CSV fra GIS-eksport eller GeoJSON</p>
        <button className="btn-upload" onClick={() => fileRef.current.click()}>
          {geoData ? '✓ Data indlæst' : 'Upload CSV eller GeoJSON'}
        </button>
        <input ref={fileRef} type="file" accept=".csv,.geojson,.json" onChange={handleFile} hidden />
        {geoData && (
          <button className="btn-ghost" onClick={() => fileRef.current.click()}>Skift fil</button>
        )}
      </section>

      {geoData && (
        <section className="sidebar-section">
          <label className="section-label">2. Vælg linje</label>
          <select className="select" value={selectedLine || ''} onChange={handleLineChange}>
            <option value="">Vælg linje...</option>
            {lines.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </section>
      )}

      {stops.length > 0 && (
        <section className="sidebar-section">
          <label className="section-label">3. Stoppesteder</label>
          <p className="stop-count">{stops.length} stoppesteder fundet</p>
          <ul className="stop-list">
            {stops.map((s, i) => (
              <li key={i} className="stop-item">{s.name}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="sidebar-footer">
        <button
          className="btn-export"
          disabled={stops.length === 0}
          onClick={() => exportToPDF(stops, selectedLine)}
        >
          Eksporter PDF-pakke
        </button>
        <p className="export-hint">
          {stops.length > 0
            ? `Genererer ${stops.length} kort`
            : 'Vælg en linje for at eksportere'}
        </p>
      </div>
    </aside>
  )
}
