'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { me } from '@/modules/auth/services/auth.service';
import { routes } from '@/config/routes';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await me();
        if (!cancelled) router.replace(routes.dashboard);
      } catch {
        if (!cancelled) router.replace(routes.login);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-bg) text-sm text-(--color-text-muted)">
      Carregando…
    </div>
  );
}
