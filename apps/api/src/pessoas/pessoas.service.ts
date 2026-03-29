import { Injectable, NotFoundException } from '@nestjs/common';
import { PessoasRepository } from './pessoas.repository';
import { CreatePessoaDto, TipoPessoa } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(private repo: PessoasRepository) {}

  create(tenantId: string, data: CreatePessoaDto) {
    return this.repo.create(tenantId, data);
  }

  findAll(tenantId: string, tipo?: TipoPessoa) {
    return this.repo.findAll(tenantId, tipo);
  }

  async findOne(id: string, tenantId: string) {
    const pessoa = await this.repo.findById(id, tenantId);
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return pessoa;
  }

  async update(id: string, tenantId: string, data: UpdatePessoaDto) {
    const pessoa = await this.repo.update(id, tenantId, data);
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return pessoa;
  }

  async remove(id: string, tenantId: string) {
    const pessoa = await this.repo.delete(id, tenantId);
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return pessoa;
  }
}
