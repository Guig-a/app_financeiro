import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';
import { FilterLancamentoDto } from './dto/filter-lancamento.dto';

@Injectable()
export class LancamentosRepository {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, data: CreateLancamentoDto) {
    return this.prisma.lancamento.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async update(id: string, tenantId: string, data: UpdateLancamentoDto) {
    const { count } = await this.prisma.lancamento.updateMany({
      where: { id, tenantId },
      data,
    });
    if (!count) return null;
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    const lancamento = await this.findById(id, tenantId);
    if (!lancamento) return null;
    await this.prisma.lancamento.delete({ where: { id } });
    return lancamento;
  }

  findById(id: string, tenantId: string) {
    return this.prisma.lancamento.findFirst({
      where: { id, tenantId },
      include: {
        pessoa: true,
        produto: true,
      },
    });
  }

  findAll(tenantId: string, filters: FilterLancamentoDto) {
    const { pessoaId, produtoId, tipo, inicio, fim } = filters;

    const where: any = { tenantId };

    if (pessoaId) where.pessoaId = pessoaId;
    if (produtoId) where.produtoId = produtoId;
    if (tipo) where.tipo = tipo;
    if (inicio || fim) {
      where.dataCompetencia = {};
      if (inicio) where.dataCompetencia.gte = new Date(inicio);
      if (fim) where.dataCompetencia.lte = new Date(fim);
    }

    return this.prisma.lancamento.findMany({
      where,
      orderBy: { dataCompetencia: 'desc' },
      include: {
        pessoa: {
          where: { tenantId },
        },
        produto: {
          where: { tenantId },
        },
      },
    });
  }

  existsPessoaInTenant(pessoaId: string, tenantId: string) {
    return this.prisma.pessoa.findFirst({
      where: { id: pessoaId, tenantId },
      select: { id: true },
    });
  }

  existsProdutoInTenant(produtoId: string, tenantId: string) {
    return this.prisma.produto.findFirst({
      where: { id: produtoId, tenantId },
      select: { id: true },
    });
  }
}
