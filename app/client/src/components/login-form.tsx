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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { makeRequest } from "@/api/requests";

export function LoginForm({
    className,
    onToggleForm,
    ...props
}: React.ComponentPropsWithoutRef<"div"> & { onToggleForm: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (credentials: { email: string; password: string }) =>
            makeRequest("/login", "POST", credentials),
        onSuccess: () => {
            // The cookie is now stored by the browser automatically
            navigate("/user");
        },
        onError: (error: Error) => {
            alert(error.message || "Login failed");
        }
    });

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        loginMutation.mutate({ email, password });
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
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@agh.pl"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                    disabled={loginMutation.isPending}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    disabled={loginMutation.isPending}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                            <Button type="button" onClick={onToggleForm} className="w-full" disabled={loginMutation.isPending}>
                                Don&apos;t have an account?
                            </Button>
                            {loginMutation.isError && (
                                <p className="text-sm text-red-500 mt-2">{loginMutation.error.message}</p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
