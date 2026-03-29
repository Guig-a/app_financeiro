import { apiFetch } from '@/shared/lib/api';
import { Lancamento, LancamentoPayload } from '../types/lancamento.types';

export function getLancamentos() {
  return apiFetch<Lancamento[]>('/lancamentos', { method: 'GET' });
}

export function createLancamento(payload: LancamentoPayload) {
  return apiFetch<Lancamento>('/lancamentos', {
    method: 'POST',
    json: payload,
  });
}

export function updateLancamento(
  id: string,
  payload: Partial<LancamentoPayload>,
) {
  return apiFetch<Lancamento>(`/lancamentos/${id}`, {
    method: 'PATCH',
    json: payload,
  });
}

export function deleteLancamento(id: string) {
  return apiFetch<Lancamento>(`/lancamentos/${id}`, {
    method: 'DELETE',
  });
}
