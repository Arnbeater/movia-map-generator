/**
 * geoParser.js
 * Parses a GeoJSON FeatureCollection containing bus stops and/or lines.
 *
 * Expected GeoJSON structure:
 * - Stop features: geometry.type === "Point", properties.name, properties.line (or properties.lines as array)
 * - Line features: geometry.type === "LineString", properties.line
 *
 * Adapt the property names below to match your actual GIS export.
 */

const PROP_STOP_NAME  = 'name'       // property key for stop name
const PROP_LINE_KEY   = 'line'       // property key for line id on stops
const PROP_LINES_KEY  = 'lines'      // alternative: array of line ids

export function extractLines(geoData) {
  const lineSet = new Set()

  geoData.features?.forEach(f => {
    const props = f.properties || {}
    if (props[PROP_LINE_KEY]) lineSet.add(String(props[PROP_LINE_KEY]))
    if (Array.isArray(props[PROP_LINES_KEY])) {
      props[PROP_LINES_KEY].forEach(l => lineSet.add(String(l)))
    }
  })

  return [...lineSet].sort((a, b) => a.localeCompare(b, 'da'))
}

/**
 * Return the coordinates of the LineString feature for a given line, if one
 * exists in the GeoJSON.  Falls back to null so callers can synthesise one
 * from the ordered stop positions instead.
 *
 * @param {object} geoData  GeoJSON FeatureCollection
 * @param {string} line     Line id
 * @returns {[number,number][]|null}  Array of [lng, lat] pairs or null
 */
export function extractCorridorForLine(geoData, line) {
  const feature = geoData.features?.find(
    f => f.geometry?.type === 'LineString' &&
         String(f.properties?.[PROP_LINE_KEY]) === String(line)
  )
  return feature ? feature.geometry.coordinates : null
}

export function extractStopsForLine(geoData, line) {
  const stops = []

  geoData.features?.forEach(f => {
    if (f.geometry?.type !== 'Point') return
    const props = f.properties || {}
    const featureLines = props[PROP_LINES_KEY] ?? [props[PROP_LINE_KEY]]
    const match = featureLines.some(l => String(l) === String(line))
    if (!match) return

    const [lng, lat] = f.geometry.coordinates
    stops.push({
      name:       props[PROP_STOP_NAME] || `Stop ${stops.length + 1}`,
      lat:        lat,
      lng:        lng,
      properties: props,
    })
  })

  return stops
}
