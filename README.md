# Movia Kortgenerator

Webværktøj til automatisk generering af stoppestedskort til fysiske busskylte og digitale skærme (Buster).

## Kom i gang

```bash
npm install
npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173) i din browser.

## Workflow

1. Eksporter et GeoJSON-lag fra jeres GIS-system med stoppesteder
2. Upload filen i værktøjet
3. Vælg den linje du vil generere kort for
4. Preview alle stoppesteder — juster zoom per kort efter behov
5. Eksporter som PDF-pakke til print, eller brug de digitale views til Buster

## GeoJSON-format

Hvert stoppested skal være et `Point`-feature med mindst disse properties:

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [LNG, LAT] },
  "properties": {
    "name": "Stoppestedets navn",
    "line": "5C"
  }
}
```

Har et stoppested flere linjer, brug `"lines": ["5C", "250S"]` i stedet for `"line"`.

Tilpas property-navnene i `src/utils/geoParser.js` hvis jeres GIS-eksport bruger andre felter.

## Projektstruktur

```
src/
  components/
    Sidebar.jsx        # Filupload, linjevalg, eksport-knap
    PreviewGrid.jsx    # Grid med alle stopkort
    StopCard.jsx       # Ét kort med MapLibre-kort + zoom-kontrol
    EmptyState.jsx     # Tomt state når ingen linje er valgt
  utils/
    geoParser.js       # Parser GeoJSON → linjer og stoppesteder
    exportPDF.js       # PDF-eksport med html2canvas + jsPDF
  styles/
    global.css         # Design tokens (farver, fonte)
    app.css            # App-layout
public/
  sample-data/
    sample-stops.geojson   # Testdata med linje 5C og 26
```

## Næste skridt (til Claude Code)

Se `CLAUDE.md` for en prioriteret liste over features der mangler.

## Tech stack

- React + Vite
- MapLibre GL JS (OpenStreetMap/Carto basemap)
- jsPDF + html2canvas (PDF-eksport)
- Ingen backend — alt kører i browseren
