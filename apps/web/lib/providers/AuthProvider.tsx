'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { getCurrentUser, setTokens } from '@/lib/store/features/authSlice';
import * as authApi from '@/lib/api/auth';

interface AuthContextType {
  isAuthInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthInitialized: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if tokens exist in localStorage
        const accessToken =
          typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (accessToken && refreshToken) {
          // Set tokens in Redux state
          dispatch(setTokens({ accessToken, refreshToken }));

          // Fetch current user to validate token and restore user state
          await dispatch(getCurrentUser()).unwrap();

          console.log('[AuthProvider] Auto-login successful');
        } else {
          console.log('[AuthProvider] No tokens found, user not logged in');
        }
      } catch (error) {
        // Token invalid or expired, clear storage
        console.error('[AuthProvider] Auto-login failed:', error);
        authApi.logout();
      } finally {
        // Mark initialization as complete
        setIsAuthInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isAuthInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}
