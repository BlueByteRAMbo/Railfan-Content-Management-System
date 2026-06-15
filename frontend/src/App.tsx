import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage   from './pages/LoginPage'
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

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected — all inside sidebar Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* ── Phase 2 (complete) ── */}
                <Route path="/"              element={<Dashboard />} />
                <Route path="/videos"        element={<VideoList />} />
                <Route path="/videos/add"    element={<AddVideo />} />
                <Route path="/videos/:id"    element={<VideoDetail />} />

                {/* ── Phase 3 placeholders ── */}
                <Route path="/queue"         element={<PendingQueue />} />
                <Route path="/planner"       element={<UploadPlanner />} />
                <Route path="/timeline"      element={<TimelineView />} />
                <Route path="/calendar"      element={<CalendarView />} />
                <Route path="/collections"   element={<CollectionsTagsManager />} />
                <Route path="/statistics"    element={<DeepStatistics />} />
                <Route path="/duplicates"    element={<DuplicateResolver />} />
                <Route path="/quick-add"     element={<QuickAddView />} />
                <Route path="/import-export" element={<ImportExportView />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
