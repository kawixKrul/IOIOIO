// components/ProtectedRoute.tsx
import { useAuth } from "@/hooks/useAuth";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ 
  children,
  requiredRole
}: {
  children: JSX.Element,
  requiredRole?: 'SUPERVISOR' | 'USER' 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/" />;
  
  // Check role if specified
  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'SUPERVISOR' && (user.role === 'supervisor' || user.role === 'admin')) ||
      (requiredRole === 'USER' && user.role === 'student');
      
    if (!hasRequiredRole) {
      return <Navigate to={requiredRole === 'SUPERVISOR' ? '/user' : '/supervisor'} />;
    }
  }

  return children;
};