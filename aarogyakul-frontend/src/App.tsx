import { Routes, Route, Navigate } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
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
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app/profiles" element={<PrivateRoute><ProfilePickerPage /></PrivateRoute>} />
          <Route
            element={
              <PrivateRoute>
                <ProfileGuard>
                  <ErrorBoundary><AppLayout /></ErrorBoundary>
                </ProfileGuard>
              </PrivateRoute>
            }
          >
            <Route path="/app" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
            <Route path="/app/vault" element={<ErrorBoundary><DocumentVaultPage /></ErrorBoundary>} />
            <Route path="/app/insights" element={<ErrorBoundary><UploadPage /></ErrorBoundary>} />
            <Route path="/app/timeline" element={<ErrorBoundary><TimelinePage /></ErrorBoundary>} />
            <Route path="/app/clinical" element={<ErrorBoundary><ClinicalPage /></ErrorBoundary>} />
            <Route path="/app/profile" element={<ErrorBoundary><MemberProfilePage /></ErrorBoundary>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App
