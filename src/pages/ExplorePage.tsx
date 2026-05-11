import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isHarmonicMatch } from '../lib/harmonicMatch'
import { fetchCommunitySets } from '../services/backend'
import { useAppSelector } from '../store/hooks'
import type { Setlist, Track } from '../types/models'

function bpmRangeMidpoint(range: string): number {
  const nums = range.match(/\d+/g)?.map(Number) ?? []
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function visibleTracksForSet(
  set: Setlist,
  harmonicOnly: boolean,
  anchor: Track | undefined,
): Track[] {
  if (harmonicOnly && anchor) {
    return set.tracks.filter((t) => isHarmonicMatch(t, anchor))
  }
  return set.tracks
}

export function ExplorePage() {
  const draftTracks = useAppSelector((s) => s.draft.tracks)
  const [sets, setSets] = useState<Setlist[] | null>(null)
  const [sort, setSort] = useState<'score' | 'bpm'>('score')
  const [djFilter, setDjFilter] = useState('')
  const [harmonicOnly, setHarmonicOnly] = useState(false)

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

  const list = useMemo(() => sets ?? [], [sets])

  const filteredSets = useMemo(() => {
    const q = djFilter.trim().toLowerCase()
    let rows = list
    if (q.length > 0) {
      rows = rows.filter((s) => s.dj.toLowerCase().includes(q))
    }
    if (harmonicOnly && anchor) {
      rows = rows.filter((s) =>
        s.tracks.some((t) => isHarmonicMatch(t, anchor)),
      )
    }
    const next = [...rows]
    if (sort === 'score') {
      next.sort((a, b) => b.score - a.score)
    } else {
      next.sort(
        (a, b) => bpmRangeMidpoint(a.bpmRange) - bpmRangeMidpoint(b.bpmRange),
      )
    }
    return next
  }, [list, djFilter, harmonicOnly, anchor, sort])

  const matchMap = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const s of filteredSets) {
      for (const t of visibleTracksForSet(s, harmonicOnly, anchor)) {
        m.set(`${s.id}:${t.id}`, isHarmonicMatch(t, anchor))
      }
    }
    return m
  }, [filteredSets, harmonicOnly, anchor])

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
            <select
              id="ex-sort"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value === 'bpm' ? 'bpm' : 'score')
              }
            >
              <option value="score">Structure score</option>
              <option value="bpm">BPM range (high to low)</option>
            </select>
          </div>
          <div className="field field--inline">
            <label htmlFor="ex-dj">DJ</label>
            <input
              id="ex-dj"
              type="text"
              placeholder="Filter by name…"
              value={djFilter}
              onChange={(e) => setDjFilter(e.target.value)}
            />
          </div>
          <label className="check faux-check">
            <input
              type="checkbox"
              checked={harmonicOnly}
              disabled={!anchor}
              title={
                anchor
                  ? undefined
                  : 'Add a track to your draft to use this filter'
              }
              onChange={(e) => setHarmonicOnly(e.target.checked)}
            />{' '}
            Only harmonic matches
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
        {filteredSets.map((set) => {
          const tracks = visibleTracksForSet(set, harmonicOnly, anchor)
          return (
            <li key={set.id} className="panel explore-card panel--accent-orange">
              <Link to={`/sets/${set.id}`}>
                <strong>{set.title}</strong>
                <div className="meta">
                  {set.dj} · {set.tracks.length} tracks · {set.bpmRange} BPM · score{' '}
                  {set.score}
                </div>
              </Link>
              <ul className="explore-track-list">
                {tracks.map((t) => {
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
          )
        })}
      </ul>
    </>
  )
}
