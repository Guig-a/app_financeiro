'use client';

import { useQuery } from '@tanstack/react-query';
import { me } from '../services/auth.service';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
  });
}
