import type { LancamentoStatus } from '../types/lancamento.types';

const LABELS: Record<LancamentoStatus, string> = {
  PAGO: 'Pago',
  EM_ABERTO: 'Pendente',
  EM_ATRASO: 'Atrasado',
};

export function labelLancamentoStatus(status: LancamentoStatus): string {
  return LABELS[status];
}
