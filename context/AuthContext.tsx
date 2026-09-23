'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';
import { loginUser as apiLoginUser } from '@/lib/api/auth';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/api/axios';
import { normalizeApiError, type ApiErrorResponse } from '@/lib/api/axios';

const USER_KEY = 'padmin_user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loginError: ApiErrorResponse | null;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_PATHS = ['/login'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<ApiErrorResponse | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setIsLoading(false);
      if (!isPublicPath(pathname)) {
        router.replace('/login');
      }
      return;
    }

    let parsedUser: User | null = null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) parsedUser = JSON.parse(raw) as User;
    } catch {
      parsedUser = null;
    }

    if (parsedUser) {
      setUser(parsedUser);
      setToken(storedToken);
      setIsLoading(false);
      if (isPublicPath(pathname)) {
        router.replace('/products');
      }
    } else {
      clearAuthToken();
      window.localStorage.removeItem(USER_KEY);
      setIsLoading(false);
      if (!isPublicPath(pathname)) {
        router.replace('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoginError(null);
      setIsLoggingIn(true);
      try {
        const response = await apiLoginUser({ username, password });
        const userData: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          gender: response.gender,
          image: response.image,
          accessToken: response.accessToken,
        };
        setAuthToken(response.accessToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        setToken(response.accessToken);
        router.replace('/products');
      } catch (error) {
        setLoginError(normalizeApiError(error));
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuthToken();
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
    router.replace('/login');
  }, [router]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    loginError,
    isLoggingIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
