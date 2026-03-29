'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/auth.service';
import { routes } from '@/config/routes';
import { getApiErrorMessage } from '@/shared/lib/api';
import { setFlashToast } from '@/shared/lib/toast';
import { useToast } from '@/shared/providers/toast-provider';

type RegisterMode = 'cnpj' | 'cpf';

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [documentMode, setDocumentMode] = useState<RegisterMode>('cnpj');
  const [documentValue, setDocumentValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload =
      documentMode === 'cnpj'
        ? { name, email, password, cnpj: documentValue }
        : { name, email, password, cpf: documentValue };

    try {
      await register(payload);
      setFlashToast({
        title: 'Conta criada com sucesso',
        description: 'Seu tenant foi provisionado e você já está autenticado.',
        variant: 'success',
      });
      router.push(routes.dashboard);
      router.refresh();
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error('Falha no cadastro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-sm"
    >
      <h1 className="mb-1 text-2xl font-semibold">Crie seu tenant</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Cadastre seu acesso master para começar.
      </p>

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Nome da empresa
      </label>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-4 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        required
      />

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        E-mail
      </label>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-4 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        required
      />

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Senha
      </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        className="mb-4 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        required
      />

      <div className="mb-2 flex rounded-md border border-[var(--color-border)] p-1">
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-xs ${
            documentMode === 'cnpj'
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
              : 'text-[var(--color-text-muted)]'
          }`}
          onClick={() => setDocumentMode('cnpj')}
        >
          CNPJ
        </button>
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-xs ${
            documentMode === 'cpf'
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
              : 'text-[var(--color-text-muted)]'
          }`}
          onClick={() => setDocumentMode('cpf')}
        >
          CPF
        </button>
      </div>

      <input
        type="text"
        value={documentValue}
        onChange={(event) => setDocumentValue(event.target.value)}
        placeholder={documentMode === 'cnpj' ? 'CNPJ' : 'CPF'}
        className="mb-4 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        required
      />

      {error ? (
        <p className="mb-4 text-sm text-[var(--color-danger)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary-contrast)] transition hover:opacity-90 disabled:opacity-70"
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>

      <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
        Já tem conta?{' '}
        <Link href={routes.login} className="text-[var(--color-primary)]">
          Entrar
        </Link>
      </p>
    </form>
  );
}
