import { apiFetch } from '@/shared/lib/api';
import { Usuario, UsuarioPayload } from '../types/usuario.types';

export function getUsuarios() {
  return apiFetch<Usuario[]>('/users', { method: 'GET' });
}

export function createUsuario(payload: Required<Pick<UsuarioPayload, 'email' | 'password'>> & Pick<UsuarioPayload, 'role'>) {
  return apiFetch<Usuario>('/users', {
    method: 'POST',
    json: payload,
  });
}

export function updateUsuario(id: string, payload: UsuarioPayload) {
  return apiFetch<Usuario>(`/users/${id}`, {
    method: 'PATCH',
    json: payload,
  });
}

export function deleteUsuario(id: string) {
  return apiFetch<Usuario>(`/users/${id}`, {
    method: 'DELETE',
  });
}
