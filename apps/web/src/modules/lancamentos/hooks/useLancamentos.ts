'use client';

import { useQuery } from '@tanstack/react-query';
import { getLancamentos } from '../services/lancamento.service';

export function useLancamentos() {
  return useQuery({
    queryKey: ['lancamentos'],
    queryFn: getLancamentos,
  });
}
