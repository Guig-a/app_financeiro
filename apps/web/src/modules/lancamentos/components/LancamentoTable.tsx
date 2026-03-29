import { Lancamento } from '../types/lancamento.types';
import { formatCurrency } from '@/shared/lib/format';

type LancamentoTableProps = {
  data: Lancamento[];
};

export function LancamentoTable({ data }: LancamentoTableProps) {
  return (
    <table className="w-full border-collapse overflow-hidden rounded-lg border border-[var(--color-border)] text-sm">
      <thead className="bg-[var(--color-surface-muted)] text-left text-[var(--color-text-muted)]">
        <tr>
          <th className="px-3 py-2">Descrição</th>
          <th className="px-3 py-2">Tipo</th>
          <th className="px-3 py-2 text-right">Valor</th>
        </tr>
      </thead>
      <tbody className="bg-[var(--color-surface)]">
        {data.map((item) => (
          <tr key={item.id} className="border-t border-[var(--color-border)]">
            <td className="px-3 py-2">{item.descricao ?? '-'}</td>
            <td className="px-3 py-2">{item.tipo}</td>
            <td className="font-numeric px-3 py-2 text-right">
              {formatCurrency(item.valor)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
