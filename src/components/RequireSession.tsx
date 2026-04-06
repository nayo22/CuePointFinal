import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isFirebaseConfigured } from '../lib/firebase'
import { useAppSelector } from '../store/hooks'

function AuthBootScreen() {
  return (
    <div className="login-page">
      <div className="login-card-wrap">
        <p className="sub" role="status">
          Cargando sesión…
        </p>
      </div>
    </div>
  )
}

/** `/` → login or dashboard */
export function RootRedirect() {
  const { authReady, uid, role } = useAppSelector((s) => s.auth)

  if (!authReady) return <AuthBootScreen />

  if (!isFirebaseConfigured()) {
    return <Navigate to="/login" replace />
  }

  if (uid != null || role === 'spectator') {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

/** Firebase session or spectator mode required for the main app shell. */
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
