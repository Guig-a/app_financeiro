'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/auth.service';
import { routes } from '@/config/routes';
import { getApiErrorMessage } from '@/shared/lib/api';
import { setFlashToast } from '@/shared/lib/toast';
import { useToast } from '@/shared/providers/toast-provider';

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskCpf(d: string) {
  const x = d.slice(0, 11);
  if (x.length <= 3) return x;
  if (x.length <= 6) return `${x.slice(0, 3)}.${x.slice(3)}`;
  if (x.length <= 9) return `${x.slice(0, 3)}.${x.slice(3, 6)}.${x.slice(6)}`;
  return `${x.slice(0, 3)}.${x.slice(3, 6)}.${x.slice(6, 9)}-${x.slice(9)}`;
}

function maskCnpj(d: string) {
  const x = d.slice(0, 14);
  if (x.length <= 2) return x;
  if (x.length <= 5) return `${x.slice(0, 2)}.${x.slice(2)}`;
  if (x.length <= 8) return `${x.slice(0, 2)}.${x.slice(2, 5)}.${x.slice(5)}`;
  if (x.length <= 12) {
    return `${x.slice(0, 2)}.${x.slice(2, 5)}.${x.slice(5, 8)}/${x.slice(8)}`;
  }
  return `${x.slice(0, 2)}.${x.slice(2, 5)}.${x.slice(5, 8)}/${x.slice(8, 12)}-${x.slice(12)}`;
}

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

    const docDigits = onlyDigits(documentValue);
    const payload =
      documentMode === 'cnpj'
        ? { name, email, password, cnpj: docDigits }
        : { name, email, password, cpf: docDigits };

    try {
      await register(payload);
      setFlashToast({
        title: 'Conta criada com sucesso',
        description: 'Sua organização foi criada e você já está autenticado.',
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
      className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-7 shadow-sm"
    >
      <h1 className="mb-1 text-2xl font-semibold">Crie sua organização</h1>
      <p className="mb-6 text-sm text-(--color-text-muted)">
        Preencha os dados abaixo — você será o administrador principal.
      </p>

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
        Nome da empresa
      </label>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-4 w-full rounded-md border border-(--color-border) bg-transparent px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        required
      />

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
        minLength={6}
        className="mb-4 w-full rounded-md border border-(--color-border) bg-transparent px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        required
      />

      <div className="mb-2 flex rounded-md border border-(--color-border) p-1">
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-xs ${
            documentMode === 'cnpj'
              ? 'bg-(--color-primary) text-(--color-primary-contrast)'
              : 'text-(--color-text-muted)'
          }`}
          onClick={() => {
            const d = onlyDigits(documentValue);
            setDocumentMode('cnpj');
            setDocumentValue(maskCnpj(d));
          }}
        >
          CNPJ
        </button>
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-xs ${
            documentMode === 'cpf'
              ? 'bg-(--color-primary) text-(--color-primary-contrast)'
              : 'text-(--color-text-muted)'
          }`}
          onClick={() => {
            const d = onlyDigits(documentValue);
            setDocumentMode('cpf');
            setDocumentValue(maskCpf(d));
          }}
        >
          CPF
        </button>
      </div>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={documentValue}
        onChange={(event) => {
          const digits = onlyDigits(event.target.value);
          setDocumentValue(
            documentMode === 'cnpj' ? maskCnpj(digits) : maskCpf(digits),
          );
        }}
        placeholder={
          documentMode === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'
        }
        maxLength={documentMode === 'cnpj' ? 18 : 14}
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
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>

      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        Já tem conta?{' '}
        <Link href={routes.login} className="text-(--color-primary)">
          Entrar
        </Link>
      </p>
    </form>
  );
}
