import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/context/AuthProvider'
import Auth from './features/auth/pages/Auth'
import ListsPage from './features/lists/pages/ListsPage'
import ListDetailPage from './features/lists/pages/ListDetailPage'
import Settings from './features/settings/pages/Settings'
import LoadingSpinner from './shared/components/LoadingSpinner'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/lists" replace /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/lists" replace /> : <Auth />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/lists" replace /> : <Auth />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/lists" replace /> : <Auth />}
      />
      <Route
        path="/lists"
        element={
          <PrivateRoute>
            <ListsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/lists/:listId"
        element={
          <PrivateRoute>
            <ListDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
