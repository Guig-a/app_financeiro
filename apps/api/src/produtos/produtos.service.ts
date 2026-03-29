import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/client';
import { ProdutosRepository } from './produtos.repository';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { decimalToNumber } from '../common/utils/prisma-json';

@Injectable()
export class ProdutosService {
  constructor(private repo: ProdutosRepository) {}

  private mapProdutoJson<T extends { preco: unknown }>(p: T) {
    return {
      ...p,
      preco: decimalToNumber(p.preco),
    };
  }

  create(tenantId: string, data: CreateProdutoDto) {
    return this.repo.create(tenantId, data).then((p) => this.mapProdutoJson(p));
  }

  findAll(tenantId: string) {
    return this.repo
      .findAll(tenantId)
      .then((list) => list.map((p) => this.mapProdutoJson(p)));
  }

  async findOne(id: string, tenantId: string) {
    const produto = await this.repo.findById(id, tenantId);
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return this.mapProdutoJson(produto);
  }

  async update(id: string, tenantId: string, data: UpdateProdutoDto) {
    const produto = await this.repo.update(id, tenantId, data);
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return this.mapProdutoJson(produto);
  }

  async remove(id: string, tenantId: string) {
    const vinculos = await this.repo.countLancamentosVinculados(id, tenantId);
    if (vinculos > 0) {
      throw new ConflictException(
        `Não é possível excluir: existem ${vinculos} lançamento(s) vinculados a este produto. Exclua-os antes.`,
      );
    }
    try {
      const produto = await this.repo.delete(id, tenantId);
      if (!produto) throw new NotFoundException('Produto não encontrado');
      return this.mapProdutoJson(produto);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir: existem lançamentos vinculados a este produto.',
        );
      }
      throw e;
    }
  }
}
