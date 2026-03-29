'use client';

import { useQuery } from '@tanstack/react-query';
import { getProdutos } from '../services/produto.service';

export function useProdutos() {
  return useQuery({
    queryKey: ['produtos'],
    queryFn: getProdutos,
  });
}
