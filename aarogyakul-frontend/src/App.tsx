import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/AppLayout'
import { LoadingState } from './components/ui'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MemberProfilePage from './pages/MemberProfilePage'
import TimelinePage from './pages/TimelinePage'
import UploadPage from './pages/UploadPage'
import { ClinicalPage, InsightsPage, ReportsPage, TimelinesPage } from './pages/FeatureOverviewPages'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingState label="Preparing AarogyaKul" />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/app"
            element={<DashboardPage />}
          />
          <Route path="/app/reports" element={<ReportsPage />} />
          <Route path="/app/insights" element={<InsightsPage />} />
          <Route path="/app/timelines" element={<TimelinesPage />} />
          <Route path="/app/clinical" element={<ClinicalPage />} />
          <Route
            path="/member/:memberId"
            element={<MemberProfilePage />}
          />
          <Route
            path="/member/:memberId/timeline"
            element={<TimelinePage />}
          />
          <Route
            path="/member/:memberId/upload"
            element={<UploadPage />}
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  )
}

export default App
