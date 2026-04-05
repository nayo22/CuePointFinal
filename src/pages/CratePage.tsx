import { useMemo } from 'react'
import { TrackCover } from '../components/TrackCover'
import { removeFromCrate } from '../features/crate/crateSlice'
import { allTracksForCrate, alsoInCratesByTrackId } from '../data/seed'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Track } from '../types/models'

export function CratePage() {
  const dispatch = useAppDispatch()
  const ids = useAppSelector((s) => s.crate.ids)
  const draftTracks = useAppSelector((s) => s.draft.tracks)

  const saved = useMemo(() => {
    const pool = new Map(
      allTracksForCrate(draftTracks).map((t) => [t.id, t]),
    )
    return ids.map((id) => pool.get(id)).filter((t): t is Track => t != null)
  }, [ids, draftTracks])

  return (
    <>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--orange">{saved.length} saved</span>
        <span className="chip chip--green">Synced to this browser</span>
      </div>

      <div className="panel panel--accent-orange">
        <h2>Smart Crate</h2>
        <p className="api-card-desc crate-intro">
          Saved tracks from Search and sets. Other DJs who saved the same titles
          show up in the last column.
        </p>
        {saved.length === 0 ? (
          <p className="empty-hint">Crate is empty — add from Search or a set.</p>
        ) : (
          <div className="table-wrap">
            <table className="data crate-table">
              <thead>
                <tr>
                  <th>Art</th>
                  <th>Track</th>
                  <th>Meta</th>
                  <th>Label</th>
                  <th>Also in crates</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {saved.map((t) => {
                  const others = alsoInCratesByTrackId[t.id] ?? []
                  return (
                    <tr key={t.id}>
                      <td>
                        <TrackCover seed={t.coverSeed} title={t.title} size={48} />
                      </td>
                      <td>
                        <strong>{t.title}</strong>
                        <div className="track-sub">{t.artist}</div>
                      </td>
                      <td className="mono">
                        {t.key} · {t.bpm} BPM
                      </td>
                      <td className="mono">
                        {t.label} ({t.year})
                      </td>
                      <td>
                        {others.length ? (
                          <span className="crate-others">{others.join(', ')}</span>
                        ) : (
                          <span className="empty-hint">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn--sm"
                          onClick={() => dispatch(removeFromCrate(t.id))}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
