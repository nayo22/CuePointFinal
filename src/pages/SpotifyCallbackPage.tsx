import { getAuth } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { setEditor } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { exchangeAuthorizationCode } from '../services/spotifyApi'
import { useAppDispatch } from '../store/hooks'

export function SpotifyCallbackPage() {
  const [params] = useSearchParams()
  const err = params.get('error')
  const code = params.get('code')

  if (err) {
    const friendly =
      err === 'access_denied'
        ? 'No autorizaste la conexión. Puedes intentarlo de nuevo cuando quieras.'
        : 'No se pudo completar la conexión. Vuelve a intentarlo desde Perfil.'
    return (
      <div className="login-page">
        <div className="login-card-wrap">
          <div className="login-card">
            <p className="sub" role="alert">
              {friendly}
            </p>
            <p className="muted-link-block">
              <Link to="/login">Volver al inicio de sesión</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!code) {
    return (
      <div className="login-page">
        <div className="login-card-wrap">
          <div className="login-card">
            <p className="sub">Falta el código de autorización.</p>
            <p className="muted-link-block">
              <Link to="/login">Volver al inicio de sesión</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <SpotifyCallbackInner code={code} />
}

function SpotifyCallbackInner({ code }: { code: string }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState('Conectando con Spotify…')

  useEffect(() => {
    let cancelled = false
    exchangeAuthorizationCode(code)
      .then(() => {
        if (!cancelled) {
          dispatch(setEditor())
          const needsEmail =
            isFirebaseConfigured() &&
            getAuth(getFirebaseApp()).currentUser == null
          navigate(
            needsEmail ? '/login?spotify=connected' : '/dashboard',
            { replace: true },
          )
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setMessage(
            e instanceof Error
              ? e.message
              : 'No se pudo conectar. Intenta de nuevo desde Perfil.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [code, dispatch, navigate])

  return (
    <div className="login-page">
      <div className="login-card-wrap">
        <div className="login-card">
          <p className="sub">{message}</p>
          <p className="muted-link-block">
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
