export type LancamentoStatus = 'PAGO' | 'EM_ABERTO' | 'EM_ATRASO';

export function calcularStatus(
  dataVencimento: Date,
  dataQuitacao?: Date,
): LancamentoStatus {
  if (dataQuitacao) return 'PAGO';

  const hoje = new Date();

  if (dataVencimento < hoje) return 'EM_ATRASO';

  return 'EM_ABERTO';
}
