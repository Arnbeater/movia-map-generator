import { useMemo } from 'react'
import StopCard from './StopCard.jsx'
import './PreviewGrid.css'

export default function PreviewGrid({ stops, selectedLine, geoData, setExportReady }) {
  // Build corridor coordinates: prefer a LineString feature from the GeoJSON,
  // otherwise synthesise from the ordered stop positions.
  const corridorCoords = useMemo(() => {
    if (geoData) {
      const feature = geoData.features?.find(
        f => f.geometry?.type === 'LineString' &&
             String(f.properties?.line) === String(selectedLine)
      )
      if (feature) return feature.geometry.coordinates
    }
    return stops.map(s => [s.lng, s.lat])
  }, [stops, selectedLine, geoData])

  return (
    <div>
      <div className="grid-header">
        <h2 className="grid-title">Linje {selectedLine}</h2>
        <span className="grid-count">{stops.length} stoppesteder</span>
      </div>
      <div className="preview-grid">
        {stops.map((stop, i) => (
          <StopCard
            key={i}
            stop={stop}
            line={selectedLine}
            index={i}
            corridorCoords={corridorCoords}
          />
        ))}
      </div>
    </div>
  )
}
