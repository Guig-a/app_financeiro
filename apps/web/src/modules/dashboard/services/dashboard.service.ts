import { cookies } from 'next/headers';
import type { Role } from '@/shared/types/role';
import type { DashboardViewModel } from '../types/dashboard.types';
import {
  buildDashboardViewModel,
  type LancamentoRow,
  type PessoaRow,
} from '../view-models/dashboard.view-model';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

type UserResponse = {
  email: string;
  tenantId: string;
  role: Role;
};

async function fetchWithSession<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) return null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

function normalizeLancamentos(raw: unknown[]): LancamentoRow[] {
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>;
      const tipo = r.tipo as string;
      const valor = Number(r.valor);
      const dataCompetencia = String(r.dataCompetencia ?? '');
      if (tipo !== 'RECEITA' && tipo !== 'DESPESA') return null;
      if (!Number.isFinite(valor) || !dataCompetencia) return null;
      return { valor, tipo, dataCompetencia };
    })
    .filter((x): x is LancamentoRow => x !== null);
}

function normalizePessoas(raw: unknown[]): PessoaRow[] {
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>;
      const tipo = String(r.tipo ?? '');
      if (!tipo) return null;
      return { tipo };
    })
    .filter((x): x is PessoaRow => x !== null);
}

export async function getDashboardViewModel(): Promise<DashboardViewModel | null> {
  const [user, lancamentosRaw, produtos, usuarios, pessoasRaw] =
    await Promise.all([
      fetchWithSession<UserResponse>('/users/me'),
      fetchWithSession<unknown[]>('/lancamentos'),
      fetchWithSession<unknown[]>('/produtos'),
      fetchWithSession<unknown[]>('/users'),
      fetchWithSession<unknown[]>('/pessoas'),
    ]);

  if (!user) return null;

  const lancamentos = normalizeLancamentos(lancamentosRaw ?? []);
  const pessoas = normalizePessoas(pessoasRaw ?? []);

  return buildDashboardViewModel({
    user,
    lancamentos,
    produtos: produtos ?? [],
    usuarios: usuarios ?? [],
    pessoas,
  });
}
