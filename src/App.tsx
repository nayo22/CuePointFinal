import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireSession, RootRedirect } from './components/RequireSession'
import { AppShell } from './layout/AppShell'

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const SetBuilderPage = lazy(() =>
  import('./pages/SetBuilderPage').then((m) => ({ default: m.SetBuilderPage })),
)
const DigPage = lazy(() =>
  import('./pages/DigPage').then((m) => ({ default: m.DigPage })),
)
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })),
)
const RankingPage = lazy(() =>
  import('./pages/RankingPage').then((m) => ({ default: m.RankingPage })),
)
const CratePage = lazy(() =>
  import('./pages/CratePage').then((m) => ({ default: m.CratePage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const SetDetailPage = lazy(() =>
  import('./pages/SetDetailPage').then((m) => ({ default: m.SetDetailPage })),
)
const SpotifyCallbackPage = lazy(() =>
  import('./pages/SpotifyCallbackPage').then((m) => ({
    default: m.SpotifyCallbackPage,
  })),
)

function RouteLoading() {
  return (
    <div className="route-loading mono" role="status">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route element={<RequireSession />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/builder" element={<SetBuilderPage />} />
            <Route path="/dig" element={<DigPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/crate" element={<CratePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/sets/:id" element={<SetDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
