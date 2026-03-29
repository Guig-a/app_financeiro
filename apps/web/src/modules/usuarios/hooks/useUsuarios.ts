'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsuarios } from '../services/usuario.service';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });
}
