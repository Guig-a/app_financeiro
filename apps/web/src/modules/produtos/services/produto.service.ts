import { apiFetch } from '@/shared/lib/api';
import { Produto, ProdutoPayload } from '../types/produto.types';

export function getProdutos() {
  return apiFetch<Produto[]>('/produtos', { method: 'GET' });
}

export function createProduto(payload: ProdutoPayload) {
  return apiFetch<Produto>('/produtos', {
    method: 'POST',
    json: payload,
  });
}

export function updateProduto(id: string, payload: Partial<ProdutoPayload>) {
  return apiFetch<Produto>(`/produtos/${id}`, {
    method: 'PATCH',
    json: payload,
  });
}

export function deleteProduto(id: string) {
  return apiFetch<Produto>(`/produtos/${id}`, {
    method: 'DELETE',
  });
}
