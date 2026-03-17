# CLAUDE.md — Instruktioner til Claude Code

Dette er Movia Kortgeneratoren. Et React + Vite webværktøj der genererer stoppestedskort
til fysiske busskylte og digitale skærme, baseret på GeoJSON-data fra et GIS-system.

## Projektets formål

Movia (dansk offentlig transport) har hundredvis af busstoppesteder. Kortene på skiltene
laves i dag manuelt i Illustrator/InDesign — inkonsistent og svært at vedligeholde.
Dette værktøj automatiserer processen: upload GeoJSON, vælg linje, eksporter PDF-pakke.

## Tech stack

- React 18 + Vite 5
- MapLibre GL JS 4 (kortrendering, ingen API-nøgle påkrævet)
- jsPDF + html2canvas (PDF-eksport)
- IBM Plex Sans + IBM Plex Mono (fonte)
- Ingen backend — alt kører i browseren

## Design tokens (må ikke ændres uden grund)

```css
--color-accent:   #E2001A   /* Movia rød */
--color-accent-2: #002D5F   /* Movia mørkeblå */
--color-bg:       #F4F2EE
--color-surface:  #FFFFFF
--font-sans: 'IBM Plex Sans'
--font-mono: 'IBM Plex Mono'
```

## Prioriterede næste features

### 1. Kortrotation per stoppested
I `StopCard.jsx`: tilføj en rotationsknap (0°, 45°, 90°, 180°) der roterer kortudsnittets
bearing via `map.rotateTo(bearing)`. Gem rotationen i lokal state.

### 2. Linjekorridor på kortet
I `StopCard.jsx`: når kortet loader, tegn linjegeometrien (LineString fra GeoJSON) som
et farvet lag oven på basemappet. Brug `map.addSource` + `map.addLayer` med type `line`.
Linjefarven hentes fra `LINE_COLORS` i `src/utils/lineColors.js` (skal oprettes).

### 3. Linjefarvefil
Opret `src/utils/lineColors.js` med et objekt der mapper linjenumre til hex-farver,
f.eks. `{ '5C': '#E2001A', '250S': '#0066CC', default: '#002D5F' }`.
Bruges af både `StopCard.jsx` og `exportPDF.js`.

### 4. Forbedret PDF-eksport
I `exportPDF.js`: 
- Tilføj Movias logo øverst på hver side (SVG inline eller PNG fra `/public/`)
- Sæt korrekt papirformat: A4 portræt til print, 16:9 til digitale skærme
- Tilføj en forside med linjenummer og dato for generering
- Brug `pdf.setFont` til IBM Plex Sans hvis muligt, ellers Arial

### 5. Stoprækkefølge
I `geoParser.js`: sorter stoppesteder langs linjen baseret på `properties.sequence`
eller `properties.order` hvis det findes i GeoJSON. Hvis ikke, sorter geografisk
langs linjegeometrien (nearest-neighbor fra LineString start).

### 6. Batch-zoom
I `PreviewGrid.jsx`: tilføj en global zoom-slider øverst der sætter zoom-niveau
for alle kort på én gang. Hvert kort kan stadig overrides individuelt.

### 7. Digital output-mode
Tilføj en toggle i `Sidebar.jsx`: "Print" vs "Digital (Buster)".
I digital mode: ændre kortdimensionerne i `StopCard.jsx` til 16:9 ratio,
skjul print-specifikke elementer, og tilføj QR-kode placeholder.

### 8. GIS API-integration (avanceret)
Tilføj et inputfelt i `Sidebar.jsx` til en GeoJSON-URL (f.eks. ArcGIS REST endpoint).
Fetch data'en med `fetch(url)` og parse som GeoJSON. Gem URL i `localStorage`
så den huskes mellem sessioner.

## Kendte begrænsninger at have in mente

- MapLibre kort kan ikke direkte captures med html2canvas pga. WebGL.
  Løsning: brug `map.getCanvas().toDataURL()` direkte fra MapLibre i stedet for html2canvas
  til kortdelen, og kombiner med html2canvas for resten af kortet.
- Carto basemap kræver internettilgang. Til offline-brug: overvej et lokalt PMTiles-lag.

## Filstruktur

```
src/
  components/
    Sidebar.jsx / .css
    PreviewGrid.jsx / .css
    StopCard.jsx / .css
    EmptyState.jsx / .css
  utils/
    geoParser.js      # extractLines(), extractStopsForLine()
    exportPDF.js      # exportToPDF(stops, line)
    lineColors.js     # MANGLER — skal oprettes (se punkt 3 ovenfor)
  styles/
    global.css        # Design tokens
    app.css           # App-layout
public/
  sample-data/
    sample-stops.geojson   # Testdata: linje 5C og 26 i København
```

## Testdata

Brug `/public/sample-data/sample-stops.geojson` til at teste.
Den indeholder 5 stoppesteder på linje 5C og 3 på linje 26.
Property-strukturen: `{ name, line, zone }`.
