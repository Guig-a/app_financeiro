'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { me } from '../services/auth.service';
import { routes } from '@/config/routes';

/**
 * Em produção com API noutro domínio, a sessão não existe nos cookies do Next.
 * Verifica no cliente se já há sessão na API antes de mostrar login/registro.
 */
export function PublicAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await me();
        if (!cancelled) router.replace(routes.dashboard);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg) text-sm text-(--color-text-muted)">
        Carregando…
      </div>
    );
  }

  return <>{children}</>;
}
