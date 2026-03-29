import { redirect } from 'next/navigation';
import { getServerSessionUser } from '@/shared/lib/auth';
import { routes } from '@/config/routes';
import { Role } from '@/shared/types/role';

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);
  if (user.role !== Role.MASTER) redirect(routes.dashboard);
  return <>{children}</>;
}
