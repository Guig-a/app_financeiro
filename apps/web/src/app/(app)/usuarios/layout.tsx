'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/shared/providers/auth-session-provider';
import { routes } from '@/config/routes';
import { Role } from '@/shared/types/role';

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role !== Role.MASTER) {
      router.replace(routes.dashboard);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="text-sm text-(--color-text-muted)">Carregando…</div>
    );
  }

  if (!user || user.role !== Role.MASTER) {
    return null;
  }

  return <>{children}</>;
}
