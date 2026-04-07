'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../services/auth.service';
import { routes } from '@/config/routes';
import { getApiErrorMessage } from '@/shared/lib/api';
import { setFlashToast } from '@/shared/lib/toast';
import { useToast } from '@/shared/providers/toast-provider';

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      setFlashToast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta.',
        variant: 'success',
      });
      router.push(routes.dashboard);
      router.refresh();
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error('Falha no login', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-(--color-border) bg-(--color-surface) p-7 shadow-sm"
    >
      <h1 className="mb-1 text-2xl font-semibold">Bem-vindo de volta</h1>
      <p className="mb-6 text-sm text-(--color-text-muted)">
        Acesse sua conta e continue a operação com segurança.
      </p>

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
        E-mail
      </label>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-4 w-full rounded-md border border-(--color-border) bg-transparent px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        required
      />

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
        Senha
      </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-4 w-full rounded-md border border-(--color-border) bg-transparent px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        required
      />

      {error ? (
        <p className="mb-4 text-sm text-(--color-danger)">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-(--color-primary) px-3 py-2 text-sm font-medium text-(--color-primary-contrast) transition hover:opacity-90 disabled:opacity-70"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        Novo por aqui?{' '}
        <Link href={routes.register} className="text-(--color-primary)">
          Registre-se
        </Link>
      </p>
    </form>
  );
}
