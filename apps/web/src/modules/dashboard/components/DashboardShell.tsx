'use client';

import { useEffect, useState } from 'react';
import { getDashboardViewModel } from '../services/dashboard.service';
import type { DashboardViewModel } from '../types/dashboard.types';
import { DashboardPageHeader } from './DashboardPageHeader';
import { KpiCard } from './KpiCard';
import { DashboardChartsHost } from './DashboardChartsHost';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatCurrency } from '@/shared/lib/format';

export function DashboardShell() {
  const [vm, setVm] = useState<DashboardViewModel | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getDashboardViewModel();
      if (!cancelled) setVm(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (vm === undefined) {
    return (
      <p className="text-sm text-(--color-text-muted)">Carregando dashboard…</p>
    );
  }

  if (!vm) {
    return (
      <EmptyState
        title="Sem sessão ativa"
        subtitle="Faça login para visualizar o dashboard."
      />
    );
  }

  return (
    <section>
      <DashboardPageHeader
        title="Dashboard"
        description={`${vm.periodLabel} · ${vm.totalUsuarios} usuários ativos`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Receita total"
          value={formatCurrency(vm.totalReceita)}
          tone="success"
          hint={vm.hintReceita}
        />
        <KpiCard
          label="Despesa total"
          value={formatCurrency(vm.totalDespesa)}
          tone="danger"
          hint={vm.hintDespesa}
        />
        <KpiCard
          label="Lançamentos"
          value={vm.totalLancamentos}
          tone="neutral"
          hint={vm.hintLancamentos}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Clientes"
          value={vm.totalClientes}
          tone="neutral"
          hint={vm.hintClientes}
        />
        <KpiCard
          label="Fornecedores"
          value={vm.totalFornecedores}
          tone="neutral"
          hint={vm.hintFornecedores}
        />
        <KpiCard
          label="Produtos"
          value={vm.totalProdutos}
          tone="neutral"
          hint={vm.hintProdutos}
        />
      </div>

      <div className="mt-6">
        <DashboardChartsHost chartSeries={vm.chartSeries} />
      </div>

      <p className="mt-4 text-xs text-(--color-text-muted)">
        KPIs carregados no cliente (cookies da API) · gráfico lazy no cliente.
      </p>
    </section>
  );
}
