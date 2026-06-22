import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './context/ProfileContext'
import { AppLayout } from './components/AppLayout'
import { LoadingState } from './components/ui'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePickerPage from './pages/ProfilePickerPage'
import DashboardPage from './pages/DashboardPage'
import MemberProfilePage from './pages/MemberProfilePage'
import TimelinePage from './pages/TimelinePage'
import UploadPage from './pages/UploadPage'
import DocumentVaultPage from './pages/DocumentVaultPage'
import { ClinicalPage } from './pages/FeatureOverviewPages'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState label="Preparing AarogyaKul" />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { activeProfile, loading } = useProfile()
  if (loading) return <LoadingState label="Loading profile" />
  if (!activeProfile) return <Navigate to="/app/profiles" replace />
  return <>{children}</>
}

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app/profiles" element={<PrivateRoute><ProfilePickerPage /></PrivateRoute>} />
        <Route
          element={
            <PrivateRoute>
              <ProfileGuard>
                <AppLayout />
              </ProfileGuard>
            </PrivateRoute>
          }
        >
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/vault" element={<DocumentVaultPage />} />
          <Route path="/app/insights" element={<UploadPage />} />
          <Route path="/app/timeline" element={<TimelinePage />} />
          <Route path="/app/clinical" element={<ClinicalPage />} />
          <Route path="/app/profile" element={<MemberProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
