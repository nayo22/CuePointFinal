import { getAuth, updateProfile } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SpotifyLogoMark } from '../components/SpotifyLogoMark'
import { setUserProfile } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { beginSpotifyLogin, disconnectSpotify } from '../lib/spotifyAuth'
import {
  getEffectiveFirebaseUidForSpotify,
  readSpotifyTokens,
} from '../lib/spotifyTokens'
import { uploadProfilePhoto } from '../services/profilePhotoUpload'
import { saveUserProfileFields } from '../services/userCuepointFirestore'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const PROFILE_UPDATED_MSG = 'Profile updated.'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const email = useAppSelector((s) => s.auth.email)
  const uid = useAppSelector((s) => s.auth.uid)
  const role = useAppSelector((s) => s.auth.role)
  const displayName = useAppSelector((s) => s.auth.displayName)
  const photoUrl = useAppSelector((s) => s.auth.photoUrl)

  const effectiveUid = uid ?? getEffectiveFirebaseUidForSpotify()
  const isGuest = role === 'spectator' || effectiveUid == null
  const backendOk = isFirebaseConfigured()
  const canLinkSpotify = backendOk && effectiveUid != null

  const [, setSpotifyAuthTick] = useState(0)
  const [spotifyConfigError, setSpotifyConfigError] = useState<string | null>(
    null,
  )
  const spotifyOn = !isGuest && readSpotifyTokens() != null
  const [editName, setEditName] = useState(displayName ?? '')
  const [pickedFile, setPickedFile] = useState<File | null>(null)
  const [objectPreview, setObjectPreview] = useState<string | null>(null)
  const [avatarCleared, setAvatarCleared] = useState(false)
  const [profileSaved, setProfileSaved] = useState<string | null>(null)
  const [profileBusy, setProfileBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gateRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setEditName(displayName ?? '')
  }, [displayName])

  useEffect(() => {
    if (!pickedFile) {
      setObjectPreview(null)
      return
    }
    const u = URL.createObjectURL(pickedFile)
    setObjectPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [pickedFile])

  useEffect(() => {
    function sync() {
      setSpotifyAuthTick((n) => n + 1)
    }
    window.addEventListener('cuepoint-spotify-auth', sync)
    return () => window.removeEventListener('cuepoint-spotify-auth', sync)
  }, [])

  function openGuestGate() {
    gateRef.current?.showModal()
  }

  function closeGuestGate() {
    gateRef.current?.close()
  }

  const displayPhotoSrc =
    pickedFile && objectPreview
      ? objectPreview
      : avatarCleared
        ? null
        : photoUrl?.trim() || null

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setProfileSaved('Choose an image file.')
      return
    }
    setPickedFile(f)
    setAvatarCleared(false)
    setProfileSaved(null)
    e.target.value = ''
  }

  function onRemovePhoto() {
    setPickedFile(null)
    setAvatarCleared(true)
    setProfileSaved(null)
  }

  async function saveProfile() {
    if (!uid) return
    if (!isFirebaseConfigured()) {
      setProfileSaved('Firebase is not configured for this build.')
      return
    }
    setProfileBusy(true)
    setProfileSaved(null)
    try {
      const name = editName.trim()
      let finalPhoto: string
      if (avatarCleared && !pickedFile) {
        finalPhoto = ''
      } else if (pickedFile) {
        finalPhoto = await uploadProfilePhoto(pickedFile)
      } else {
        finalPhoto = (photoUrl ?? '').trim()
      }

      await saveUserProfileFields(uid, {
        displayName: name || '',
        photoUrl: finalPhoto,
      })

      const auth = getAuth(getFirebaseApp())
      const u = auth.currentUser
      if (u) {
        if (finalPhoto && finalPhoto.startsWith('https://')) {
          await updateProfile(u, {
            displayName: name || null,
            photoURL: finalPhoto,
          })
        } else if (finalPhoto === '') {
          await updateProfile(u, { displayName: name || null, photoURL: null })
        } else {
          await updateProfile(u, { displayName: name || null })
        }
      }

      dispatch(
        setUserProfile({
          displayName: name || null,
          photoUrl: finalPhoto || null,
        }),
      )
      setPickedFile(null)
      setAvatarCleared(false)
      setProfileSaved(PROFILE_UPDATED_MSG)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not save. Try again.'
      setProfileSaved(msg)
    } finally {
      setProfileBusy(false)
    }
  }

  const shownName =
    displayName?.trim() ||
    email?.split('@')[0] ||
    (isGuest ? 'Guest' : 'DJ')

  const avatarLetter = shownName.charAt(0).toUpperCase()

  function handleConnectSpotify() {
    setSpotifyConfigError(null)
    if (!canLinkSpotify) {
      openGuestGate()
      return
    }
    const started = beginSpotifyLogin({ showDialog: true })
    if (!started) {
      setSpotifyConfigError(
        'Could not start the connection. For local development, set VITE_SPOTIFY_CLIENT_ID in your .env file. On Vercel, add the same variable under Settings → Environment Variables.',
      )
    }
  }

  return (
    <>
      <nav className="page-back-nav" aria-label="Back to home">
        <Link to="/dashboard" className="page-back-link">
          ← Home
        </Link>
      </nav>

      <div className="chip-row page-chips-bar">
        <span className="chip chip--green">Profile</span>
      </div>

      <section className="panel panel--accent-orange panel-spaced profile-hero">
        <div className="profile-hero-row">
          <div className="profile-avatar-wrap">
            {displayPhotoSrc ? (
              <img
                className="profile-avatar-img"
                src={displayPhotoSrc}
                alt=""
                width={96}
                height={96}
              />
            ) : (
              <div className="profile-avatar-fallback" aria-hidden>
                {avatarLetter}
              </div>
            )}
          </div>
          <div className="profile-hero-text">
            <h2 className="profile-display-title">{shownName}</h2>
            {uid && email ? (
              <p className="mono profile-email-line">{email}</p>
            ) : isGuest ? (
              <p className="profile-guest-hint">
                You are browsing as a guest. Create an account to save your work and
                link Spotify.
              </p>
            ) : null}
          </div>
        </div>

        {isGuest ? (
          <div className="profile-guest-actions">
            <Link className="btn btn-primary btn--sm" to="/login">
              Sign in
            </Link>
            <Link className="btn btn-secondary btn--sm" to="/login?mode=register">
              Create account
            </Link>
          </div>
        ) : (
          <div className="profile-edit-block">
            <h3 className="profile-edit-heading">Your public profile</h3>
            <p className="api-card-desc">
              Choose the name others see and a photo from your device (JPG, PNG, or
              WebP).
            </p>
            <div className="field">
              <label htmlFor="profile-dj-name">Display name</label>
              <input
                id="profile-dj-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="nickname"
              />
            </div>
            <div className="field profile-photo-field">
              <span className="profile-photo-label" id="profile-photo-label">
                Profile photo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="profile-photo-input"
                aria-labelledby="profile-photo-label"
                onChange={onPickPhoto}
              />
              <div className="profile-photo-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn--sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose image…
                </button>
                {(photoUrl?.trim() || pickedFile) && !avatarCleared ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn--sm"
                    onClick={onRemovePhoto}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn--sm"
              disabled={profileBusy}
              onClick={() => void saveProfile()}
            >
              {profileBusy ? 'Saving…' : 'Save profile'}
            </button>
            {profileSaved ? (
              <p
                className={
                  profileSaved === PROFILE_UPDATED_MSG
                    ? 'profile-saved-hint'
                    : 'login-error profile-saved-hint'
                }
                role="status"
              >
                {profileSaved}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="panel panel--accent-green panel-spaced profile-spotify-card">
        <div className="profile-spotify-head">
          <SpotifyLogoMark size={48} />
          <div>
            <h2 className="profile-spotify-title">Connect Spotify</h2>
            <p className="api-card-desc profile-spotify-desc">
              Link your account to search millions of tracks in CuePoint, see helpful
              audio details, and open songs in Spotify when you want.
            </p>
          </div>
        </div>

        {spotifyOn ? (
          <div className="api-status-row">
            <span className="pill active">Connected</span>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={() => {
                disconnectSpotify()
                setSpotifyConfigError(null)
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="api-status-row api-status-row--stack">
            <span className="pill">Not connected</span>
            <button
              type="button"
              className="btn btn-secondary btn--sm profile-spotify-connect-btn"
              onClick={handleConnectSpotify}
            >
              Connect Spotify
            </button>
            {spotifyConfigError ? (
              <p className="profile-spotify-config-hint" role="alert">
                {spotifyConfigError}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <dialog
        ref={gateRef}
        className="profile-guest-dialog"
        aria-labelledby="profile-guest-gate-title"
      >
        <div className="profile-guest-dialog-inner">
          <h3 id="profile-guest-gate-title" className="profile-guest-dialog-title">
            Sign in first
          </h3>
          <p className="profile-guest-dialog-text">
            To connect Spotify you need an email-and-password account. Guests can
            explore the app, but cannot link Spotify.
          </p>
          <div className="profile-guest-dialog-actions">
            <Link
              className="btn btn-primary btn--sm"
              to="/login"
              onClick={closeGuestGate}
            >
              Sign in
            </Link>
            <Link
              className="btn btn-secondary btn--sm"
              to="/login?mode=register"
              onClick={closeGuestGate}
            >
              Create account
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={closeGuestGate}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
