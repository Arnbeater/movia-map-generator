import { useMemo } from 'react'
import StopCard from './StopCard.jsx'
import { extractNearbyStops } from '../utils/geoParser.js'
import './PreviewGrid.css'

export default function PreviewGrid({ stops, selectedLine, geoData, setExportReady }) {
  const nearbyStops = useMemo(() => extractNearbyStops(geoData), [geoData])

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
            nearbyStops={nearbyStops}
          />
        ))}
      </div>
    </div>
  )
}
