/**
 * mapStyle.js
 * Applies a clean, Movia-branded style over the Carto Positron basemap.
 *
 * Strategy: iterate loaded layers and override paint properties.
 * This avoids maintaining a full custom style JSON while still giving
 * full control over colors and visibility.
 *
 * Palette:
 *   Land/background  #F4F2EE  (Movia --color-bg)
 *   Buildings        #E0DDD6
 *   Roads            #FFFFFF
 *   Road outlines    #D8D4CC
 *   Water            #C5D8E8
 *   Parks/green      #D4E6CC
 *   Labels           #002D5F  (Movia dark blue)
 *   Label halo       #F4F2EE
 */

const COLORS = {
  land:         '#F4F2EE',
  building:     '#E0DDD6',
  buildingLine: '#D0CCC4',
  road:         '#FFFFFF',
  roadOutline:  '#D8D4CC',
  water:        '#C5D8E8',
  green:        '#D4E6CC',
  label:        '#002D5F',
  labelHalo:    '#F4F2EE',
}

// Layer id fragments that should be hidden entirely
const HIDDEN_FRAGMENTS = [
  'poi', 'icon', 'transit', 'bus', 'rail', 'aeroway',
  'barrier', 'housenumber', 'shield',
]

// Layer id fragments → building fill
const BUILDING_FRAGMENTS = ['building']

// Layer id fragments → water fill
const WATER_FRAGMENTS = ['water', 'ocean', 'sea', 'lake', 'river']

// Layer id fragments → green fill
const GREEN_FRAGMENTS = ['park', 'green', 'grass', 'wood', 'forest', 'garden', 'cemetery', 'pitch']

// Layer id fragments → road line or fill
const ROAD_FRAGMENTS = [
  'road', 'street', 'highway', 'motorway', 'trunk',
  'primary', 'secondary', 'tertiary', 'residential',
  'service', 'path', 'track', 'tunnel', 'bridge',
]

function matches(id, fragments) {
  return fragments.some(f => id.includes(f))
}

/**
 * Apply Movia clean style to a fully loaded MapLibre map instance.
 * Call this inside map.on('load', ...).
 *
 * @param {maplibregl.Map} map
 */
export function applyMoviaStyle(map) {
  const layers = map.getStyle().layers

  for (const layer of layers) {
    const id   = layer.id.toLowerCase()
    const type = layer.type

    // ── Hide noisy POI / transit layers ──────────────────────────────────
    if (matches(id, HIDDEN_FRAGMENTS)) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
      continue
    }

    // ── Background / land ─────────────────────────────────────────────────
    if (type === 'background') {
      map.setPaintProperty(layer.id, 'background-color', COLORS.land)
      continue
    }

    // ── Buildings ─────────────────────────────────────────────────────────
    if (matches(id, BUILDING_FRAGMENTS)) {
      if (type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color',         COLORS.building)
        map.setPaintProperty(layer.id, 'fill-outline-color', COLORS.buildingLine)
      }
      if (type === 'line') {
        map.setPaintProperty(layer.id, 'line-color', COLORS.buildingLine)
      }
      continue
    }

    // ── Water ─────────────────────────────────────────────────────────────
    if (matches(id, WATER_FRAGMENTS)) {
      if (type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', COLORS.water)
      }
      if (type === 'line') {
        map.setPaintProperty(layer.id, 'line-color', COLORS.water)
      }
      continue
    }

    // ── Green areas ───────────────────────────────────────────────────────
    if (matches(id, GREEN_FRAGMENTS)) {
      if (type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', COLORS.green)
      }
      continue
    }

    // ── Roads ─────────────────────────────────────────────────────────────
    if (matches(id, ROAD_FRAGMENTS)) {
      if (type === 'line') {
        // Carto uses separate casing (outline) and fill layers per road class.
        // Casing layers have 'case' or 'outline' in their id.
        const isCasing = id.includes('case') || id.includes('outline') || id.includes('border')
        map.setPaintProperty(layer.id, 'line-color', isCasing ? COLORS.roadOutline : COLORS.road)
      }
      continue
    }

    // ── Text labels ───────────────────────────────────────────────────────
    if (type === 'symbol') {
      try { map.setPaintProperty(layer.id, 'text-color',       COLORS.label)     } catch {}
      try { map.setPaintProperty(layer.id, 'text-halo-color',  COLORS.labelHalo) } catch {}
      try { map.setPaintProperty(layer.id, 'text-halo-width',  1)                } catch {}
    }
  }
}
