import { apiFetch } from '@/shared/lib/api';
import { Pessoa, PessoaPayload } from '../types/pessoa.types';

export function getPessoas() {
  return apiFetch<Pessoa[]>('/pessoas', { method: 'GET' });
}

export function createPessoa(payload: PessoaPayload) {
  return apiFetch<Pessoa>('/pessoas', {
    method: 'POST',
    json: payload,
  });
}

export function updatePessoa(id: string, payload: Partial<PessoaPayload>) {
  return apiFetch<Pessoa>(`/pessoas/${id}`, {
    method: 'PATCH',
    json: payload,
  });
}

export function deletePessoa(id: string) {
  return apiFetch<Pessoa>(`/pessoas/${id}`, {
    method: 'DELETE',
  });
}
