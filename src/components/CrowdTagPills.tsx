import type { CrowdTag } from '../types/models'

type Props = {
  active: CrowdTag | null
  disabled?: boolean
}

export function CrowdTagPills({ active, disabled }: Props) {
  return (
    <div className="rating-row" aria-label="Crowd validation tags">
      <span
        className={`pill ${active === 'dancefloor_killer' ? 'active' : ''}`}
      >
        Dancefloor killer
      </span>
      <span className={`pill ${active === 'bridge_track' ? 'active' : ''}`}>
        Bridge track
      </span>
      {disabled ? (
        <span className="mono read-only-hint">Read-only (spectator)</span>
      ) : null}
    </div>
  )
}
