import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLineColor } from '../utils/lineColors.js'
import './StopCard.css'

const BUSTER_SVG_W = 28
const BUSTER_SVG_H = Math.round(BUSTER_SVG_W * 49.54 / 33.03)
const BUSTER_ANCHOR_FROM_TOP = 33  // px from top of SVG to circle base

function makeBusterIcon(lines = []) {
  const visible = lines.slice(0, 3)
  const extra   = lines.length - visible.length
  const badges  = visible
    .map(t => `<span style="background:#FFBA00;color:#1a1a1a;font-weight:700;font-size:9px;padding:1px 4px;border-radius:3px;line-height:1.4;white-space:nowrap;">${t}</span>`)
    .join('')
  const extraBadge = extra > 0
    ? `<span style="color:#6b7280;font-size:8px;font-weight:600;">+${extra}</span>`
    : ''

  const totalItems = visible.length + (extra > 0 ? 1 : 0)
  const badgeRows  = totalItems > 0 ? Math.ceil(totalItems / 2) : 0
  const badgeAreaH = badgeRows > 0 ? badgeRows * 16 + (badgeRows - 1) * 2 : 0
  const gapToSign  = badgeRows > 0 ? 3 : 0
  const anchorY    = badgeAreaH + gapToSign + BUSTER_ANCHOR_FROM_TOP

  const busterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.03 49.54" width="${BUSTER_SVG_W}" height="${BUSTER_SVG_H}">
    <path fill="#2d3748" stroke="#fff" d="M25.38,6.32c1.2,0,2.17.97,2.17,2.17v8.45c0,1.2-.97,2.17-2.17,2.17h-7.38v1.23c0,.26-.12.46-.28.6v15.38h-3.33v-15.38c-.17-.14-.28-.35-.28-.6v-1.23h-7.38c-1.2,0-2.17-.97-2.17-2.17v-8.45c0-1.2.97-2.17,2.17-2.17h18.65Z"/>
    <path fill="#fcaf17" d="M6.33,13.77v-4.08c0-.91.74-1.65,1.65-1.65h16.15c.91,0,1.65.74,1.65,1.65v4.08H6.33Z"/>
    <circle fill="#fff" cx="16.05" cy="36.43" r="3"/>
    <path fill="#19202c" d="M16.05,32.43c-.79,0-1.56.23-2.22.67-.66.44-1.17,1.06-1.47,1.8-.3.73-.38,1.54-.23,2.31.15.78.54,1.49,1.09,2.05.56.56,1.27.94,2.05,1.09.78.15,1.58.08,2.31-.23.73-.3,1.36-.82,1.8-1.47.44-.66.67-1.43.67-2.22,0-1.06-.42-2.08-1.17-2.83-.75-.75-1.77-1.17-2.83-1.17ZM16.05,38.98c-.5,0-1-.15-1.41-.43-.42-.28-.74-.68-.94-1.14-.19-.47-.24-.98-.14-1.47.1-.49.34-.95.7-1.3s.81-.6,1.3-.7,1.01-.05,1.47.14c.47.19.86.52,1.14.94.28.42.43.91.43,1.41,0,.68-.27,1.32-.75,1.8-.48.48-1.12.75-1.8.75Z"/>
    <path fill="#2d3748" stroke="#fff" d="M17.72,21.32v14.83c0,.92-.75,1.67-1.67,1.67s-1.66-.75-1.66-1.67v-14.83h3.33Z"/>
    <path fill="#2d3748" d="M14.89,18.82v14.33c0,.64.52,1.17,1.16,1.17s1.16-.52,1.16-1.17v-14.33h-2.33Z"/>
  </svg>`

  return L.divIcon({
    className: '',
    iconAnchor: [40, anchorY],
    html: `<div style="width:80px;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;max-width:80px;">${badges}${extraBadge}</div>
      ${busterSvg}
    </div>`,
  })
}

function makeCurrentStopIcon() {
  return L.divIcon({
    className: '',
    iconAnchor: [12, 36],
    html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.029 2 3 6.029 3 11C3 17 12 34 12 34C12 34 21 17 21 11C21 6.029 16.971 2 12 2Z"
            fill="#1a1a1a" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="12" cy="11" r="4.5" fill="white"/>
    </svg>`,
  })
}

export default function StopCard({ stop, line, index, corridorCoords, nearbyStops = [] }) {
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
      const latlngs = corridorCoords.map(([lng, lat]) => [lat, lng])
      L.polyline(latlngs, { color: '#ffffff', weight: 6, opacity: 0.7 }).addTo(map)
      L.polyline(latlngs, { color: lineColor, weight: 3 }).addTo(map)
    }

    // ── Nearby stop markers ────────────────────────────────────────────────
    for (const s of nearbyStops) {
      L.marker([s.lat, s.lng], { icon: makeBusterIcon(s.lines) }).addTo(map)
    }

    // ── Selected stop marker ───────────────────────────────────────────────
    L.marker([stop.lat, stop.lng], { icon: makeCurrentStopIcon() }).addTo(map)

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
