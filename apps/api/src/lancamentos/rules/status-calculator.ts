export type LancamentoStatus = 'PAGO' | 'EM_ABERTO' | 'EM_ATRASO';

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Compara apenas o dia civil (evita bugs de fuso / hora em vencimento vs hoje). */
function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calcularStatus(
  dataVencimento: Date | string,
  dataQuitacao?: Date | string | null,
): LancamentoStatus {
  if (dataQuitacao) {
    const quit = toDate(dataQuitacao);
    if (!Number.isNaN(quit.getTime())) return 'PAGO';
  }

  const venc = toDate(dataVencimento);
  const hoje = stripTime(new Date());
  const vencimento = stripTime(venc);

  if (vencimento < hoje) return 'EM_ATRASO';

  return 'EM_ABERTO';
}
