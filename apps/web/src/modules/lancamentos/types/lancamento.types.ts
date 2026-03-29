export type Lancamento = {
  id: string;
  descricao?: string;
  pessoaId?: string;
  pessoa?: { id: string; nome: string } | null;
  produtoId?: string;
  produto?: { id: string; nome: string; codigo?: string; preco?: number } | null;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  dataCompetencia: string;
  dataVencimento: string;
  dataQuitacao?: string;
};

export type LancamentoPayload = {
  descricao?: string;
  pessoaId?: string;
  produtoId?: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  dataCompetencia: string;
  dataVencimento: string;
  dataQuitacao?: string;
};
