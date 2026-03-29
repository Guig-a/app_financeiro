import { LoginForm } from '@/modules/auth/components/LoginForm';
import { getServerSessionUser } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

export default async function LoginPage() {
  const user = await getServerSessionUser();
  if (user) redirect(routes.dashboard);

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[var(--color-bg)] p-6 lg:grid-cols-2 lg:p-0">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-[var(--color-primary)] to-[#1d4ed8] p-10 text-white lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] opacity-80">
            Financeiro App
          </p>
          <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-snug">
            Gestão financeira multi-tenant com foco em operação diária.
          </h2>
        </div>
        <p className="max-w-xs text-sm opacity-90">
          Controle lançamentos, produtos e usuários com isolamento por tenant e
          autenticação segura por cookies httpOnly.
        </p>
      </section>
      <section className="flex items-center justify-center">
        <LoginForm />
      </section>
    </main>
  );
}
