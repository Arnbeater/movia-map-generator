/**
 * lineColors.js
 * Mapper linjenumre til hex-farver til brug i kortlag og badges.
 *
 * Farvekonvention følger Movias visuelle identitet:
 *   - A-bus (5C, 6A, 9A …)         → Movia rød  #E2001A
 *   - S-bus (250S, 350S …)         → Movia blå  #0066CC
 *   - Natbus (N-prefix)            → Mørk lilla  #4B0082
 *   - Lokalbane / regionalbuss     → Grøn        #007A3D
 *   - Standard bybusser (2-cifret) → Movia mørkeblå #002D5F
 *   - default fallback             → Movia mørkeblå #002D5F
 *
 * Tilføj eller overskriv linjer herunder efter behov.
 */

export const LINE_COLORS = {
  // ── A-busser (hurtigbusser med A-suffiks) ───────────────────────
  '5C':  '#E2001A',
  '6A':  '#E2001A',
  '9A':  '#E2001A',
  '10A': '#E2001A',
  '13A': '#E2001A',

  // ── S-busser (ekspreslinjer med S-suffiks) ──────────────────────
  '150S': '#0066CC',
  '250S': '#0066CC',
  '350S': '#0066CC',
  '450S': '#0066CC',

  // ── Natbusser (N-prefix) ────────────────────────────────────────
  'N1':  '#4B0082',
  'N2':  '#4B0082',
  'N3':  '#4B0082',
  'N4':  '#4B0082',
  'N5':  '#4B0082',
  'N6':  '#4B0082',
  'N9':  '#4B0082',

  // ── Lokalbaner / regionalruter ──────────────────────────────────
  '200': '#007A3D',
  '300': '#007A3D',
  '400': '#007A3D',

  // ── Almindelige bybusser ────────────────────────────────────────
  '1':  '#002D5F',
  '2':  '#002D5F',
  '3':  '#002D5F',
  '4':  '#002D5F',
  '7':  '#002D5F',
  '8':  '#002D5F',
  '12': '#002D5F',
  '14': '#002D5F',
  '15': '#002D5F',
  '18': '#002D5F',
  '19': '#002D5F',
  '26': '#002D5F',
  '27': '#002D5F',
  '28': '#002D5F',
  '29': '#002D5F',
  '30': '#002D5F',
  '31': '#002D5F',
  '33': '#002D5F',
  '34': '#002D5F',
  '37': '#002D5F',
  '40': '#002D5F',
  '42': '#002D5F',
  '43': '#002D5F',

  // ── Fallback ────────────────────────────────────────────────────
  default: '#002D5F',
}

/**
 * Hent farve for en linje. Returnerer default hvis linjen ikke kendes.
 * @param {string|number} line
 * @returns {string} hex-farvekode
 */
export function getLineColor(line) {
  return LINE_COLORS[String(line)] ?? LINE_COLORS.default
}
