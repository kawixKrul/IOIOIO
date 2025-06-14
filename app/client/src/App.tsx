import { LandingPage } from './components/landing-page'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import UserPage from './pages/user-page'
import OverseerPage from './pages/supervisor-page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import SupervisorPage from './pages/supervisor-page'

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/supervisor" element={<SupervisorPage />} />
        </Routes>
      </BrowserRouter>
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
              path="/overseer" 
              element={
                <ProtectedRoute requiredRole="SUPERVISOR">
                  <OverseerPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
