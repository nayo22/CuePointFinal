import { Link, useParams } from 'react-router-dom'
import { CrowdTagPills } from '../components/CrowdTagPills'
import { EnergyStrip } from '../components/EnergyStrip'
import { Preview30sPlayer } from '../components/Preview30sPlayer'
import { SpotifyInsightBars } from '../components/SpotifyInsightBars'
import { TechnicalThread } from '../components/TechnicalThread'
import { addToCrate } from '../features/crate/crateSlice'
import {
  crowdTagByTrackId,
  DRAFT_ID,
  perTrackThreads,
  resolveSet,
  setComments,
} from '../data/seed'
import { coverUrl } from '../lib/coverUrl'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function SetDetailPage() {
  const role = useAppSelector((s) => s.auth.role)
  const crateIds = useAppSelector((s) => s.crate.ids)
  const draftTracks = useAppSelector((s) => s.draft.tracks)
  const dispatch = useAppDispatch()
  const { id } = useParams()
  const set = resolveSet(id, draftTracks)
  const comments = id ? setComments[id] ?? [] : []
  const trackThreads = id ? perTrackThreads[id] ?? {} : {}

  if (!set) {
    return (
      <nav className="page-back-nav" aria-label="Back to explore">
        <Link to="/explore" className="page-back-link">
          ← Back to Explore
        </Link>
      </nav>
    )
  }

  const levels = set.tracks.map((t) => t.energy)
  const isOwn = set.id === DRAFT_ID
  const readOnly = role === 'spectator'

  return (
    <>
      <nav className="page-back-nav" aria-label="Back to explore">
        <Link to="/explore" className="page-back-link">
          ← Explore
        </Link>
      </nav>
      <div className="set-detail-heading">
        <h1 className="set-detail-page-title">{set.title}</h1>
        <p className="mono set-detail-sub">
          {set.dj} · {set.bpmRange} BPM
          {isOwn ? ' · Your draft' : ''}
        </p>
        <div className="chip-row set-detail-chips">
          <span className="chip chip--orange">{set.tracks.length} tracks</span>
          <span className="chip chip--green">Community and comments</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel panel--accent-orange">
          <h2>Set structure</h2>
          <EnergyStrip levels={levels} />
          <p className="mono chart-caption">Energy map from tags</p>
        </section>
        <section className="panel panel--accent-green">
          <h2>Set-level discussion</h2>
          <div className="feedback-block">
            {comments.length === 0 ? (
              <p className="empty-hint">No set comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="comment">
                  <div className="who">{c.author}</div>
                  <div>{c.body}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ul className="track-detail-list">
        {set.tracks.map((t, idx) => {
          const inCrate = crateIds.includes(t.id)
          return (
            <li key={t.id} className="panel track-detail-card">
              <div className="track-detail-head">
                <span className="mono track-slot">#{idx + 1}</span>
                <img
                  className="track-cover"
                  src={coverUrl(t.coverSeed, 64)}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h3 className="track-detail-title">{t.title}</h3>
                  <p className="track-detail-artist">{t.artist}</p>
                  <p className="mono track-detail-meta">
                    {t.bpm} BPM · {t.key} · {t.energy} energy
                  </p>
                </div>
              </div>

              <div className="track-detail-grid">
                <div>
                  <h4 className="micro-heading">Cue points</h4>
                  <p className="cue-block">
                    <strong>In:</strong> {t.cueIn || '—'}
                  </p>
                  <p className="cue-block">
                    <strong>Out:</strong> {t.cueOut || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="micro-heading">Rhythm and energy</h4>
                  <SpotifyInsightBars
                    danceability={t.danceability}
                    energy={t.spotifyEnergy}
                    acousticness={t.acousticness}
                  />
                </div>
                <div>
                  <h4 className="micro-heading">Label and year</h4>
                  <p className="track-meta-block mono">
                    {t.label} · {t.year}
                  </p>
                  <h4 className="micro-heading">Preview</h4>
                  <Preview30sPlayer
                    trackTitle={t.title}
                    previewUrl={t.previewUrl}
                  />
                </div>
                <div>
                  <h4 className="micro-heading">Crowd rating</h4>
                  <CrowdTagPills
                    active={crowdTagByTrackId[t.id] ?? null}
                    disabled={readOnly}
                  />
                </div>
              </div>

              {!readOnly ? (
                <div className="track-crate-row">
                  <button
                    type="button"
                    className="btn btn-secondary btn--sm"
                    disabled={inCrate}
                    onClick={() => dispatch(addToCrate(t.id))}
                  >
                    {inCrate ? 'In Smart Crate' : 'Add to Smart Crate'}
                  </button>
                </div>
              ) : null}

              <div className="track-thread-block">
                <h4 className="micro-heading">Technical comments</h4>
                <TechnicalThread threads={trackThreads[t.id] ?? []} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
