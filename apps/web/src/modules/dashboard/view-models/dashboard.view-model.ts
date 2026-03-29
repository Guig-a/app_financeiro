import type { Role } from '@/shared/types/role';
import type { DashboardChartPoint, DashboardViewModel } from '../types/dashboard.types';

export type LancamentoRow = {
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  dataCompetencia: string;
};

export type PessoaRow = {
  tipo: string;
};

const MESES = 6;

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function labelFromMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '');
}

/** Últimos N meses (calendário), do mais antigo ao mais recente. */
export function rollingMonthKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKeyFromDate(d));
  }
  return keys;
}

export function buildChartSeries(
  lancamentos: LancamentoRow[],
  monthKeys: string[],
): DashboardChartPoint[] {
  const acc = new Map<string, { receita: number; despesa: number }>();
  for (const key of monthKeys) {
    acc.set(key, { receita: 0, despesa: 0 });
  }

  for (const l of lancamentos) {
    const raw = l.dataCompetencia;
    const key = raw.slice(0, 7);
    if (!acc.has(key)) continue;
    const bucket = acc.get(key)!;
    if (l.tipo === 'RECEITA') bucket.receita += l.valor;
    else bucket.despesa += l.valor;
  }

  return monthKeys.map((monthKey) => {
    const v = acc.get(monthKey)!;
    return {
      monthKey,
      label: labelFromMonthKey(monthKey),
      receita: v.receita,
      despesa: v.despesa,
    };
  });
}

export function countClientesFornecedores(pessoas: PessoaRow[]): {
  clientes: number;
  fornecedores: number;
} {
  let clientes = 0;
  let fornecedores = 0;
  for (const p of pessoas) {
    if (p.tipo === 'CLIENTE' || p.tipo === 'AMBOS') clientes += 1;
    if (p.tipo === 'FORNECEDOR' || p.tipo === 'AMBOS') fornecedores += 1;
  }
  return { clientes, fornecedores };
}

export function sumReceitaDespesa(lancamentos: LancamentoRow[]): {
  receita: number;
  despesa: number;
} {
  let receita = 0;
  let despesa = 0;
  for (const l of lancamentos) {
    if (l.tipo === 'RECEITA') receita += l.valor;
    else despesa += l.valor;
  }
  return { receita, despesa };
}

function formatPct(n: number, digits = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n);
}

function currentPeriodLabel(): string {
  const d = new Date();
  return d
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function buildDashboardViewModel(input: {
  user: { email: string; tenantId: string; role: Role };
  lancamentos: LancamentoRow[];
  produtos: unknown[];
  usuarios: unknown[];
  pessoas: PessoaRow[];
}): DashboardViewModel {
  const monthKeys = rollingMonthKeys(MESES);
  const { receita, despesa } = sumReceitaDespesa(input.lancamentos);
  const { clientes, fornecedores } = countClientesFornecedores(input.pessoas);
  const chartSeries = buildChartSeries(input.lancamentos, monthKeys);

  const last = chartSeries[chartSeries.length - 1];
  const prev = chartSeries[chartSeries.length - 2];
  let receitaMoMPct = 0;
  if (prev && prev.receita > 0) {
    receitaMoMPct = ((last.receita - prev.receita) / prev.receita) * 100;
  } else if (prev && prev.receita === 0 && last.receita > 0) {
    receitaMoMPct = 100;
  }

  const receitaSign = receitaMoMPct > 0 ? '+' : '';
  const hintReceita = `${receitaSign}${formatPct(receitaMoMPct)}% vs mês anterior`;

  const saldo = receita - despesa;
  let hintDespesa: string;
  if (receita > 0 && despesa > receita) {
    const neg = ((despesa - receita) / receita) * 100;
    hintDespesa = `-${formatPct(neg)}% saldo negativo`;
  } else if (saldo >= 0) {
    hintDespesa = 'saldo não negativo no período';
  } else {
    hintDespesa = 'saldo negativo no período';
  }

  const hintLancamentos = 'no período atual';
  const hintClientes = 'incl. tipo ambos';
  const hintFornecedores = 'incl. tipo ambos';
  const hintProdutos = 'ativo no catálogo';

  return {
    userEmail: input.user.email,
    tenantId: input.user.tenantId,
    role: input.user.role,
    periodLabel: currentPeriodLabel(),
    totalLancamentos: input.lancamentos.length,
    totalProdutos: input.produtos.length,
    totalUsuarios: input.usuarios.length,
    totalClientes: clientes,
    totalFornecedores: fornecedores,
    totalReceita: receita,
    totalDespesa: despesa,
    chartSeries,
    hintReceita,
    hintDespesa,
    hintLancamentos,
    hintClientes,
    hintFornecedores,
    hintProdutos,
  };
}
