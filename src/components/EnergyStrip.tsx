import type { Energy } from '../types/models'

type Props = {
  levels: Energy[]
  label?: string
}

export function EnergyStrip({ levels, label = 'Energy curve for this set' }: Props) {
  return (
    <div className="energy-strip" role="img" aria-label={label}>
      {levels.map((e, i) => (
        <div key={`${e}-${i}`} className={`energy-bar ${e}`} title={e} />
      ))}
    </div>
  )
}
