export type Produto = {
  id: string;
  nome: string;
  codigo?: string;
  unidade?: string;
  preco?: number;
};

export type ProdutoPayload = {
  nome: string;
  codigo?: string;
  unidade?: string;
  preco?: number;
};
