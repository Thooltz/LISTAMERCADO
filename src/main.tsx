import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { GlobalStyle } from './shared/styles/GlobalStyle'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <GlobalStyle />
          <App />
          <Toaster
            position="top-center"
            containerStyle={{
              top: '0',
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                color: '#F9FAFB',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(30, 41, 59, 0.5)',
                maxWidth: '90vw',
                margin: '0 auto',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#fff',
                },
                style: {
                  background: 'rgba(34, 197, 94, 0.95)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  background: 'rgba(239, 68, 68, 0.95)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
