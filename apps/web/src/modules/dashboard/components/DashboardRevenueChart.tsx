'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardChartPoint } from '../types/dashboard.types';
import { formatCurrency } from '@/shared/lib/format';

type Props = {
  data: DashboardChartPoint[];
};

export function DashboardRevenueChart({ data }: Props) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-[var(--color-border)]"
          />
          <XAxis
            dataKey="label"
            tick={{
              fontSize: 11,
              fill: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono-numbers), ui-monospace, monospace',
            }}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fill: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono-numbers), ui-monospace, monospace',
            }}
            tickFormatter={(v) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(Number(v))
            }
          />
          <Tooltip
            formatter={(value) =>
              formatCurrency(
                typeof value === 'number' ? value : Number(value ?? 0),
              )
            }
            labelStyle={{ color: 'var(--color-text)' }}
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontFamily:
                'var(--font-mono-numbers), ui-monospace, monospace',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="receita"
            name="Receita"
            fill="var(--color-finance-positive)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="despesa"
            name="Despesa"
            fill="var(--color-finance-negative)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
