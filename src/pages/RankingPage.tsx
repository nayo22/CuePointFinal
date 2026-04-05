import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCommunitySets } from '../services/backend'
import type { Setlist } from '../types/models'

const deltaWeek = ['▲ 2', '—', '▼ 1', '▲ 1', '—']

export function RankingPage() {
  const [rows, setRows] = useState<Setlist[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCommunitySets().then((list) => {
      if (!cancelled) {
        setRows([...list].sort((a, b) => b.score - a.score))
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--orange">Refreshes weekly</span>
      </div>

      <div className="panel panel--accent-green">
        <h2>Leaderboard</h2>
        {rows === null ? (
          <p>Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Set</th>
                  <th>DJ</th>
                  <th>Score</th>
                  <th>BPM</th>
                  <th>Δ week</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={s.id}>
                    <td className="mono">{i + 1}</td>
                    <td>
                      <Link to={`/sets/${s.id}`}>{s.title}</Link>
                    </td>
                    <td>{s.dj}</td>
                    <td className="mono">{s.score}</td>
                    <td className="mono">{s.bpmRange}</td>
                    <td className="mono">{deltaWeek[i] ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
