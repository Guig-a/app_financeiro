export type PessoaTipo = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';

export type Pessoa = {
  id: string;
  nome: string;
  tipo: PessoaTipo;
  documento?: string;
};

export type PessoaPayload = {
  nome: string;
  tipo: PessoaTipo;
  documento?: string;
};
