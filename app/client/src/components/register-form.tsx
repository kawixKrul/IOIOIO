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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeRequest } from "@/api/requests";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface RegistrationData {
    email: string;
    password: string;
    name: string;
    surname: string;
    role: string;
    expertiseField?: string;
}

interface ActivationStatus {
    isActive: boolean;
}

export function RegisterForm({
    className,
    onToggleForm,
    ...props
}: React.ComponentPropsWithoutRef<"div"> & { onToggleForm: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [role, setRole] = useState("student"); // Default to student
    const [expertiseField, setExpertiseField] = useState("");
    const [showActivationModal, setShowActivationModal] = useState(false);

    // Registration mutation
    const registerMutation = useMutation({
        mutationFn: (data: RegistrationData) => 
            makeRequest("/register", "POST", data),
        onSuccess: () => {
            setShowActivationModal(true);
        },
        onError: (error: Error) => {
            alert(error.message || "Registration failed");
        }
    });

    // Activation status query - enabled only when modal is shown
    const activationQuery = useQuery({
        queryKey: ['activationStatus', email],
        queryFn: () => 
            makeRequest(`/activation-status?email=${encodeURIComponent(email)}`, "GET") as Promise<ActivationStatus>,
        enabled: showActivationModal && !!email,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    // Handle activation status changes
    useEffect(() => {
        if (activationQuery.data?.isActive) {
            setShowActivationModal(false);
            alert("Account activated successfully! You can now log in.");
            onToggleForm(); // Switch to login form
        }
    }, [activationQuery.data, onToggleForm]);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        const registrationData: RegistrationData = {
            email,
            password,
            name,
            surname,
            role,
            ...(role === "supervisor" ? { expertiseField } : {})
        };

        registerMutation.mutate(registrationData);
    };

    return (
        <>
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Register</CardTitle>
                        <CardDescription>
                            Enter your data below to create your new account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister}>
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        value={name} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                                        required 
                                        disabled={registerMutation.isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="surname">Surname</Label>
                                    <Input 
                                        id="surname" 
                                        value={surname} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)} 
                                        required 
                                        disabled={registerMutation.isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@student.agh.edu.pl or name@agh.edu.pl"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setEmail(e.target.value);
                                            // Basic role detection from email
                                            if (e.target.value.includes("@student.agh.edu.pl")) {
                                                setRole("student");
                                            } else if (e.target.value.includes("@agh.edu.pl")) {
                                                setRole("supervisor");
                                            } else {
                                                setRole("student"); // Default or handle error
                                            }
                                        }}
                                        required
                                        disabled={registerMutation.isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={password} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                                        required 
                                        disabled={registerMutation.isPending}
                                    />
                                </div>
                                {role === "supervisor" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="expertiseField">Field of Expertise</Label>
                                        <Input 
                                            id="expertiseField" 
                                            value={expertiseField} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpertiseField(e.target.value)} 
                                            required 
                                            disabled={registerMutation.isPending}
                                        />
                                    </div>
                                )}
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? "Registering..." : "Register"}
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={onToggleForm} 
                                    className="w-full"
                                    disabled={registerMutation.isPending}
                                >
                                    Do you have an account? Login here!
                                </Button>
                                {registerMutation.isError && (
                                    <p className="text-sm text-red-500 mt-2">{registerMutation.error.message}</p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={showActivationModal} onOpenChange={setShowActivationModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Awaiting Account Activation</DialogTitle>
                        <DialogDescription>
                            Please check your email for an activation link. This window will close automatically once your account is activated.
                            {activationQuery.isError && (
                                <p className="text-sm text-red-500 mt-2">Error checking activation status: {activationQuery.error.message}</p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
