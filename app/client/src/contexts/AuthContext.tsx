import React, { useEffect, useState } from 'react';
import { authApi, User } from '@/api/requests';
import { AuthContext, AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;
  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      // Try to verify session is valid
      await authApi.verifySession();
      
      // If session is valid, set a minimal user object
      // You can replace this with actual profile data when /auth/profile is implemented
      setUser({
        id: 0,
        email: "authenticated@user.com",
        firstName: "",
        lastName: "",
        role: "USER"
      });
    } catch {
      // User is not authenticated or session expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (email: string, password: string) => {
    // Login and get the session cookie
    await authApi.login({ email, password });
    
    // For now, create a minimal user object
    // In the future, you can fetch the full profile from an auth endpoint
    setUser({
      id: 0, // Will be available when you add /auth/profile endpoint
      email: email,
      firstName: "", // Will be available when you add /auth/profile endpoint  
      lastName: "", // Will be available when you add /auth/profile endpoint
      role: "USER" // Will be determined when you add /auth/profile endpoint
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if logout request fails, clear local state
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      // Optionally redirect to login page
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
