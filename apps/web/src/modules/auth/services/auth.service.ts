import { apiFetch } from '@/shared/lib/api';
import { LoginInput, RegisterInput, SessionUser } from '../types/auth.types';

type AuthResponse = {
  user: SessionUser;
};

export async function login(payload: LoginInput) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    json: payload,
  });
}

export async function register(payload: RegisterInput) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    json: payload,
  });
}

export async function logout() {
  return apiFetch<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function me() {
  return apiFetch<SessionUser>('/users/me', {
    method: 'GET',
  });
}
