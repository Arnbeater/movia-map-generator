import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { getLineColor } from '../utils/lineColors.js'
import { applyMoviaStyle } from '../utils/mapStyle.js'
import './StopCard.css'

export default function StopCard({ stop, line, index, corridorCoords }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const [zoom, setZoom] = useState(15)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const lineColor = getLineColor(line)

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [stop.lng, stop.lat],
      zoom,
      interactive: false,
      attributionControl: false,
      preserveDrawingBuffer: true,   // required for toDataURL() in PDF export
    })

    map.on('load', () => {
      // ── Movia clean style ─────────────────────────────────────────────────
      applyMoviaStyle(map)

      // ── Line corridor ─────────────────────────────────────────────────────
      if (corridorCoords && corridorCoords.length >= 2) {
        map.addSource('corridor', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: corridorCoords },
          },
        })

        // Soft halo so the line is legible on any basemap
        map.addLayer({
          id:     'corridor-halo',
          type:   'line',
          source: 'corridor',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint:  { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.7 },
        })

        map.addLayer({
          id:     'corridor-line',
          type:   'line',
          source: 'corridor',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint:  { 'line-color': lineColor, 'line-width': 3 },
        })
      }

      // ── Stop marker ───────────────────────────────────────────────────────
      new maplibregl.Marker({ color: '#E2001A' })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map)
    })

    mapInstance.current = map
    return () => map.remove()
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
