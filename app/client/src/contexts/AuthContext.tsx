import React, { useEffect, useState } from 'react';
import { authApi, studentApi, User } from '@/api/requests';
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
  }, []);  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      // Try to verify session is valid
      await authApi.verifySession();
      
      // If session is valid, try to get user profile
      try {
        const profileData = await studentApi.getProfile();
        const userIdMatch = profileData.match(/user ID: (\d+)/);
        const userId = userIdMatch ? parseInt(userIdMatch[1]) : 0;
        
        setUser({
          id: userId,
          email: "authenticated@user.com", // This should come from a proper profile endpoint
          firstName: "",
          lastName: "",
          role: "STUDENT"
        });
      } catch {
        // If profile fetch fails, set minimal user data
        setUser({
          id: 0,
          email: "authenticated@user.com",
          firstName: "",
          lastName: "",
          role: "USER"
        });
      }
    } catch {
      // User is not authenticated or session expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };  const login = async (email: string, password: string) => {
    // Login and get the session cookie
    await authApi.login({ email, password });
    
    // Try to get user profile after successful login
    try {
      const profileData = await studentApi.getProfile();
      
      // Parse the profile response (it's a string like "You are logged in as user ID: 123")
      const userIdMatch = profileData.match(/user ID: (\d+)/);
      const userId = userIdMatch ? parseInt(userIdMatch[1]) : 0;
      
      // TODO: In the future, create a proper /auth/profile endpoint that returns user role
      // For now, assume STUDENT role since we're using studentApi
      setUser({
        id: userId,
        email: email,
        firstName: "", // Will be available when full profile endpoint is implemented
        lastName: "", // Will be available when full profile endpoint is implemented
        role: "student" // Backend uses lowercase roles
      });
    } catch (error) {
      // If profile fetch fails, still set minimal user data
      console.warn('Could not fetch user profile:', error);
      setUser({
        id: 0,
        email: email,
        firstName: "",
        lastName: "",
        role: "student"
      });
    }
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
