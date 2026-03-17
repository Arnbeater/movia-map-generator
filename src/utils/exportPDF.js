/**
 * exportPDF.js
 * Generates a PDF package with one map per stop.
 *
 * MapLibre GL uses WebGL — html2canvas cannot capture it.
 * Strategy:
 *   1. html2canvas captures the full .stop-card with the map wrapper IGNORED
 *      (produces layout + header + footer, map area left blank/white)
 *   2. map.getCanvas().toDataURL() captures the WebGL canvas directly
 *      (requires preserveDrawingBuffer: true in the MapLibre Map constructor)
 *   3. jsPDF overlays the map image at the correct position using
 *      getBoundingClientRect() to translate pixel offsets → mm coordinates
 */

export async function exportToPDF(stops, line) {
  const { jsPDF }   = await import('jspdf')
  const html2canvas = (await import('html2canvas')).default

  const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 190   // usable width (mm) — A4 210 mm minus 10 mm margins each side
  const marginX = 10
  const marginY = 10

  const cards = document.querySelectorAll('.stop-card')

  for (let i = 0; i < cards.length; i++) {
    const card       = cards[i]
    const mapWrapper = card.querySelector('.stop-map-wrapper')
    const mapCanvas  = mapWrapper?.querySelector('canvas')

    // ── 1. Capture everything except the map wrapper ──────────────────────
    const cardCanvas = await html2canvas(card, {
      scale:          2,
      useCORS:        true,
      logging:        false,
      ignoreElements: el => el === mapWrapper,
    })
    const cardImg  = cardCanvas.toDataURL('image/png')
    const cardMmH  = (cardCanvas.height * pageW) / cardCanvas.width

    if (i > 0) pdf.addPage()
    pdf.addImage(cardImg, 'PNG', marginX, marginY, pageW, cardMmH)

    // ── 2. Overlay the MapLibre WebGL canvas at the correct mm position ───
    if (mapCanvas) {
      const cardRect = card.getBoundingClientRect()
      const mapRect  = mapWrapper.getBoundingClientRect()

      // Convert pixel offsets to mm using the same scale as the PDF layout
      const scale     = pageW / cardRect.width
      const offsetY   = (mapRect.top  - cardRect.top)  * scale
      const offsetX   = (mapRect.left - cardRect.left) * scale
      const mapMmW    = mapRect.width  * scale
      const mapMmH    = mapRect.height * scale

      const mapImg = mapCanvas.toDataURL('image/png')
      pdf.addImage(mapImg, 'PNG', marginX + offsetX, marginY + offsetY, mapMmW, mapMmH)
    }
  }

  pdf.save(`movia-kort-linje-${line}.pdf`)
}
