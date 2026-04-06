import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthScreenFrame } from './AuthScreenFrame'
import { isFirebaseConfigured } from '../lib/firebase'
import { useAppSelector } from '../store/hooks'

function AuthBootScreen() {
  return (
    <AuthScreenFrame>
      <p className="sub" role="status">
        Cargando sesión…
      </p>
    </AuthScreenFrame>
  )
}

export function RootRedirect() {
  const { authReady, uid, role } = useAppSelector((s) => s.auth)

  if (!authReady) return <AuthBootScreen />

  if (!isFirebaseConfigured()) {
    return <Navigate to="/login" replace />
  }

  if (uid != null) {
    return <Navigate to="/dashboard" replace />
  }

  if (role === 'spectator') {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export function RequireSession() {
  const { authReady, uid, role } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!authReady) return <AuthBootScreen />

  if (!isFirebaseConfigured()) {
    return <Outlet />
  }

  if (uid == null && role !== 'spectator') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
