import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isHarmonicMatch } from '../lib/harmonicMatch'
import { fetchCommunitySets } from '../services/backend'
import { useAppSelector } from '../store/hooks'
import type { Setlist } from '../types/models'

export function ExplorePage() {
  const draftTracks = useAppSelector((s) => s.draft.tracks)
  const [sets, setSets] = useState<Setlist[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCommunitySets().then((list) => {
      if (!cancelled) setSets(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const anchor = useMemo(() => {
    const list = draftTracks
    return list[list.length - 1]
  }, [draftTracks])

  const list = sets ?? []

  const matchMap = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const s of list) {
      for (const t of s.tracks) {
        m.set(`${s.id}:${t.id}`, isHarmonicMatch(t, anchor))
      }
    }
    return m
  }, [list, anchor])

  return (
    <>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--orange">{list.length} community sets</span>
        <span className="chip chip--green">Harmonic matcher</span>
      </div>

      <section className="panel panel-gap panel--accent-orange">
        <h2>Browse filters</h2>
        <div className="filter-bar">
          <div className="field field--inline">
            <label htmlFor="ex-sort">Sort</label>
            <select id="ex-sort" defaultValue="score">
              <option value="score">Structure score</option>
              <option value="bpm">BPM range</option>
            </select>
          </div>
          <div className="field field--inline">
            <label htmlFor="ex-dj">DJ</label>
            <input id="ex-dj" type="text" placeholder="Filter by name…" />
          </div>
          <label className="check faux-check">
            <input type="checkbox" defaultChecked readOnly /> Only harmonic matches
          </label>
        </div>
      </section>

      {anchor ? (
        <p className="anchor-line">
          Anchor (draft): {anchor.artist} — {anchor.key} @ {anchor.bpm} BPM
        </p>
      ) : null}

      {sets === null ? (
        <p className="panel panel--accent-orange">Loading sets…</p>
      ) : null}

      <ul className="set-list">
        {list.map((set) => (
          <li key={set.id} className="panel explore-card panel--accent-orange">
            <Link to={`/sets/${set.id}`}>
              <strong>{set.title}</strong>
              <div className="meta">
                {set.dj} · {set.tracks.length} tracks · {set.bpmRange} BPM · score{' '}
                {set.score}
              </div>
            </Link>
            <ul className="explore-track-list">
              {set.tracks.map((t) => {
                const match = matchMap.get(`${set.id}:${t.id}`) ?? false
                return (
                  <li
                    key={t.id}
                    className={
                      match
                        ? 'explore-track-item explore-track-item--match'
                        : 'explore-track-item'
                    }
                  >
                    {t.title} · {t.key} · {t.bpm} BPM
                    {match ? ' · harmonic match' : ''}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}
