export const UNIDADES_PRODUTO = ['KG', 'UN', 'CAIXA', 'FARDO'] as const;

export type UnidadeProduto = (typeof UNIDADES_PRODUTO)[number];

export type Produto = {
  id: string;
  nome: string;
  codigo?: string;
  unidade?: UnidadeProduto;
  preco?: number;
};

export type ProdutoPayload = {
  nome: string;
  codigo?: string;
  unidade?: UnidadeProduto;
  preco?: number;
};

/** Estado de formulário: unidade vazia até o usuário escolher. */
export type ProdutoFormState = Omit<ProdutoPayload, 'unidade'> & {
  unidade: UnidadeProduto | '';
};
