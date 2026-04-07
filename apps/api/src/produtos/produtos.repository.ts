import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosRepository {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, data: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.produto.findMany({
      where: { tenantId },
    });
  }

  findById(id: string, tenantId: string) {
    return this.prisma.produto.findFirst({ where: { id, tenantId } });
  }

  countLancamentosVinculados(produtoId: string, tenantId: string) {
    return this.prisma.lancamento.count({
      where: { tenantId, produtoId },
    });
  }

  findByCodigo(codigo: string, tenantId: string) {
    return this.prisma.produto.findFirst({ where: { codigo, tenantId } });
  }

  findManyByCodigos(tenantId: string, codigos: string[]) {
    if (codigos.length === 0) return Promise.resolve([]);
    return this.prisma.produto.findMany({
      where: { tenantId, codigo: { in: codigos } },
    });
  }

  async update(id: string, tenantId: string, data: UpdateProdutoDto) {
    const { count } = await this.prisma.produto.updateMany({
      where: { id, tenantId },
      data,
    });
    if (!count) return null;
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    const produto = await this.findById(id, tenantId);
    if (!produto) return null;
    await this.prisma.produto.deleteMany({ where: { id, tenantId } });
    return produto;
  }

  createMany(tenantId: string, produtos: CreateProdutoDto[]) {
    // SQLite não suporta skipDuplicates, então fazemos inserções individuais
    return Promise.all(
      produtos.map((produto) =>
        this.create(tenantId, produto).catch(() => null),
      ),
    ).then((results) => ({
      count: results.filter((r) => r !== null).length,
    }));
  }
}
