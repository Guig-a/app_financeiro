'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { me } from '@/modules/auth/services/auth.service';
import { routes } from '@/config/routes';
import type { SessionUser } from '@/shared/lib/auth';

type AuthSessionContextValue = {
  user: SessionUser | null;
  loading: boolean;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await me();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) {
          setUser(null);
          router.replace(routes.login);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AuthSessionContext.Provider value={{ user, loading }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }
  return ctx;
}
