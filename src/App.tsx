import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { CratePage } from './pages/CratePage'
import { DashboardPage } from './pages/DashboardPage'
import { DigPage } from './pages/DigPage'
import { ExplorePage } from './pages/ExplorePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RankingPage } from './pages/RankingPage'
import { SetBuilderPage } from './pages/SetBuilderPage'
import { SetDetailPage } from './pages/SetDetailPage'
import { SpotifyCallbackPage } from './pages/SpotifyCallbackPage'

export default function App() {
  return (
    <Routes>
      <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/builder" element={<SetBuilderPage />} />
        <Route path="/dig" element={<DigPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/crate" element={<CratePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sets/:id" element={<SetDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
