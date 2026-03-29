'use client';

import dynamic from 'next/dynamic';
import type { DashboardChartPoint } from '../types/dashboard.types';

const DashboardRevenueChart = dynamic(
  () =>
    import('./DashboardRevenueChart').then((m) => ({
      default: m.DashboardRevenueChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
    ),
  },
);

type Props = {
  chartSeries: DashboardChartPoint[];
};

export function DashboardChartsHost({ chartSeries }: Props) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">
        Receita vs despesa
      </h2>
      <p className="mb-4 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
        Últimos 6 meses
      </p>
      <DashboardRevenueChart data={chartSeries} />
    </div>
  );
}
