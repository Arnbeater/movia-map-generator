import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLineColor } from '../utils/lineColors.js'
import './StopCard.css'

export default function StopCard({ stop, line, index, corridorCoords }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const [zoom, setZoom] = useState(15)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [stop.lat, stop.lng],
      zoom,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    // ── Line corridor ──────────────────────────────────────────────────────
    if (corridorCoords && corridorCoords.length >= 2) {
      const lineColor = getLineColor(line)
      // corridorCoords is [lng, lat] — Leaflet needs [lat, lng]
      const latlngs = corridorCoords.map(([lng, lat]) => [lat, lng])
      L.polyline(latlngs, { color: '#ffffff', weight: 6, opacity: 0.7 }).addTo(map)
      L.polyline(latlngs, { color: lineColor, weight: 3 }).addTo(map)
    }

    // ── Stop marker — black teardrop ───────────────────────────────────────
    const icon = L.divIcon({
      className: '',
      iconAnchor: [12, 36],
      html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C7.029 2 3 6.029 3 11C3 17 12 34 12 34C12 34 21 17 21 11C21 6.029 16.971 2 12 2Z"
              fill="#1a1a1a" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="12" cy="11" r="4.5" fill="white"/>
      </svg>`,
    })
    L.marker([stop.lat, stop.lng], { icon }).addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  function handleZoomChange(delta) {
    const newZoom = Math.min(18, Math.max(12, zoom + delta))
    setZoom(newZoom)
    mapInstance.current?.setZoom(newZoom)
  }

  return (
    <div className="stop-card">
      <div className="stop-card-header">
        <div
          className="stop-line-badge"
          style={{ background: getLineColor(line) }}
        >
          {line}
        </div>
        <div className="stop-card-name">{stop.name}</div>
        <div className="stop-card-index">#{String(index + 1).padStart(2, '0')}</div>
      </div>

      <div className="stop-map-wrapper" ref={mapRef} />

      <div className="stop-card-footer">
        <div className="stop-coords">
          <span>{stop.lat.toFixed(5)}</span>
          <span>{stop.lng.toFixed(5)}</span>
        </div>
        <div className="zoom-controls">
          <button onClick={() => handleZoomChange(-1)}>−</button>
          <span>{zoom}</span>
          <button onClick={() => handleZoomChange(1)}>+</button>
        </div>
      </div>
    </div>
  )
}
