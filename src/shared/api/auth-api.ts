import type { AuthSession } from '../model/types';
import { apiRequest } from './http-client';

interface LoginCredentials {
  email: string;
  password: string;
}

export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthSession> =>
  apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

export const logoutAdmin = async (token: string | null): Promise<void> => {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    token
  });
};
