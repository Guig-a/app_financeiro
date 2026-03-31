'use client';

import type { ReactNode } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Topbar } from '@/shared/components/layout/Topbar';
import { useAuthSession } from '@/shared/providers/auth-session-provider';

export function AppAuthShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg) text-sm text-(--color-text-muted)">
        Carregando sessão…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-(--color-bg)">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
