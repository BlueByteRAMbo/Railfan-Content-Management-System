import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import AppBackground from './components/layout/AppBackground'
import PageTransition from './components/layout/PageTransition'
import LoginPage   from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import Dashboard   from './pages/Dashboard'
import VideoList   from './pages/VideoList'
import AddVideo    from './pages/AddVideo'
import VideoDetail from './pages/VideoDetail'
import TimelineView from './pages/TimelineView'
import CalendarView from './pages/CalendarView'
import PendingQueue from './pages/PendingQueue'
import UploadPlanner from './pages/UploadPlanner'
import DeepStatistics from './pages/DeepStatistics'
import DuplicateResolver from './pages/DuplicateResolver'
import CollectionsTagsManager from './pages/CollectionsTagsManager'
import QuickAddView from './pages/QuickAddView'
import ImportExportView from './pages/ImportExportView'

// ── Protected route wrapper ───────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}



export default function App() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  return (
    <>
      <AppBackground />
      <Routes>
        {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected — all inside sidebar Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  {/* ── Phase 2 (complete) ── */}
                  <Route path="/dashboard"     element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="/videos"        element={<PageTransition><VideoList /></PageTransition>} />
                  <Route path="/videos/add"    element={<PageTransition><AddVideo /></PageTransition>} />
                  <Route path="/videos/:id"    element={<PageTransition><VideoDetail /></PageTransition>} />

                  {/* ── Phase 3 placeholders ── */}
                  <Route path="/queue"         element={<PageTransition><PendingQueue /></PageTransition>} />
                  <Route path="/planner"       element={<PageTransition><UploadPlanner /></PageTransition>} />
                  <Route path="/timeline"      element={<PageTransition><TimelineView /></PageTransition>} />
                  <Route path="/calendar"      element={<PageTransition><CalendarView /></PageTransition>} />
                  <Route path="/collections"   element={<PageTransition><CollectionsTagsManager /></PageTransition>} />
                  <Route path="/statistics"    element={<PageTransition><DeepStatistics /></PageTransition>} />
                  <Route path="/duplicates"    element={<PageTransition><DuplicateResolver /></PageTransition>} />
                  <Route path="/quick-add"     element={<PageTransition><QuickAddView /></PageTransition>} />
                  <Route path="/import-export" element={<PageTransition><ImportExportView /></PageTransition>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  )
}
