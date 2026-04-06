import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { AuthScreenFrame } from '../components/AuthScreenFrame'
import { PasswordFieldWithToggle } from '../components/PasswordFieldWithToggle'
import { setEditor, setSpectator } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { disconnectSpotify } from '../lib/spotifyAuth'
import { saveUserProfileFields } from '../services/userCuepointFirestore'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { flushPendingCuepointSave } from '../store/store'

type Mode = 'login' | 'register'

function authMessage(code: string): string {
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
    return 'Correo o contraseña incorrectos.'
  if (code === 'auth/email-already-in-use')
    return 'Ese correo ya está registrado.'
  if (code === 'auth/invalid-email') return 'Ese correo no es válido.'
  if (code === 'auth/weak-password')
    return 'Usa una contraseña más segura (6+ caracteres).'
  if (code === 'auth/too-many-requests')
    return 'Demasiados intentos. Prueba más tarde.'
  return 'Algo salió mal. Inténtalo de nuevo.'
}

type LocationState = {
  from?: { pathname: string; search: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const authReady = useAppSelector((s) => s.auth.authReady)
  const uid = useAppSelector((s) => s.auth.uid)
  const urlMode = searchParams.get('mode')
  const [mode, setMode] = useState<Mode>(
    urlMode === 'register' ? 'register' : 'login',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [djName, setDjName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const backendOk = isFirebaseConfigured()
  const spotifyJustConnected = searchParams.get('spotify') === 'connected'

  useEffect(() => {
    if (urlMode === 'register') setMode('register')
    if (urlMode === 'login') setMode('login')
  }, [urlMode])

  useEffect(() => {
    if (!backendOk || !authReady || !uid) return
    const from = (location.state as LocationState | null)?.from
    const dest = from
      ? `${from.pathname}${from.search ?? ''}`
      : '/dashboard'
    navigate(dest, { replace: true })
  }, [authReady, backendOk, location.state, navigate, uid])

  function postAuthDestination(): string {
    const from = (location.state as LocationState | null)?.from
    return from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'
  }

  async function persistDjProfile(user: User, name: string) {
    const trimmed = name.trim()
    await updateProfile(user, { displayName: trimmed })
    await saveUserProfileFields(user.uid, { displayName: trimmed })
  }

  async function submitEmail() {
    setError(null)
    const trimmedEmail = email.trim()
    const trimmedUser = djName.trim()

    if (mode === 'login') {
      if (!trimmedEmail || !password) {
        setError('Correo y contraseña son obligatorios.')
        return
      }
    } else {
      if (!trimmedEmail || !trimmedUser || !password) {
        setError('Correo, nombre de usuario y contraseña son obligatorios.')
        return
      }
    }

    if (!backendOk) {
      setError(
        'El servicio de cuentas no está disponible en este momento. Vuelve más tarde.',
      )
      return
    }
    setBusy(true)
    try {
      const auth = getAuth(getFirebaseApp())
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password,
        )
        await persistDjProfile(cred.user, trimmedUser)
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password)
      }
      dispatch(setEditor())
      navigate(postAuthDestination())
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e && typeof e.code === 'string'
          ? e.code
          : ''
      setError(authMessage(code))
    } finally {
      setBusy(false)
    }
  }

  async function goSpectator() {
    setError(null)
    if (backendOk) {
      const auth = getAuth(getFirebaseApp())
      if (auth.currentUser) {
        await flushPendingCuepointSave()
        await signOut(auth)
      }
    }
    disconnectSpotify()
    dispatch(setSpectator())
    navigate('/dashboard')
  }

  return (
    <AuthScreenFrame>
          <p className="sub">
            Arma tus sets con criterio: energía, armonía y un crate inteligente.
            Busca música, explora y comparte con otros DJs.
          </p>

          {spotifyJustConnected ? (
            <p className="login-env-hint" role="status">
              Cuenta de música vinculada. Entra con tu correo y contraseña para
              continuar.
            </p>
          ) : null}

          <div className="login-mode-tabs" role="tablist" aria-label="Modo de cuenta">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`login-mode-tab ${mode === 'login' ? 'login-mode-tab--active' : ''}`}
              onClick={() => {
                setMode('login')
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('mode')
                    return next
                  },
                  { replace: true },
                )
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`login-mode-tab ${mode === 'register' ? 'login-mode-tab--active' : ''}`}
              onClick={() => {
                setMode('register')
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('mode', 'register')
                    return next
                  },
                  { replace: true },
                )
              }}
            >
              Registrarse
            </button>
          </div>

          <div className="field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode === 'register' ? (
            <div className="field">
              <label htmlFor="dj-display-name">Nombre de usuario</label>
              <input
                id="dj-display-name"
                name="djName"
                type="text"
                autoComplete="username"
                placeholder="Tu nombre en la app"
                value={djName}
                onChange={(e) => setDjName(e.target.value)}
              />
            </div>
          ) : null}

          <PasswordFieldWithToggle
            key={mode}
            id="password"
            name="password"
            label="Contraseña"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={setPassword}
          />

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void submitEmail()}
            >
              {busy
                ? 'Espera…'
                : mode === 'login'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
            </button>
          </div>

          <div className="login-actions login-actions--spectator">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void goSpectator()}
            >
              Continuar como invitado
            </button>
          </div>
    </AuthScreenFrame>
  )
}
