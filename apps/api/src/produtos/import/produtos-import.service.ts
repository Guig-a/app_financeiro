import { Injectable } from '@nestjs/common';
import { ProdutosRepository } from '../produtos.repository';
import { parseCsv } from './produtos-import.util';

@Injectable()
export class ProdutosImportService {
  constructor(private repo: ProdutosRepository) {}

  async importFromCsv(path: string, tenantId: string) {
    const rows = await parseCsv(path);

    const produtos = rows.map((row) => ({
      nome: row.nome || row.NOME,
      codigo: row.codigo || row.CODIGO,
      unidade: row.unidade || row.UNIDADE,
      preco: row.preco ? Number(row.preco) : undefined,
    }));

    return this.repo.createMany(tenantId, produtos);
  }
}
