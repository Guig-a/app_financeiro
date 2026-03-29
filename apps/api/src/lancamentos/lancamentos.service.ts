import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LancamentosRepository } from './lancamentos.repository';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';
import { FilterLancamentoDto } from './dto/filter-lancamento.dto';
import { calcularStatus } from './rules/status-calculator';
import { decimalToNumber } from '../common/utils/prisma-json';
import type { Lancamento as LancamentoRow } from '../../prisma/generated/client';

@Injectable()
export class LancamentosService {
  constructor(private repo: LancamentosRepository) {}

  private normalizeDateTime(value?: string) {
    if (!value) return value;
    return value.includes('T') ? value : `${value}T00:00:00.000Z`;
  }

  private mapLancamentoJson(
    lanc: LancamentoRow & {
      pessoa?: unknown;
      produto?: {
        preco: unknown;
        [key: string]: unknown;
      } | null;
    },
  ) {
    return {
      ...lanc,
      valor: decimalToNumber(lanc.valor) ?? 0,
      produto: lanc.produto
        ? {
            ...lanc.produto,
            preco: decimalToNumber(lanc.produto.preco),
          }
        : null,
    };
  }

  async create(tenantId: string, data: CreateLancamentoDto) {
    await this.ensureReferencesInTenant(
      tenantId,
      data.pessoaId,
      data.produtoId,
    );
    const lanc = await this.repo.create(tenantId, {
      ...data,
      dataCompetencia: this.normalizeDateTime(data.dataCompetencia)!,
      dataVencimento: this.normalizeDateTime(data.dataVencimento)!,
      dataQuitacao: this.normalizeDateTime(data.dataQuitacao),
    });
    const json = this.mapLancamentoJson(lanc);
    return {
      ...json,
      status: calcularStatus(lanc.dataVencimento, lanc.dataQuitacao),
    };
  }

  async findAll(tenantId: string, filters: FilterLancamentoDto) {
    const list = await this.repo.findAll(tenantId, filters);

    return list.map((lanc) => ({
      ...this.mapLancamentoJson(lanc),
      status: calcularStatus(lanc.dataVencimento, lanc.dataQuitacao),
    }));
  }

  async findOne(id: string, tenantId: string) {
    const lanc = await this.repo.findById(id, tenantId);
    if (!lanc) throw new NotFoundException('Lançamento não encontrado');

    return {
      ...this.mapLancamentoJson(lanc),
      status: calcularStatus(lanc.dataVencimento, lanc.dataQuitacao),
    };
  }

  async update(id: string, tenantId: string, data: UpdateLancamentoDto) {
    await this.ensureReferencesInTenant(
      tenantId,
      data.pessoaId,
      data.produtoId,
    );
    const patch = {
      ...data,
      dataCompetencia: this.normalizeDateTime(data.dataCompetencia),
      dataVencimento: this.normalizeDateTime(data.dataVencimento),
      dataQuitacao: this.normalizeDateTime(data.dataQuitacao),
    };
    const lanc = await this.repo.update(id, tenantId, patch);
    if (!lanc) throw new NotFoundException('Lançamento não encontrado');
    const json = this.mapLancamentoJson(lanc);
    return {
      ...json,
      status: calcularStatus(lanc.dataVencimento, lanc.dataQuitacao),
    };
  }

  async remove(id: string, tenantId: string) {
    const lanc = await this.repo.delete(id, tenantId);
    if (!lanc) throw new NotFoundException('Lançamento não encontrado');
    return this.mapLancamentoJson(lanc);
  }

  private async ensureReferencesInTenant(
    tenantId: string,
    pessoaId?: string,
    produtoId?: string,
  ) {
    if (pessoaId) {
      const pessoa = await this.repo.existsPessoaInTenant(pessoaId, tenantId);
      if (!pessoa) {
        throw new BadRequestException('Pessoa inválida para este tenant');
      }
    }

    if (produtoId) {
      const produto = await this.repo.existsProdutoInTenant(
        produtoId,
        tenantId,
      );
      if (!produto) {
        throw new BadRequestException('Produto inválido para este tenant');
      }
    }
  }
}
