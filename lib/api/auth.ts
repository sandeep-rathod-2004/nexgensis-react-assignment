import api from './axios';
import type { AuthResponse, LoginCredentials, User } from '@/types';

export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    username: credentials.username,
    password: credentials.password,
  });
  return data;
}

export async function getCurrentUser(token: string): Promise<User> {
  const { data } = await api.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
