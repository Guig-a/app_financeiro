import { Injectable } from '@nestjs/common';
import { UnidadeProduto } from '../../../prisma/generated/client';
import { ProdutosRepository } from '../produtos.repository';
import { parseCsv } from './produtos-import.util';

function parseUnidade(raw: unknown): UnidadeProduto | undefined {
  if (raw == null || raw === '') return undefined;
  const u = String(raw).trim().toUpperCase();
  const aliases: Record<string, UnidadeProduto> = {
    KG: UnidadeProduto.KG,
    UN: UnidadeProduto.UN,
    UNIDADE: UnidadeProduto.UN,
    CX: UnidadeProduto.CAIXA,
    CAIXA: UnidadeProduto.CAIXA,
    FARDO: UnidadeProduto.FARDO,
    FD: UnidadeProduto.FARDO,
  };
  if (aliases[u]) return aliases[u];
  const values = Object.values(UnidadeProduto) as string[];
  if (values.includes(u)) return u as UnidadeProduto;
  return undefined;
}

@Injectable()
export class ProdutosImportService {
  constructor(private repo: ProdutosRepository) {}

  async importFromCsv(path: string, tenantId: string) {
    const rows = await parseCsv(path);

    const produtos = rows.map((row) => ({
      nome: row.nome || row.NOME,
      codigo: row.codigo || row.CODIGO,
      unidade: parseUnidade(row.unidade ?? row.UNIDADE),
      preco: row.preco ? Number(row.preco) : undefined,
    }));

    return this.repo.createMany(tenantId, produtos);
  }
}
