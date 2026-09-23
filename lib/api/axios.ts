import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://dummyjson.com';

const STORAGE_KEY = 'padmin_auth';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
}

export function normalizeApiError(error: unknown): ApiErrorResponse {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    const message =
      data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return { message, status: error.response?.status };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred. Please try again.' };
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath === '/login' || currentPath.startsWith('/login');
        if (!isAuthPage) {
          window.location.href = '/login?reason=session_expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
