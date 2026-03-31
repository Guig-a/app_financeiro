import type { Role } from '@/shared/types/role';
import type { DashboardViewModel } from '../types/dashboard.types';
import {
  buildDashboardViewModel,
  type LancamentoRow,
  type PessoaRow,
} from '../view-models/dashboard.view-model';
import { apiFetch } from '@/shared/lib/api';

type UserResponse = {
  email: string;
  tenantId: string;
  role: Role;
};

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

/** Dados do dashboard via API (cookies no domínio da API; usar só no cliente). */
export async function getDashboardViewModel(): Promise<DashboardViewModel | null> {
  try {
    const [user, lancamentosRaw, produtos, usuarios, pessoasRaw] =
      await Promise.all([
        apiFetch<UserResponse>('/users/me', { method: 'GET' }),
        apiFetch<unknown[]>('/lancamentos', { method: 'GET' }),
        apiFetch<unknown[]>('/produtos', { method: 'GET' }),
        apiFetch<unknown[]>('/users', { method: 'GET' }),
        apiFetch<unknown[]>('/pessoas', { method: 'GET' }),
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
  } catch {
    return null;
  }
}
