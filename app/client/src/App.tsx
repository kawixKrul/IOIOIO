import { LandingPage } from './components/landing-page'
import { LoginForm } from './components/login-form'
import { RegisterForm } from './components/register-form'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import UserPage from './pages/user-page'
import OverseerPage from './pages/overseer-page'


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/overseer" element={<OverseerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
