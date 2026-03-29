import type { UnidadeProduto } from '../../../prisma/generated/client';

export class Produto {
  id: string;
  nome: string;
  codigo?: string;
  unidade?: UnidadeProduto;
  preco?: number;
  createdAt: Date;
}
