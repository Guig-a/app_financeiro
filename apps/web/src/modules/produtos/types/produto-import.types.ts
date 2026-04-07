export type ImportRowResolution = 'update' | 'ignore';

export type ProdutoImportPreviewRow = {
  rowIndex: number;
  lineNumber: number;
  nome: string;
  codigo: string;
  unidade: string;
  preco: string;
  parsed: {
    nome: string;
    codigo?: string;
    unidade?: string;
    preco?: number;
  };
  errors: string[];
  status: 'novo' | 'existente' | 'invalido';
  existingId?: string;
};

export type ProdutoImportPreviewResult = {
  valid: boolean;
  blockingReason?: string;
  rows: ProdutoImportPreviewRow[];
};
