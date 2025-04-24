import { LandingPage } from './components/landing-page'
import { LoginForm } from './components/login-form'
import { RegisterForm } from './components/register-form'

export default function App() {

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <LandingPage />
    </div>
  )
}
