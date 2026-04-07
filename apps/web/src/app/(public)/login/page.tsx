import { LoginForm } from '@/modules/auth/components/LoginForm';
import { PublicAuthGate } from '@/modules/auth/components/PublicAuthGate';

export default function LoginPage() {
  return (
    <PublicAuthGate>
      <main className="grid min-h-screen grid-cols-1 bg-(--color-bg) p-6 lg:grid-cols-2 lg:p-0">
        <section className="hidden flex-col justify-between bg-linear-to-br from-(--color-primary) to-[#1d4ed8] p-10 text-white lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] opacity-80">
              Financeiro App
            </p>
            <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-snug">
              Controle financeiro claro para quem vive da operação do dia a dia.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed opacity-90">
            Lançamentos, produtos e equipe — cada empresa no seu ambiente isolado.
          </p>
        </section>
        <section className="flex items-center justify-center">
          <LoginForm />
        </section>
      </main>
    </PublicAuthGate>
  );
}
