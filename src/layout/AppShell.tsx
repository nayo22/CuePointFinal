import { getAuth, signOut } from 'firebase/auth'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CuePointLogo } from '../components/CuePointLogo'
import { GlobalSearchBar } from '../components/GlobalSearchBar'
import { NotificationBell } from '../components/NotificationBell'
import { setEditor } from '../features/auth/authSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { flushPendingCuepointSave } from '../store/store'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/builder', label: 'Set Builder' },
  { to: '/dig', label: 'Search' },
  { to: '/explore', label: 'Explore' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/crate', label: 'Crate' },
] as const

export function AppShell() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const role = useAppSelector((s) => s.auth.role)
  const uid = useAppSelector((s) => s.auth.uid)

  async function handleSignOut() {
    if (isFirebaseConfigured() && uid) {
      await flushPendingCuepointSave()
      await signOut(getAuth(getFirebaseApp()))
    } else if (role === 'spectator') {
      dispatch(setEditor())
    }
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="shell-header">
        <NavLink className="brand brand--logo" to="/dashboard" end title="CuePoint">
          <CuePointLogo variant="header" />
        </NavLink>
        <nav className="shell-nav" aria-label="Primary">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-actions">
          <NotificationBell />
          <Link className="shell-link" to="/profile">
            Profile
          </Link>
          <button type="button" className="shell-link shell-link-btn" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </header>
      <div className="shell-glow" aria-hidden>
        <span className="shell-glow-orange" />
        <span className="shell-glow-green" />
      </div>
      <div className="shell-search-wrap">
        <GlobalSearchBar />
      </div>
      <main id="main-content" className="shell-main">
        {role === 'spectator' ? (
          <div className="spectator-banner" role="status">
            Spectator mode: editing and crowd tags are read-only.
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
