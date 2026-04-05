type Props = {
  danceability: number
  energy: number
  acousticness: number
}

const rows: { key: keyof Props; label: string; fillClass: string }[] = [
  { key: 'danceability', label: 'Danceability', fillClass: 'insight-fill-orange' },
  { key: 'energy', label: 'Energy', fillClass: 'insight-fill-green' },
  { key: 'acousticness', label: 'Acousticness', fillClass: 'insight-fill-muted' },
]

export function SpotifyInsightBars({ danceability, energy, acousticness }: Props) {
  const v = { danceability, energy, acousticness }
  return (
    <div className="insight-bars" aria-label="Audio feature levels">
      {rows.map(({ key, label, fillClass }) => (
        <div key={key} className="insight-bar-row">
          <span className="insight-bar-label">{label}</span>
          <div className="insight-bar-track">
            <div
              className={`insight-bar-fill ${fillClass}`}
              style={{ width: `${Math.round(v[key] * 100)}%` }}
            />
          </div>
          <span className="insight-bar-val mono">{v[key].toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
