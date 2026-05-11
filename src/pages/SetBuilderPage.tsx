import { useMemo, useState } from 'react'
import { EnergyStrip } from '../components/EnergyStrip'
import { SetBuilderLiveCharts } from '../components/SetBuilderLiveCharts'
import { addDraftTrack, makeDraftTrack } from '../features/draft/draftSlice'
import { isHarmonicMatch } from '../lib/harmonicMatch'
import { coverUrl } from '../lib/coverUrl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Energy } from '../types/models'

function energyClass(e: string) {
  if (e === 'low') return 'tag tag-low'
  if (e === 'mid') return 'tag tag-mid'
  return 'tag tag-high'
}

function energyToChartValue(e: 'low' | 'mid' | 'high'): number {
  if (e === 'low') return 0.35
  if (e === 'mid') return 0.62
  return 0.94
}

export function SetBuilderPage() {
  const tracks = useAppSelector((s) => s.draft.tracks)
  const dispatch = useAppDispatch()

  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newBpm, setNewBpm] = useState('126')
  const [newKey, setNewKey] = useState('8A')
  const [newEnergy, setNewEnergy] = useState<Energy>('mid')

  const levels = tracks.map((t) => t.energy)
  const bpms = tracks.map((t) => t.bpm)
  const energySeries = tracks.map((t) => energyToChartValue(t.energy))

  const compatFlags = useMemo(
    () =>
      tracks.map((t, i) => {
        if (i === 0) return false
        return isHarmonicMatch(t, tracks[i - 1])
      }),
    [tracks],
  )

  function handleAddTrack() {
    const track = makeDraftTrack({
      title: newTitle,
      artist: newArtist,
      bpm: Number(newBpm),
      key: newKey,
      energy: newEnergy,
    })
    dispatch(addDraftTrack(track))
    setNewTitle('')
    setNewArtist('')
    setNewBpm('126')
    setNewKey('8A')
    setNewEnergy('mid')
  }

  return (
    <>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--orange">Professional set architect</span>
        <span className="chip chip--green">BPM and energy charts</span>
      </div>

      <div className="toolbar-row panel panel-gap panel--accent-orange">
        <span className="toolbar-label mono">Acciones</span>
        <button
          type="button"
          className="btn btn-secondary btn--sm"
          onClick={() => {
            const body = JSON.stringify(
              { tracks, exportedAt: new Date().toISOString() },
              null,
              2,
            )
            const blob = new Blob([body], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'cuepoint-set.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          Descargar set (JSON)
        </button>
        <span className="toolbar-hint mono">
          Incluye la lista actual del borrador
        </span>
      </div>

      <div className="grid-2">
        <SetBuilderLiveCharts bpms={bpms} energySeries={energySeries} />
      </div>

      <div className="panel panel-gap panel--accent-green">
        <h2>Energy map (rollercoaster)</h2>
        <EnergyStrip levels={levels} label="Energy progression for current set" />
      </div>

      <div className="panel panel--accent-orange">
        <h2>Tracks</h2>
        <p className="builder-table-hint mono">
          Title, artist, BPM, key, mix notes, Low / Mid / High
        </p>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Art</th>
                <th>#</th>
                <th>Track</th>
                <th>Artist</th>
                <th>BPM</th>
                <th>Key</th>
                <th>Energy</th>
                <th>Δ prev</th>
                <th>Cue in</th>
                <th>Cue out</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t, i) => (
                <tr key={t.id}>
                  <td>
                    <img
                      className="track-cover"
                      src={coverUrl(t.coverSeed, 40)}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                    />
                  </td>
                  <td className="mono">{i + 1}</td>
                  <td>{t.title}</td>
                  <td>{t.artist}</td>
                  <td className="mono">{t.bpm}</td>
                  <td className="mono">{t.key}</td>
                  <td>
                    <span className={energyClass(t.energy)}>{t.energy}</span>
                  </td>
                  <td className="mono">
                    {i === 0
                      ? '—'
                      : compatFlags[i]
                        ? 'match'
                        : '—'}
                  </td>
                  <td className="table-cell-cue">{t.cueIn}</td>
                  <td className="table-cell-cue">{t.cueOut}</td>
                </tr>
              ))}
              <tr className="add-row">
                <td colSpan={10}>
                  <div className="add-track-row">
                    <span className="mono add-track-label">New</span>
                    <input
                      type="text"
                      placeholder="Track title"
                      aria-label="New track title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Artist"
                      aria-label="New artist"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="BPM"
                      aria-label="New BPM"
                      value={newBpm}
                      onChange={(e) => setNewBpm(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      aria-label="New key"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                    <select
                      aria-label="New energy tag"
                      value={newEnergy}
                      onChange={(e) => setNewEnergy(e.target.value as Energy)}
                    >
                      <option value="low">low</option>
                      <option value="mid">mid</option>
                      <option value="high">high</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-primary btn--sm"
                      onClick={handleAddTrack}
                    >
                      Add track
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
