import { LandingPage } from './components/landing-page'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import UserPage from './pages/user-page'
import OverseerPage from './pages/overseer-page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
          <Route path="/overseer" element={<OverseerPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
