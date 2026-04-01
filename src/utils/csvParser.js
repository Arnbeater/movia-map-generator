/**
 * csvParser.js
 * Parses Movia GIS CSV exports (CP-865, semicolon-delimited) into a GeoJSON
 * FeatureCollection compatible with geoParser.js.
 *
 * Expected columns:
 *   A (0) = Linje      — bus line number (e.g. "5C", "250S")
 *   B (1) = StopNr     — stop number
 *   C (2) = StopNavn   — stop name
 *   D (3) = VejNavn    — road name
 *   E (4) = Northing   — ETRS89 UTM northing
 *   F (5) = Easting    — ETRS89 UTM easting
 *
 * Coordinates are converted from ETRS89 (UTM zone 32N or 33N) to WGS84.
 */

// ── WGS84 ellipsoid ──
const _a   = 6378137.0
const _f   = 1 / 298.257223563
const _e2  = 2 * _f - _f * _f
const _ep2 = _e2 / (1 - _e2)

function _deg2rad(d) { return d * Math.PI / 180 }
function _rad2deg(r) { return r * 180 / Math.PI }

// General Transverse Mercator → WGS84 (works for ETRS89 / any UTM zone)
function _tmToLatLon(cm_deg, scale, fe, fn, easting, northing) {
  const x    = easting  - fe
  const y    = northing - fn
  const lon0 = _deg2rad(cm_deg)
  const M    = y / scale
  const mu   = M / (_a * (1 - _e2/4 - 3*_e2**2/64 - 5*_e2**3/256))

  const e1   = (1 - Math.sqrt(1 - _e2)) / (1 + Math.sqrt(1 - _e2))
  const phi1 = mu
    + (3*e1/2    - 27*e1**3/32)  * Math.sin(2*mu)
    + (21*e1**2/16 - 55*e1**4/32) * Math.sin(4*mu)
    + (151*e1**3/96)              * Math.sin(6*mu)
    + (1097*e1**4/512)            * Math.sin(8*mu)

  const N1 = _a / Math.sqrt(1 - _e2 * Math.sin(phi1)**2)
  const T1 = Math.tan(phi1)**2
  const C1 = _ep2 * Math.cos(phi1)**2
  const R1 = _a * (1 - _e2) / Math.pow(1 - _e2 * Math.sin(phi1)**2, 1.5)
  const D  = x / (N1 * scale)

  const lat = phi1
    - (N1 * Math.tan(phi1) / R1)
    * ( D**2/2
      - (5 + 3*T1 + 10*C1 - 4*C1**2 - 9*_ep2)              * D**4/24
      + (61 + 90*T1 + 298*C1 + 45*T1**2 - 252*_ep2 - 3*C1**2) * D**6/720 )

  const lon = lon0
    + ( D - (1 + 2*T1 + C1) * D**3/6
          + (5 - 2*C1 + 28*T1 - 3*C1**2 + 8*_ep2 + 24*T1**2) * D**5/120 )
    / Math.cos(phi1)

  return { lat: _rad2deg(lat), lon: _rad2deg(lon) }
}

// Denmark bounding box — auto-selects UTM zone 32 or 33
const _DK_BBOX = { minLat: 54.5, maxLat: 57.8, minLon: 8.0, maxLon: 15.5 }

function _etrs89ToWgs84(northing, easting) {
  for (const cm of [9, 15]) { // zone 32 (cm=9°), zone 33 (cm=15°)
    const r = _tmToLatLon(cm, 0.9996, 500000, 0, easting, northing)
    if (r.lat >= _DK_BBOX.minLat && r.lat <= _DK_BBOX.maxLat
     && r.lon >= _DK_BBOX.minLon && r.lon <= _DK_BBOX.maxLon) {
      return r
    }
  }
  // Fall back to zone 32
  return _tmToLatLon(9, 0.9996, 500000, 0, easting, northing)
}

// ── CP-865 (Danish/Norwegian DOS codepage) decoder ──
const _CP865 = [
  0xC7,0xFC,0xE9,0xE2,0xE4,0xE0,0xE5,0xE7,0xEA,0xEB,0xE8,0xEF,0xEE,0xEC,0xC4,0xC5,
  0xC9,0xE6,0xC6,0xF4,0xF6,0xF2,0xFB,0xF9,0xFF,0xD6,0xDC,0xF8,0xA3,0xD8,0x20A7,0x192,
  0xE1,0xED,0xF3,0xFA,0xF1,0xD1,0xAA,0xBA,0xBF,0x2310,0xAC,0xBD,0xBC,0xA1,0xAB,0xBB,
  0x2591,0x2592,0x2593,0x2502,0x2524,0x2561,0x2562,0x2556,0x2555,0x2563,0x2551,0x2557,
  0x255D,0x255C,0x255B,0x2510,0x2514,0x2534,0x252C,0x251C,0x2500,0x253C,0x255E,0x255F,
  0x255A,0x2554,0x2569,0x2566,0x2560,0x2550,0x256C,0x2567,0x2568,0x2564,0x2565,0x2559,
  0x2558,0x2552,0x2553,0x256B,0x256A,0x2518,0x250C,0x2588,0x2584,0x258C,0x2590,0x2580,
  0x03B1,0x00DF,0x0393,0x03C0,0x03A3,0x03C3,0x00B5,0x03C4,0x03A6,0x0398,0x03A9,0x03B4,
  0x221E,0x03C6,0x03B5,0x2229,0x2261,0xB1,0x2265,0x2264,0x2320,0x2321,0xF7,0x2248,
  0xB0,0x2219,0xB7,0x221A,0x207F,0xB2,0x25A0,0xA0,
]

function _decodeCp865(buffer) {
  const bytes = new Uint8Array(buffer)
  let out = ''
  for (const b of bytes) {
    out += b < 0x80 ? String.fromCharCode(b) : String.fromCharCode(_CP865[b - 0x80])
  }
  return out
}

function _detectDelimiter(line) {
  const counts = { ';': 0, ',': 0, '\t': 0 }
  for (const ch of line) if (ch in counts) counts[ch]++
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function _splitRow(line, delim) {
  const result = []
  let cell = '', inQuote = false
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; continue }
    if (!inQuote && ch === delim) { result.push(cell.trim()); cell = ''; continue }
    cell += ch
  }
  result.push(cell.trim())
  return result
}

const COL_LINE  = 0
const COL_NR    = 1
const COL_NAME  = 2
const COL_ROAD  = 3
const COL_NORTH = 4
const COL_EAST  = 5

/**
 * Parse a Movia GIS CSV file (ArrayBuffer, CP-865 encoded) and return a GeoJSON
 * FeatureCollection that geoParser.js can consume directly.
 *
 * @param {ArrayBuffer} buffer  Raw file bytes from FileReader.readAsArrayBuffer()
 * @returns {{ geoJson: object|null, errors: string[] }}
 */
export function parseCsvToGeoJson(buffer) {
  const text = _decodeCp865(buffer)
  const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .split('\n')
    .filter(l => l.trim())

  if (!rawLines.length) {
    return { geoJson: null, errors: ['Filen ser ud til at være tom.'] }
  }

  const delim = _detectDelimiter(rawLines[0])

  // Skip header row if Northing column is non-numeric
  const firstRow = _splitRow(rawLines[0], delim)
  const looksLikeData = !isNaN(parseFloat((firstRow[COL_NORTH] || '').replace(/,/g, '.')))
  const dataRows = (looksLikeData ? rawLines : rawLines.slice(1))
    .map(l => _splitRow(l, delim))
    .filter(r => r.length > COL_EAST)

  if (!dataRows.length) {
    return { geoJson: null, errors: ['Ingen datarækker fundet i CSV.'] }
  }

  const features = []
  const errors = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const N = parseFloat((row[COL_NORTH] || '').replace(/,/g, '.'))
    const E = parseFloat((row[COL_EAST]  || '').replace(/,/g, '.'))

    if (isNaN(N) || isNaN(E)) {
      errors.push(`Række ${i + 1}: Northing/Easting ikke numerisk ("${row[COL_NORTH]}", "${row[COL_EAST]}")`)
      continue
    }

    let lat, lon
    try {
      const r = _etrs89ToWgs84(N, E)
      lat = r.lat
      lon = r.lon
    } catch (e) {
      errors.push(`Række ${i + 1}: Koordinatkonvertering fejlede — ${e.message}`)
      continue
    }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name:   row[COL_NAME] || `Stop ${i + 1}`,
        line:   row[COL_LINE] || '',
        stopNr: row[COL_NR]   || '',
        road:   row[COL_ROAD] || '',
      },
    })
  }

  return {
    geoJson: { type: 'FeatureCollection', features },
    errors,
  }
}
