import { redirect } from 'next/navigation';
import { QueryProvider } from '@/shared/providers/query-provider';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Topbar } from '@/shared/components/layout/Topbar';
import { getServerSessionUser } from '@/shared/lib/auth';
import { routes } from '@/config/routes';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-[var(--color-bg)]">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
