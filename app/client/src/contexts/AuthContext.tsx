import React, { useEffect, useState, useCallback } from 'react';
import { authApi } from '@/api/requests';
import { AuthContext, AuthContextType } from './AuthContext';
import { User } from '@/api/types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  const checkAuthStatus = useCallback(async (backgroundCheck = false) => {
    if (backgroundCheck) {
      setIsCheckingSession(true);
    } else {
      setIsLoading(true);
    }

    try {
      await authApi.verifySession();
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (error) {
      if (!backgroundCheck) {
        setUser(null);
      }
    } finally {
      if (backgroundCheck) {
        setIsCheckingSession(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial auth check on mount

  // Background session checks (e.g., every 5 minutes)

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.login({ email, password });
      // Only set user on successful login
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const refreshUser = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || isCheckingSession,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};