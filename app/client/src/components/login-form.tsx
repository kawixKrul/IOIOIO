import * as React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/requests';

export function LoginForm({
    className,
    onToggleForm,
    ...props
}: React.ComponentPropsWithoutRef<"div"> & { onToggleForm: () => void }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (credentials: any) => {
            return await authApi.login(credentials);
        },
        onSuccess: (data) => {
            // Assuming your API returns user data including role
            const redirectPath = data.role === 'supervisor' ? '/supervisor' : '/user';
            navigate(redirectPath);
        },
        onError: (err: Error) => {
            console.error('Login error:', err);
        }
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        mutate({ email, password });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@agh.pl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Logging in..." : "Login"}
                            </Button>
                            <Button
                                type="button"
                                onClick={onToggleForm}
                                className="w-full"
                                disabled={isPending}
                            >
                                Don&apos;t have an account?
                            </Button>
                            {error && (
                                <p className="text-sm text-red-500 mt-2">
                                    {error.message || "Login failed"}
                                </p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}