import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SpotifyLogoMark } from '../components/SpotifyLogoMark'
import { setUserProfile } from '../features/auth/authSlice'
import { isFirebaseConfigured } from '../lib/firebase'
import { beginSpotifyLogin, disconnectSpotify } from '../lib/spotifyAuth'
import { isSpotifyConfigured } from '../lib/spotifyConfig'
import { readSpotifyTokens } from '../lib/spotifyTokens'
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
  const [editName, setEditName] = useState(displayName ?? '')
  const [editPhoto, setEditPhoto] = useState(photoUrl ?? '')
  const [profileSaved, setProfileSaved] = useState<string | null>(null)
  const [profileBusy, setProfileBusy] = useState(false)
  const gateRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setEditName(displayName ?? '')
    setEditPhoto(photoUrl ?? '')
  }, [displayName, photoUrl])

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

  async function saveProfile() {
    if (!uid) return
    setProfileBusy(true)
    setProfileSaved(null)
    try {
      const name = editName.trim()
      const pic = editPhoto.trim()
      await saveUserProfileFields(uid, {
        displayName: name || '',
        photoUrl: pic || '',
      })
      dispatch(
        setUserProfile({
          displayName: name || null,
          photoUrl: pic || null,
        }),
      )
      setProfileSaved('Perfil actualizado.')
    } catch {
      setProfileSaved('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setProfileBusy(false)
    }
  }

  const shownName =
    displayName?.trim() ||
    email?.split('@')[0] ||
    (isGuest ? 'Invitado' : 'DJ')

  const avatarLetter = shownName.charAt(0).toUpperCase()

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
            {photoUrl?.trim() ? (
              <img
                className="profile-avatar-img"
                src={photoUrl.trim()}
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
            <Link className="btn btn-secondary btn--sm" to="/login">
              Registrarse
            </Link>
          </div>
        ) : (
          <div className="profile-edit-block">
            <h3 className="profile-edit-heading">Tu perfil público</h3>
            <p className="api-card-desc">
              Nombre que verán otros DJs y foto (pega un enlace a tu imagen).
            </p>
            <div className="field">
              <label htmlFor="profile-dj-name">Nombre de DJ</label>
              <input
                id="profile-dj-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="nickname"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-photo-url">URL de foto de perfil</label>
              <input
                id="profile-photo-url"
                type="url"
                placeholder="https://…"
                value={editPhoto}
                onChange={(e) => setEditPhoto(e.target.value)}
                autoComplete="off"
              />
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
              <p className="profile-saved-hint" role="status">
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

        {!isSpotifyConfigured() ? (
          <p className="empty-hint">
            La búsqueda en catálogo no está activa en esta instalación. Si eres
            quien administra el sitio, revisa la configuración del proyecto.
          </p>
        ) : spotifyOn ? (
          <div className="api-status-row">
            <span className="pill active">Conectado</span>
            <button
              type="button"
              className="btn btn-ghost btn--sm"
              onClick={() => disconnectSpotify()}
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="api-status-row">
            <span className="pill">No conectado</span>
            <button
              type="button"
              className="btn btn-secondary btn--sm"
              onClick={() => {
                if (!canLinkSpotify) {
                  openGuestGate()
                  return
                }
                beginSpotifyLogin({ showDialog: true })
              }}
            >
              Conectar Spotify
            </button>
          </div>
        )}
      </section>

      <dialog ref={gateRef} className="profile-guest-dialog">
        <div className="profile-guest-dialog-inner">
          <h3 className="profile-guest-dialog-title">Inicia sesión primero</h3>
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
              Ir a iniciar sesión
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
