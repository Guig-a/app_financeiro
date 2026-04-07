import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UnidadeProduto } from '../../../prisma/generated/client';
import { PrismaService } from '../../database/prisma.service';
import { ProdutosRepository } from '../produtos.repository';
import {
  CSV_TEMPLATE_DELIMITER,
  getHeaderKeysFromFirstLine,
  parseCsvBuffer,
  parseUnidade,
  REQUIRED_CSV_HEADERS,
  stripBom,
  validateCsvHeaderKeys,
} from './produtos-import.util';

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
    unidade?: UnidadeProduto;
    preco?: number;
  };
  errors: string[];
  status: 'novo' | 'existente' | 'invalido';
  existingId?: string;
};

export type ProdutoImportPreviewResult = {
  valid: boolean;
  /** Quando inválido por cabeçalho ou arquivo sem dados (sem linhas de preview). */
  blockingReason?: string;
  rows: ProdutoImportPreviewRow[];
};

@Injectable()
export class ProdutosImportService {
  constructor(
    private repo: ProdutosRepository,
    private prisma: PrismaService,
  ) {}

  /**
   * Modelo com `;` entre colunas para o Excel em PT-BR abrir cada campo numa célula.
   * A importação aceita também CSV com vírgula.
   */
  getCsvTemplate(): string {
    const sep = CSV_TEMPLATE_DELIMITER;
    const header = [...REQUIRED_CSV_HEADERS].join(sep);
    const example = ['Arroz 5kg', 'ARZ-001', 'UN', '24.90'].join(sep);
    return `${header}\n${example}\n`;
  }

  async previewFromBuffer(
    buffer: Buffer | undefined,
    tenantId: string,
  ): Promise<ProdutoImportPreviewResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Envie um arquivo CSV.');
    }
    const text = stripBom(buffer.toString('utf8')).trim();
    if (!text) {
      throw new BadRequestException('Arquivo CSV vazio.');
    }

    let rowsRaw: Record<string, string>[];
    try {
      rowsRaw = await parseCsvBuffer(buffer);
    } catch {
      throw new BadRequestException('Não foi possível ler o CSV.');
    }

    const headerKeys =
      rowsRaw.length > 0
        ? Object.keys(rowsRaw[0])
        : getHeaderKeysFromFirstLine(text);
    const headerError = validateCsvHeaderKeys(headerKeys);
    if (headerError) {
      return {
        valid: false,
        blockingReason: headerError,
        rows: [],
      };
    }

    if (rowsRaw.length === 0) {
      return {
        valid: false,
        blockingReason:
          'O CSV não tem linhas de dados. Inclua pelo menos uma linha abaixo do cabeçalho.',
        rows: [],
      };
    }

    const codigoToRows = new Map<string, number[]>();
    rowsRaw.forEach((row, idx) => {
      const c = String(row.codigo ?? '')
        .trim();
      if (c) {
        const list = codigoToRows.get(c) ?? [];
        list.push(idx);
        codigoToRows.set(c, list);
      }
    });

    const codigosParaBusca = [...codigoToRows.keys()].filter(
      (c) => (codigoToRows.get(c) ?? []).length === 1,
    );
    const existentes = await this.repo.findManyByCodigos(
      tenantId,
      codigosParaBusca,
    );
    const codigoToId = new Map(
      existentes
        .filter((p) => p.codigo)
        .map((p) => [p.codigo as string, p.id] as const),
    );

    const previewRows: ProdutoImportPreviewRow[] = rowsRaw.map((row, rowIndex) => {
      const lineNumber = rowIndex + 2;
      const errors: string[] = [];

      const nomeRaw = row.nome ?? '';
      const nome = String(nomeRaw).trim();
      if (!nome) {
        errors.push('Nome é obrigatório.');
      }

      const codigoTrim = String(row.codigo ?? '').trim();
      const codigo = codigoTrim || '';

      if (codigo) {
        const dup = codigoToRows.get(codigo) ?? [];
        if (dup.length > 1) {
          errors.push('Código duplicado no arquivo.');
        }
      }

      const unidadeCell = String(row.unidade ?? '').trim();
      let unidade: UnidadeProduto | undefined;
      if (unidadeCell) {
        unidade = parseUnidade(unidadeCell);
        if (!unidade) {
          errors.push(`Unidade inválida: "${unidadeCell}". Use KG, UN, CAIXA ou FARDO.`);
        }
      }

      const precoCell = String(row.preco ?? '').trim();
      let preco: number | undefined;
      if (precoCell) {
        const n = Number(precoCell.replace(',', '.'));
        if (Number.isNaN(n) || !Number.isFinite(n)) {
          errors.push('Preço inválido.');
        } else if (n < 0) {
          errors.push('Preço não pode ser negativo.');
        } else {
          preco = n;
        }
      }

      let status: ProdutoImportPreviewRow['status'] = 'invalido';
      let existingId: string | undefined;

      if (errors.length === 0) {
        if (codigo && (codigoToRows.get(codigo) ?? []).length === 1) {
          const id = codigoToId.get(codigo);
          if (id) {
            status = 'existente';
            existingId = id;
          } else {
            status = 'novo';
          }
        } else {
          status = 'novo';
        }
      }

      return {
        rowIndex,
        lineNumber,
        nome,
        codigo,
        unidade: unidadeCell,
        preco: precoCell,
        parsed: {
          nome,
          codigo: codigo || undefined,
          unidade,
          preco,
        },
        errors,
        status,
        existingId,
      };
    });

    const valid =
      previewRows.length > 0 &&
      previewRows.every((r) => r.errors.length === 0);

    return { valid, rows: previewRows };
  }

  async applyFromBuffer(
    buffer: Buffer | undefined,
    tenantId: string,
    resolutions: Record<string, ImportRowResolution>,
  ): Promise<{ created: number; updated: number; ignored: number }> {
    const preview = await this.previewFromBuffer(buffer, tenantId);
    if (!preview.valid) {
      throw new UnprocessableEntityException(
        'O arquivo contém linhas inválidas. Corrija o CSV e envie novamente.',
      );
    }

    for (const row of preview.rows) {
      if (row.status === 'existente') {
        const res = resolutions[String(row.rowIndex)];
        if (res !== 'update' && res !== 'ignore') {
          throw new BadRequestException(
            `Linha ${row.lineNumber}: escolha atualizar ou ignorar para o código existente "${row.codigo}".`,
          );
        }
      }
    }

    const ops: Array<{
      type: 'create' | 'update' | 'skip';
      id?: string;
      data?: {
        nome: string;
        codigo?: string;
        unidade?: UnidadeProduto;
        preco?: number;
      };
    }> = [];

    for (const row of preview.rows) {
      if (row.status === 'novo') {
        ops.push({
          type: 'create',
          data: {
            nome: row.parsed.nome,
            codigo: row.parsed.codigo,
            unidade: row.parsed.unidade,
            preco: row.parsed.preco,
          },
        });
      } else if (row.status === 'existente') {
        const res = resolutions[String(row.rowIndex)] as ImportRowResolution;
        if (res === 'ignore') {
          ops.push({ type: 'skip' });
        } else {
          ops.push({
            type: 'update',
            id: row.existingId,
            data: {
              nome: row.parsed.nome,
              codigo: row.parsed.codigo,
              unidade: row.parsed.unidade,
              preco: row.parsed.preco,
            },
          });
        }
      }
    }

    let created = 0;
    let updated = 0;
    let ignored = 0;

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const op of ops) {
          if (op.type === 'skip') {
            ignored++;
            continue;
          }
          if (op.type === 'create' && op.data) {
            await tx.produto.create({
              data: {
                tenantId,
                nome: op.data.nome,
                codigo: op.data.codigo ?? null,
                unidade: op.data.unidade ?? null,
                preco: op.data.preco ?? null,
              },
            });
            created++;
          }
          if (op.type === 'update' && op.id && op.data) {
            const r = await tx.produto.updateMany({
              where: { id: op.id, tenantId },
              data: {
                nome: op.data.nome,
                codigo: op.data.codigo ?? null,
                unidade: op.data.unidade ?? null,
                preco: op.data.preco ?? null,
              },
            });
            if (r.count !== 1) {
              throw new Error('Produto não encontrado para atualização.');
            }
            updated++;
          }
        }
      });
    } catch (e) {
      throw new UnprocessableEntityException(
        'Não foi possível concluir a importação. Nenhuma alteração foi aplicada.',
      );
    }

    return { created, updated, ignored };
  }
}
