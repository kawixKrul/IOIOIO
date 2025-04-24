import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RegisterForm } from "./register-form"
import { useState } from "react"
import { LoginForm } from "./login-form"


export function LandingPage() {
    const [isLogin, setIsLogin] = useState(true)

    const toggleForm = () => setIsLogin(!isLogin)

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                {isLogin ? (
                    <LoginForm onToggleForm={toggleForm} />
                ) : (
                    <RegisterForm onToggleForm={toggleForm} />
                )}
            </div>
        </div>
    )
}
