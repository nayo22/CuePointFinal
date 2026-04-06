import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isFirebaseConfigured } from '../lib/firebase'
import { getSpotifyRedirectUri, isSpotifyConfigured } from '../lib/spotifyConfig'
import {
  beginSpotifyLogin,
  disconnectSpotify,
} from '../lib/spotifyAuth'
import { readSpotifyTokens } from '../lib/spotifyTokens'
import { useAppSelector } from '../store/hooks'

export function ProfilePage() {
  const email = useAppSelector((s) => s.auth.email)
  const uid = useAppSelector((s) => s.auth.uid)
  const firebaseConfigured = isFirebaseConfigured()
  const canLinkSpotify = !firebaseConfigured || uid != null
  const [spotifyOn, setSpotifyOn] = useState(() => readSpotifyTokens() != null)
  const [spotifyHint, setSpotifyHint] = useState<string | null>(null)

  useEffect(() => {
    function sync() {
      setSpotifyOn(readSpotifyTokens() != null)
    }
    window.addEventListener('cuepoint-spotify-auth', sync)
    return () => window.removeEventListener('cuepoint-spotify-auth', sync)
  }, [])

  return (
    <>
      <nav className="page-back-nav" aria-label="Back to dashboard">
        <Link to="/dashboard" className="page-back-link">
          ← Dashboard
        </Link>
      </nav>
      <div className="chip-row page-chips-bar">
        <span className="chip chip--green">Connections</span>
      </div>

      <section className="panel panel--accent-pink panel-spaced">
        <h2>Firebase account</h2>
        <p className="api-card-desc">
          Crate and draft set sync to Cloud Firestore when you are signed in with
          email.
        </p>
        {uid ? (
          <div className="api-status-row">
            <span className="pill active">Signed in</span>
            <span className="mono api-fake-id">{email ?? uid}</span>
          </div>
        ) : (
          <p className="empty-hint">
            {isFirebaseConfigured()
              ? 'Not signed in. Use Log in on the login page.'
              : 'Firebase is not configured in this build.'}
          </p>
        )}
      </section>

      <section className="panel panel--accent-green panel-spaced">
        <h2>Spotify Web API</h2>
        <p className="api-card-desc">
          Uses OAuth with PKCE in the browser (no client secret). Add this
          redirect URI in the Spotify Developer Dashboard:{' '}
          <span className="mono">{getSpotifyRedirectUri()}</span>
        </p>
        {!isSpotifyConfigured() ? (
          <p className="empty-hint">
            Spotify is not configured in this build (missing VITE_SPOTIFY_CLIENT_ID).
          </p>
        ) : spotifyOn ? (
          <div className="api-status-row">
            <span className="pill active">Connected</span>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={() => {
                setSpotifyHint(null)
                disconnectSpotify()
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="api-status-row">
            <span className="pill">Not connected</span>
            <button
              type="button"
              className="btn btn-secondary btn--sm"
              onClick={() => {
                if (!canLinkSpotify) {
                  setSpotifyHint(
                    'Primero debes iniciar sesión o registrarte para poder conectar con Spotify.',
                  )
                  return
                }
                setSpotifyHint(null)
                beginSpotifyLogin({ showDialog: true })
              }}
            >
              Connect Spotify
            </button>
          </div>
        )}
        {spotifyHint ? (
          <p className="login-error" role="alert">
            {spotifyHint}
          </p>
        ) : null}
      </section>

      <section className="panel panel-spaced panel--accent-pink">
        <h2>Firebase Realtime</h2>
        <p className="api-card-desc">
          Inbox-style notifications can subscribe to Firestore or Realtime
          Database collections in a later iteration.
        </p>
        <div className="api-status-row">
          <span className="pill active">Draft + crate sync</span>
          <span className="mono">collection: userCuepoint</span>
        </div>
      </section>
    </>
  )
}
