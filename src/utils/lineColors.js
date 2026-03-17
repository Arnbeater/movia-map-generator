/**
 * lineColors.js
 * Officielle Movia linjefarvekoder — Movia Farvekoder 07.03.2025_V1
 *
 * Farvepalette:
 *   A-bus rød        #D52B1E   RGB 213/43/30
 *   S-bus blå        #0073CF   RGB 0/115/207
 *   C-Bus teal       #00A5CC
 *   E-bus grøn       #009B48   RGB 0/155/72
 *   Servicebus grøn  #69BE28   RGB 105/190/40
 *   Miljø grøn       #54B948   RGB 84/185/72
 *   Natbus grå       #9A9B9C   RGB 154/155/156
 *   Flextrafik org   #FF5800   RGB 255/88/0
 *   Movia Gul        #FFB612   RGB 255/182/18
 *   Holscher blå     #00214D   RGB 0/33/77
 *   Movia mørkeblå   #002D5F   (brand default / fallback)
 */

// ── Officielle typefarver ────────────────────────────────────────────────────
export const TYPE_COLORS = {
  A:          '#D52B1E',   // A-bus rød
  S:          '#0073CF',   // S-bus blå
  C:          '#00A5CC',   // C-Bus teal
  E:          '#009B48',   // E-bus grøn
  SERVICE:    '#69BE28',   // Servicebus grøn
  MILJO:      '#54B948',   // Miljø grøn
  NAT:        '#9A9B9C',   // Natbus grå
  FLEX:       '#FF5800',   // Flextrafik orange
  GUL:        '#FFB612',   // Movia Gul
  DEFAULT:    '#002D5F',   // Movia mørkeblå
}

// ── Linje → farvekode ────────────────────────────────────────────────────────
export const LINE_COLORS = {

  // ── A-busser (suffix A) ──────────────────────────────────────────────────
  '1A':  TYPE_COLORS.A,
  '2A':  TYPE_COLORS.A,
  '3A':  TYPE_COLORS.A,
  '5A':  TYPE_COLORS.A,
  '6A':  TYPE_COLORS.A,
  '7A':  TYPE_COLORS.A,
  '8A':  TYPE_COLORS.A,
  '9A':  TYPE_COLORS.A,
  '10A': TYPE_COLORS.A,
  '11A': TYPE_COLORS.A,
  '12A': TYPE_COLORS.A,
  '13A': TYPE_COLORS.A,
  '14A': TYPE_COLORS.A,
  '15A': TYPE_COLORS.A,
  '20A': TYPE_COLORS.A,
  '5C':  TYPE_COLORS.A,   // 5C er klassificeret som A-bus
  '6C':  TYPE_COLORS.A,

  // ── S-busser (suffix S) ──────────────────────────────────────────────────
  '150S': TYPE_COLORS.S,
  '250S': TYPE_COLORS.S,
  '350S': TYPE_COLORS.S,
  '450S': TYPE_COLORS.S,
  '550S': TYPE_COLORS.S,

  // ── C-busser (suffix C, bortset fra 5C/6C ovenfor) ──────────────────────
  '200C': TYPE_COLORS.C,
  '300C': TYPE_COLORS.C,

  // ── E-busser (suffix E) ──────────────────────────────────────────────────
  '15E':  TYPE_COLORS.E,
  '18E':  TYPE_COLORS.E,
  '21E':  TYPE_COLORS.E,

  // ── Natbusser (prefix N) ─────────────────────────────────────────────────
  'N1':  TYPE_COLORS.NAT,
  'N2':  TYPE_COLORS.NAT,
  'N3':  TYPE_COLORS.NAT,
  'N4':  TYPE_COLORS.NAT,
  'N5':  TYPE_COLORS.NAT,
  'N6':  TYPE_COLORS.NAT,
  'N7':  TYPE_COLORS.NAT,
  'N8':  TYPE_COLORS.NAT,
  'N9':  TYPE_COLORS.NAT,
  'N12': TYPE_COLORS.NAT,
  'N17': TYPE_COLORS.NAT,
  'N19': TYPE_COLORS.NAT,

  // ── Almindelige bybusser (2-3 cifret, ingen suffix) ─────────────────────
  '1':   TYPE_COLORS.DEFAULT,
  '2':   TYPE_COLORS.DEFAULT,
  '3':   TYPE_COLORS.DEFAULT,
  '4':   TYPE_COLORS.DEFAULT,
  '7':   TYPE_COLORS.DEFAULT,
  '8':   TYPE_COLORS.DEFAULT,
  '12':  TYPE_COLORS.DEFAULT,
  '14':  TYPE_COLORS.DEFAULT,
  '15':  TYPE_COLORS.DEFAULT,
  '16':  TYPE_COLORS.DEFAULT,
  '17':  TYPE_COLORS.DEFAULT,
  '18':  TYPE_COLORS.DEFAULT,
  '19':  TYPE_COLORS.DEFAULT,
  '25':  TYPE_COLORS.DEFAULT,
  '26':  TYPE_COLORS.DEFAULT,
  '27':  TYPE_COLORS.DEFAULT,
  '28':  TYPE_COLORS.DEFAULT,
  '29':  TYPE_COLORS.DEFAULT,
  '30':  TYPE_COLORS.DEFAULT,
  '31':  TYPE_COLORS.DEFAULT,
  '33':  TYPE_COLORS.DEFAULT,
  '34':  TYPE_COLORS.DEFAULT,
  '37':  TYPE_COLORS.DEFAULT,
  '40':  TYPE_COLORS.DEFAULT,
  '42':  TYPE_COLORS.DEFAULT,
  '43':  TYPE_COLORS.DEFAULT,
  '66':  TYPE_COLORS.DEFAULT,
  '200': TYPE_COLORS.DEFAULT,
  '300': TYPE_COLORS.DEFAULT,

  // ── Fallback ─────────────────────────────────────────────────────────────
  default: TYPE_COLORS.DEFAULT,
}

/**
 * Hent officiel Movia farve for en linje.
 * Forsøger direkte opslag, derefter suffix-matching, ellers default.
 *
 * @param {string|number} line
 * @returns {string} hex-farvekode
 */
export function getLineColor(line) {
  const key = String(line).toUpperCase()

  // Direct match
  if (LINE_COLORS[key])           return LINE_COLORS[key]
  if (LINE_COLORS[String(line)])  return LINE_COLORS[String(line)]

  // Suffix-based fallback
  if (key.endsWith('A'))  return TYPE_COLORS.A
  if (key.endsWith('S'))  return TYPE_COLORS.S
  if (key.endsWith('C'))  return TYPE_COLORS.C
  if (key.endsWith('E'))  return TYPE_COLORS.E
  if (key.startsWith('N') && /^N\d/.test(key)) return TYPE_COLORS.NAT

  return TYPE_COLORS.DEFAULT
}
