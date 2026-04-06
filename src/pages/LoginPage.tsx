import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { setEditor, setSpectator } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { flushPendingCuepointSave } from '../store/store'

type Mode = 'login' | 'register'

function authMessage(code: string): string {
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
    return 'Email or password is wrong.'
  if (code === 'auth/email-already-in-use') return 'That email is already registered.'
  if (code === 'auth/invalid-email') return 'That email is not valid.'
  if (code === 'auth/weak-password') return 'Use a stronger password (6+ characters).'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.'
  return 'Something went wrong. Try again.'
}

type LocationState = {
  from?: { pathname: string; search: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const authReady = useAppSelector((s) => s.auth.authReady)
  const uid = useAppSelector((s) => s.auth.uid)
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const firebaseOk = isFirebaseConfigured()
  const spotifyJustConnected = searchParams.get('spotify') === 'connected'

  useEffect(() => {
    if (!firebaseOk || !authReady || !uid) return
    const from = (location.state as LocationState | null)?.from
    const dest = from
      ? `${from.pathname}${from.search ?? ''}`
      : '/dashboard'
    navigate(dest, { replace: true })
  }, [authReady, firebaseOk, location.state, navigate, uid])

  function postAuthDestination(): string {
    const from = (location.state as LocationState | null)?.from
    return from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'
  }

  async function submitEmail() {
    setError(null)
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError('Email and password are required.')
      return
    }
    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!firebaseOk) {
      dispatch(setEditor())
      navigate('/dashboard')
      return
    }
    setBusy(true)
    try {
      const auth = getAuth(getFirebaseApp())
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, trimmed, password)
      } else {
        await signInWithEmailAndPassword(auth, trimmed, password)
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
    if (firebaseOk) {
      const auth = getAuth(getFirebaseApp())
      if (auth.currentUser) {
        await flushPendingCuepointSave()
        await signOut(auth)
      }
    }
    dispatch(setSpectator())
    navigate('/dashboard')
  }

  function goEditorDemo() {
    setError(null)
    if (firebaseOk) {
      dispatch(setSpectator())
    } else {
      dispatch(setEditor())
    }
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-card-wrap">
        <div className="login-card">
          <div className="login-brand">
            <h1>
              <span className="login-title-o">Cue</span>
              <span className="login-title-g">Point</span>
            </h1>
          </div>
          <p className="sub">
            Setlist Intelligence — build sets, read the mix technically, dig with
            harmonic context and a Smart Crate.
          </p>

          {!firebaseOk ? (
            <p className="login-env-hint mono">
              Firebase env vars missing — local-only mode until you configure
              VITE_FIREBASE_* in the environment.
            </p>
          ) : null}

          {spotifyJustConnected ? (
            <p className="login-env-hint mono" role="status">
              Spotify connected. Now sign in with email to continue.
            </p>
          ) : null}

          <div className="login-mode-tabs" role="tablist" aria-label="Account mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`login-mode-tab ${mode === 'login' ? 'login-mode-tab--active' : ''}`}
              onClick={() => setMode('login')}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`login-mode-tab ${mode === 'register' ? 'login-mode-tab--active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === 'register' ? (
            <div className="field">
              <label htmlFor="password-confirm">Confirm password</label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          ) : null}

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
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Log in'
                  : 'Create account'}
            </button>
          </div>

          <div className="login-actions login-actions--spectator">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void goSpectator()}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
