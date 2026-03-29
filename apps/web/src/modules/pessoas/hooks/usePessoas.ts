'use client';

import { useQuery } from '@tanstack/react-query';
import { getPessoas } from '../services/pessoa.service';

export function usePessoas() {
  return useQuery({
    queryKey: ['pessoas'],
    queryFn: getPessoas,
  });
}
