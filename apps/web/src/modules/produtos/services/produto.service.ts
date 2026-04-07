import { apiFetch } from '@/shared/lib/api';
import { Produto, ProdutoPayload } from '../types/produto.types';
import type {
  ImportRowResolution,
  ProdutoImportPreviewResult,
} from '../types/produto-import.types';

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

export function previewProdutosImport(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return apiFetch<ProdutoImportPreviewResult>('/produtos/import/preview', {
    method: 'POST',
    data: fd,
  });
}

export function applyProdutosImport(
  file: File,
  resolutions: Record<string, ImportRowResolution>,
) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('resolutions', JSON.stringify(resolutions));
  return apiFetch<{ created: number; updated: number; ignored: number }>(
    '/produtos/import/apply',
    { method: 'POST', data: fd },
  );
}
