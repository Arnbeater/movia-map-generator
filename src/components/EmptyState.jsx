import './EmptyState.css'

export default function EmptyState({ hasData }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⬡</div>
      <h2 className="empty-title">
        {hasData ? 'Vælg en linje i sidepanelet' : 'Upload GeoJSON for at starte'}
      </h2>
      <p className="empty-body">
        {hasData
          ? 'Kortene genereres automatisk for alle stoppesteder på linjen.'
          : 'Eksporter et GeoJSON-lag fra jeres GIS-system med stoppesteder og linjegeometri.'
        }
      </p>
    </div>
  )
}
