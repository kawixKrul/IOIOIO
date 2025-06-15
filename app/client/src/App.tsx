import { LandingPage } from './components/landing-page'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import UserPage from './pages/user-page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import SupervisorPage from './pages/supervisor-page.tsx'

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/user" 
              element={
                <ProtectedRoute>
                  <UserPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor" 
              element={
                <ProtectedRoute requiredRole="SUPERVISOR">
                  <SupervisorPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}