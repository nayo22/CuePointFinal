import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EnergyStrip } from '../components/EnergyStrip'
import { buildDraftSetlist, communitySets } from '../data/seed'
import { isHarmonicMatch } from '../lib/harmonicMatch'
import { useAppSelector } from '../store/hooks'

export function DashboardPage() {
  const draftTracks = useAppSelector((s) => s.draft.tracks)
  const notifications = useAppSelector((s) => s.inbox.notifications)
  const activity = useAppSelector((s) => s.inbox.activity)
  const myDraft = buildDraftSetlist(draftTracks)
  const levels = myDraft.tracks.map((t) => t.energy)
  const ranked = [...communitySets].sort((a, b) => b.score - a.score)
  const crateCount = useAppSelector((s) => s.crate.ids.length)

  const anchor = useMemo(() => {
    const list = myDraft.tracks
    return list[list.length - 1]
  }, [myDraft.tracks])

  const harmonicPreviewCount = useMemo(() => {
    let n = 0
    for (const s of communitySets) {
      for (const t of s.tracks) {
        if (isHarmonicMatch(t, anchor)) n += 1
      }
    }
    return n
  }, [anchor])

  return (
    <>
      <p className="mission-tagline">
        Build sets with energy, harmony, and a crate that travels with you. Explore
        what the community is doing and level up every session.
      </p>

      <div className="chip-row page-chips-bar" aria-label="Quick stats">
        <span className="chip chip--orange">{myDraft.tracks.length} tracks · draft</span>
        <span className="chip chip--green">{myDraft.bpmRange} BPM</span>
        <span className="chip chip--green">Smart Crate: {crateCount}</span>
        <span className="chip chip--orange">Harmonic hits (explore): {harmonicPreviewCount}</span>
      </div>

      <div className="grid-3">
        <section className="panel panel--accent-orange" aria-labelledby="dash-draft">
          <h2 id="dash-draft">Active set</h2>
          <p className="set-title-line">
            <strong>{myDraft.title}</strong>
            <span> · {myDraft.bpmRange} BPM</span>
          </p>
          <EnergyStrip levels={levels} />
          <p className="muted-link-block">
            <Link to="/builder">Set Builder & charts →</Link>{' '}
            <Link to="/sets/draft-1">Open draft detail →</Link>
          </p>
        </section>

        <section className="panel panel--accent-orange" aria-labelledby="dash-notif">
          <h2 id="dash-notif">Inbox</h2>
          <p className="mono dash-mini-hint">Crate saves and comments</p>
          <ul className="dash-notif-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={n.read ? 'dash-notif-item' : 'dash-notif-item dash-notif-item--new'}
              >
                <div className="dash-notif-title">{n.title}</div>
                <div className="dash-notif-detail">{n.detail}</div>
                <div className="mono dash-notif-time">{n.time}</div>
              </li>
            ))}
          </ul>
          <p className="muted-link-block">
            <Link to="/crate">Smart Crate →</Link>
          </p>
        </section>

        <section className="panel panel--accent-green" aria-labelledby="dash-activity">
          <h2 id="dash-activity">Activity</h2>
          <ul className="activity-list">
            {activity.map((a) => (
              <li key={a.id}>
                <span className="activity-text">{a.text}</span>
                <span className="mono activity-time">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel panel--accent-orange">
          <h2>Weekly structure ranking</h2>
          <ul className="set-list">
            {ranked.slice(0, 4).map((s, i) => (
              <li key={s.id}>
                <Link to={`/sets/${s.id}`}>
                  <div>
                    <strong>
                      #{i + 1} {s.title}
                    </strong>
                    <div className="meta">
                      {s.dj} · score {s.score} · {s.bpmRange} BPM
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="muted-link-block">
            <Link to="/ranking">Full leaderboard →</Link>
          </p>
        </section>

        <section className="panel panel--accent-green">
          <h2>Harmonic mixing</h2>
          <p className="api-card-desc">
            The anchor is the last track in your draft. On Explore you can see which
            rows line up in key and tempo.
          </p>
          <p className="anchor-line dash-anchor">
            Anchor: {anchor?.artist} — {anchor?.key} @ {anchor?.bpm} BPM
          </p>
          <p className="muted-link-block">
            <Link to="/explore">Explore sets →</Link>
          </p>
        </section>
      </div>

      <section className="panel panel-spaced">
        <h2>Your music</h2>
        <p className="api-card-desc">
          From Profile you can link your streaming account to search tracks and see
          more detail while you build sets.
        </p>
        <div className="chip-row">
          <span className="chip chip--orange">Spotify</span>
        </div>
      </section>
    </>
  )
}
