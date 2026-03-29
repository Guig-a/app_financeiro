import { Injectable, NotFoundException } from '@nestjs/common';
import { ProdutosRepository } from './produtos.repository';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private repo: ProdutosRepository) {}

  create(tenantId: string, data: CreateProdutoDto) {
    return this.repo.create(tenantId, data);
  }

  findAll(tenantId: string) {
    return this.repo.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string) {
    const produto = await this.repo.findById(id, tenantId);
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async update(id: string, tenantId: string, data: UpdateProdutoDto) {
    const produto = await this.repo.update(id, tenantId, data);
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async remove(id: string, tenantId: string) {
    const produto = await this.repo.delete(id, tenantId);
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }
}
