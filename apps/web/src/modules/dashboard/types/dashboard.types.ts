/** Dados agregados para a view (MVVM) — montados no servidor. */
export type DashboardChartPoint = {
  /** Chave estável YYYY-MM */
  monthKey: string;
  /** Rótulo curto ex.: jan/26 */
  label: string;
  receita: number;
  despesa: number;
};

export type DashboardViewModel = {
  userEmail: string;
  tenantId: string;
  role: string;
  /** Ex.: "março 2026" para o cabeçalho do dashboard */
  periodLabel: string;
  totalLancamentos: number;
  totalProdutos: number;
  totalUsuarios: number;
  /** Pessoas com papel de cliente (CLIENTE + AMBOS) */
  totalClientes: number;
  /** Pessoas com papel de fornecedor (FORNECEDOR + AMBOS) */
  totalFornecedores: number;
  totalReceita: number;
  totalDespesa: number;
  chartSeries: DashboardChartPoint[];
  hintReceita: string;
  hintDespesa: string;
  hintLancamentos: string;
  hintClientes: string;
  hintFornecedores: string;
  hintProdutos: string;
};
