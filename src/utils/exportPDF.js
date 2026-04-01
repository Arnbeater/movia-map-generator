/**
 * exportPDF.js
 * Generates a PDF package with one map per stop.
 *
 * Leaflet uses DOM/Canvas (not WebGL), so html2canvas can capture
 * the full .stop-card including the map in a single pass.
 */

export async function exportToPDF(stops, line) {
  const { jsPDF }   = await import('jspdf')
  const html2canvas = (await import('html2canvas')).default

  const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW  = 190   // usable width (mm) — A4 210 mm minus 10 mm margins each side
  const marginX = 10
  const marginY = 10

  const cards = document.querySelectorAll('.stop-card')

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]

    const cardCanvas = await html2canvas(card, {
      scale:   2,
      useCORS: true,
      logging: false,
    })

    const cardImg = cardCanvas.toDataURL('image/png')
    const cardMmH = (cardCanvas.height * pageW) / cardCanvas.width

    if (i > 0) pdf.addPage()
    pdf.addImage(cardImg, 'PNG', marginX, marginY, pageW, cardMmH)
  }

  pdf.save(`movia-kort-linje-${line}.pdf`)
}
