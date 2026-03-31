import { QueryProvider } from '@/shared/providers/query-provider';
import { AuthSessionProvider } from '@/shared/providers/auth-session-provider';
import { AppAuthShell } from '@/shared/components/layout/AppAuthShell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthSessionProvider>
        <AppAuthShell>{children}</AppAuthShell>
      </AuthSessionProvider>
    </QueryProvider>
  );
}
