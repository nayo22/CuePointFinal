import { getAuth, updateProfile } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SpotifyLogoMark } from '../components/SpotifyLogoMark'
import { setUserProfile } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { beginSpotifyLogin, disconnectSpotify } from '../lib/spotifyAuth'
import { readSpotifyTokens } from '../lib/spotifyTokens'
import { uploadProfilePhoto } from '../services/profilePhotoUpload'
import { saveUserProfileFields } from '../services/userCuepointFirestore'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const email = useAppSelector((s) => s.auth.email)
  const uid = useAppSelector((s) => s.auth.uid)
  const role = useAppSelector((s) => s.auth.role)
  const displayName = useAppSelector((s) => s.auth.displayName)
  const photoUrl = useAppSelector((s) => s.auth.photoUrl)

  const isGuest = role === 'spectator' || !uid
  const backendOk = isFirebaseConfigured()
  const canLinkSpotify = backendOk && uid != null

  const [spotifyOn, setSpotifyOn] = useState(() => readSpotifyTokens() != null)
  const [spotifyConfigError, setSpotifyConfigError] = useState<string | null>(
    null,
  )
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
      setSpotifyOn(readSpotifyTokens() != null)
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
      setProfileSaved('Elige un archivo de imagen.')
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
    setProfileBusy(true)
    setProfileSaved(null)
    try {
      const name = editName.trim()
      let finalPhoto: string
      if (avatarCleared && !pickedFile) {
        finalPhoto = ''
      } else if (pickedFile) {
        finalPhoto = await uploadProfilePhoto(uid, pickedFile)
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
      setProfileSaved('Perfil actualizado.')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.'
      setProfileSaved(msg)
    } finally {
      setProfileBusy(false)
    }
  }

  const shownName =
    displayName?.trim() ||
    email?.split('@')[0] ||
    (isGuest ? 'Invitado' : 'DJ')

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
        'No se pudo iniciar la conexión. En el entorno de desarrollo, define VITE_SPOTIFY_CLIENT_ID en tu archivo .env; en Vercel, añade la misma variable en Settings → Environment Variables.',
      )
    }
  }

  return (
    <>
      <nav className="page-back-nav" aria-label="Volver al inicio">
        <Link to="/dashboard" className="page-back-link">
          ← Inicio
        </Link>
      </nav>

      <div className="chip-row page-chips-bar">
        <span className="chip chip--green">Perfil</span>
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
                Estás como invitado. Crea una cuenta para guardar tu trabajo y
                conectar Spotify.
              </p>
            ) : null}
          </div>
        </div>

        {isGuest ? (
          <div className="profile-guest-actions">
            <Link className="btn btn-primary btn--sm" to="/login">
              Iniciar sesión
            </Link>
            <Link className="btn btn-secondary btn--sm" to="/login?mode=register">
              Crear cuenta
            </Link>
          </div>
        ) : (
          <div className="profile-edit-block">
            <h3 className="profile-edit-heading">Tu perfil público</h3>
            <p className="api-card-desc">
              Elige tu nombre visible y una foto desde tu equipo (JPG, PNG o
              WebP).
            </p>
            <div className="field">
              <label htmlFor="profile-dj-name">Nombre de usuario</label>
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
                Foto de perfil
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
                  Elegir imagen…
                </button>
                {(photoUrl?.trim() || pickedFile) && !avatarCleared ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn--sm"
                    onClick={onRemovePhoto}
                  >
                    Quitar foto
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
              {profileBusy ? 'Guardando…' : 'Guardar perfil'}
            </button>
            {profileSaved ? (
              <p
                className={
                  profileSaved === 'Perfil actualizado.'
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
            <h2 className="profile-spotify-title">Conéctate con Spotify</h2>
            <p className="api-card-desc profile-spotify-desc">
              Vincula tu cuenta para buscar millones de temas en CuePoint, ver
              datos útiles del audio y abrir canciones en Spotify cuando quieras.
            </p>
          </div>
        </div>

        {spotifyOn ? (
          <div className="api-status-row">
            <span className="pill active">Conectado</span>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={() => {
                disconnectSpotify()
                setSpotifyConfigError(null)
              }}
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="api-status-row api-status-row--stack">
            <span className="pill">No conectado</span>
            <button
              type="button"
              className="btn btn-secondary btn--sm profile-spotify-connect-btn"
              onClick={handleConnectSpotify}
            >
              Conectar con Spotify
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
            Inicia sesión primero
          </h3>
          <p className="profile-guest-dialog-text">
            Para conectar Spotify necesitas una cuenta con correo y contraseña.
            Los invitados pueden explorar la app, pero no vincular Spotify.
          </p>
          <div className="profile-guest-dialog-actions">
            <Link
              className="btn btn-primary btn--sm"
              to="/login"
              onClick={closeGuestGate}
            >
              Iniciar sesión
            </Link>
            <Link
              className="btn btn-secondary btn--sm"
              to="/login?mode=register"
              onClick={closeGuestGate}
            >
              Crear cuenta
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={closeGuestGate}
            >
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
