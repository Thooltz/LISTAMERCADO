import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/context/AuthProvider'
import { isSupabaseConfigured } from './shared/lib/supabase'
import Landing from './features/auth/pages/Landing'
import Auth from './features/auth/pages/Auth'
import Setup from './features/setup/pages/Setup'
import ListsPage from './features/lists/pages/ListsPage'
import ListDetailsPage from './features/lists/pages/ListDetailsPage'
import Settings from './features/settings/pages/Settings'
import LoadingSpinner from './shared/components/LoadingSpinner'

function SetupGuard({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <Navigate to="/setup" replace />
  }
  return <>{children}</>
}

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
      {/* Rota de setup - sempre acessível */}
      <Route path="/setup" element={<Setup />} />
      
      {/* Todas as outras rotas precisam de Supabase configurado */}
      <Route
        path="/"
        element={
          <SetupGuard>
            {user ? <Navigate to="/lists" replace /> : <Landing />}
          </SetupGuard>
        }
      />
      <Route
        path="/auth"
        element={
          <SetupGuard>
            {user ? <Navigate to="/lists" replace /> : <Auth />}
          </SetupGuard>
        }
      />
      <Route
        path="/home"
        element={
          <SetupGuard>
            <PrivateRoute>
              <ListsPage />
            </PrivateRoute>
          </SetupGuard>
        }
      />
      <Route
        path="/lists"
        element={
          <SetupGuard>
            <PrivateRoute>
              <ListsPage />
            </PrivateRoute>
          </SetupGuard>
        }
      />
      <Route
        path="/lists/:id"
        element={
          <SetupGuard>
            <PrivateRoute>
              <ListDetailsPage />
            </PrivateRoute>
          </SetupGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <SetupGuard>
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          </SetupGuard>
        }
      />
      <Route path="*" element={<Navigate to="/setup" replace />} />
    </Routes>
  )
}

export default App
