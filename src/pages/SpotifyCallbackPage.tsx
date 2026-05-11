import { getAuth } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthScreenFrame } from '../components/AuthScreenFrame'
import { setEditor } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { exchangeAuthorizationCodeOnce } from '../services/spotifyApi'
import { useAppDispatch } from '../store/hooks'

export function SpotifyCallbackPage() {
  const [params] = useSearchParams()
  const err = params.get('error')
  const code = params.get('code')

  if (err) {
    const friendly =
      err === 'access_denied'
        ? 'You did not authorize the connection. You can try again whenever you like.'
        : 'The connection could not be completed. Try again from Profile.'
    return (
      <AuthScreenFrame>
        <p className="sub" role="alert">
          {friendly}
        </p>
        <p className="muted-link-block">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthScreenFrame>
    )
  }

  if (!code) {
    return (
      <AuthScreenFrame>
        <p className="sub">Authorization code is missing.</p>
        <p className="muted-link-block">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthScreenFrame>
    )
  }

  return <SpotifyCallbackInner code={code} />
}

function SpotifyCallbackInner({ code }: { code: string }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState('Connecting to Spotify…')

  useEffect(() => {
    let cancelled = false
    exchangeAuthorizationCodeOnce(code)
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
              : 'Could not connect. Try again from Profile.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [code, dispatch, navigate])

  return (
    <AuthScreenFrame>
      <p className="sub">{message}</p>
      <p className="muted-link-block">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthScreenFrame>
  )
}
