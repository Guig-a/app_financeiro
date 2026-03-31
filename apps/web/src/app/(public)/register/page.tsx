import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { PublicAuthGate } from '@/modules/auth/components/PublicAuthGate';

export default function RegisterPage() {
  return (
    <PublicAuthGate>
      <main className="grid min-h-screen grid-cols-1 bg-(--color-bg) p-6 lg:grid-cols-2 lg:p-0">
        <section className="hidden flex-col justify-between bg-linear-to-br from-[#0f172a] to-[#1e3a8a] p-10 text-white lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] opacity-80">
              Financeiro App
            </p>
            <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-snug">
              Comece com seu próprio tenant em poucos minutos.
            </h2>
          </div>
          <p className="max-w-xs text-sm opacity-90">
            Seu usuário será criado como MASTER e terá controle completo sobre os
            dados do tenant.
          </p>
        </section>
        <section className="flex items-center justify-center">
          <RegisterForm />
        </section>
      </main>
    </PublicAuthGate>
  );
}
