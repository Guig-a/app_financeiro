import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePessoaDto, TipoPessoa } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasRepository {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, data: CreatePessoaDto) {
    return this.prisma.pessoa.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  findAll(tenantId: string, tipo?: TipoPessoa) {
    return this.prisma.pessoa.findMany({
      where: {
        tenantId,
        ...(tipo ? { tipo } : {}),
      },
    });
  }

  findById(id: string, tenantId: string) {
    return this.prisma.pessoa.findFirst({ where: { id, tenantId } });
  }

  countLancamentosVinculados(pessoaId: string, tenantId: string) {
    return this.prisma.lancamento.count({
      where: { tenantId, pessoaId },
    });
  }

  async update(id: string, tenantId: string, data: UpdatePessoaDto) {
    const { count } = await this.prisma.pessoa.updateMany({
      where: { id, tenantId },
      data,
    });
    if (!count) return null;
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    const pessoa = await this.findById(id, tenantId);
    if (!pessoa) return null;
    await this.prisma.pessoa.deleteMany({ where: { id, tenantId } });
    return pessoa;
  }
}
