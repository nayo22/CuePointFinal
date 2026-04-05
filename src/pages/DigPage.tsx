import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Preview30sPlayer } from '../components/Preview30sPlayer'
import { SpotifyInsightBars } from '../components/SpotifyInsightBars'
import { addToCrate } from '../features/crate/crateSlice'
import { isHarmonicMatch } from '../lib/harmonicMatch'
import { coverUrl } from '../lib/coverUrl'
import { isSpotifyConfigured } from '../lib/spotifyConfig'
import { readSpotifyTokens } from '../lib/spotifyTokens'
import { searchDigTracks } from '../services/digSearch'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Track } from '../types/models'

export function DigPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const dispatch = useAppDispatch()
  const crateIds = useAppSelector((s) => s.crate.ids)
  const draftTracks = useAppSelector((s) => s.draft.tracks)

  const [results, setResults] = useState<Track[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [spotifyLive, setSpotifyLive] = useState(
    () => isSpotifyConfigured() && readSpotifyTokens() != null,
  )

  useEffect(() => {
    function sync() {
      setSpotifyLive(isSpotifyConfigured() && readSpotifyTokens() != null)
    }
    window.addEventListener('cuepoint-spotify-auth', sync)
    return () => window.removeEventListener('cuepoint-spotify-auth', sync)
  }, [])

  useEffect(() => {
    let cancelled = false
    searchDigTracks(q)
      .then((list) => {
        if (!cancelled) {
          setSearchError(null)
          setResults(list)
        }
      })
      .catch(() => {
        if (!cancelled) setSearchError('Search failed. Try again.')
      })
    return () => {
      cancelled = true
    }
  }, [q])

  const anchor = useMemo(() => {
    const list = draftTracks
    return list[list.length - 1]
  }, [draftTracks])

  const rows = useMemo(
    () =>
      results.map((t) => ({
        track: t,
        match: isHarmonicMatch(t, anchor),
      })),
    [results, anchor],
  )

  return (
    <>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--orange">Search results</span>
        <span className="chip chip--green">Audio insights</span>
        <span className="chip chip--neutral">Smart Crate</span>
      </div>

      <section className="panel panel-gap panel--accent-orange">
        <h2>Search & filters</h2>
        <div className="filter-bar">
          <div className="field field--inline">
            <label htmlFor="dig-key">Key</label>
            <select id="dig-key" defaultValue="">
              <option value="">Any</option>
              <option value="8A">8A</option>
              <option value="9A">9A</option>
              <option value="10A">10A</option>
            </select>
          </div>
          <div className="field field--inline">
            <label htmlFor="dig-bpm-min">BPM min</label>
            <input id="dig-bpm-min" type="number" defaultValue={120} />
          </div>
          <div className="field field--inline">
            <label htmlFor="dig-bpm-max">BPM max</label>
            <input id="dig-bpm-max" type="number" defaultValue={135} />
          </div>
          <label className="check faux-check">
            <input type="checkbox" defaultChecked readOnly /> Harmonic filter
          </label>
          <label className="check faux-check">
            <input type="checkbox" defaultChecked readOnly /> Thumbnail art
          </label>
        </div>
        {q ? (
          <p className="search-query-line mono">Query: “{q}”</p>
        ) : (
          <p className="search-query-line mono">Sample discovery results</p>
        )}
        {searchError ? (
          <p className="login-error" role="alert">
            {searchError}
          </p>
        ) : null}
        {!spotifyLive && isSpotifyConfigured() ? (
          <p className="mono search-query-line">
            Connect Spotify from Login or Profile to search the real catalog.
          </p>
        ) : null}
      </section>

      {anchor ? (
        <p className="anchor-line">
          Harmonic anchor: {anchor.artist} — {anchor.key} @ {anchor.bpm} BPM
        </p>
      ) : null}

      <div className="dig-grid">
        {rows.map(({ track: t, match }) => {
          const inCrate = crateIds.includes(t.id)
          return (
            <article
              key={t.id}
              className={`panel dig-card ${match ? 'dig-card--match' : ''}`}
            >
              <div className="dig-card-top">
                <img
                  className="track-cover"
                  src={coverUrl(t.coverSeed, 72)}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h3 className="dig-card-title">{t.title}</h3>
                  <p className="dig-card-artist">{t.artist}</p>
                  <p className="mono dig-card-meta">
                    {t.key} · {t.bpm} BPM
                  </p>
                  {match ? (
                    <span className="chip chip--green">Harmonic match</span>
                  ) : null}
                </div>
              </div>
              <SpotifyInsightBars
                danceability={t.danceability}
                energy={t.spotifyEnergy}
                acousticness={t.acousticness}
              />
              <p className="discogs-line mono">
                Label: {t.label} ({t.year})
              </p>
              <Preview30sPlayer
                trackTitle={t.title}
                previewUrl={t.previewUrl}
              />
              <div className="dig-card-actions">
                <button
                  type="button"
                  className="btn btn-primary btn--sm"
                  disabled={inCrate}
                  onClick={() => dispatch(addToCrate(t.id))}
                >
                  {inCrate ? 'In Smart Crate' : 'Add to Smart Crate'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn--sm"
                  disabled={!t.spotifyOpenUrl}
                  onClick={() => {
                    if (t.spotifyOpenUrl) window.open(t.spotifyOpenUrl, '_blank')
                  }}
                >
                  Open in Spotify
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
