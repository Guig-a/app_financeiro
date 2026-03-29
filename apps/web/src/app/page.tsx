import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { getServerSessionUser } from '@/shared/lib/auth';

export default async function Home() {
  const user = await getServerSessionUser();
  if (user) {
    redirect(routes.dashboard);
  }
  redirect(routes.login);
}
