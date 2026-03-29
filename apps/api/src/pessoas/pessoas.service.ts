import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/client';
import { PessoasRepository } from './pessoas.repository';
import { CreatePessoaDto, TipoPessoa } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(private repo: PessoasRepository) {}

  /** Evita string vazia no banco; duplicidade só é checada quando há documento. */
  private normalizeDocumento(documento?: string): string | undefined {
    const t = documento?.trim();
    return t ? t : undefined;
  }

  async create(tenantId: string, data: CreatePessoaDto) {
    const payload = {
      ...data,
      documento: this.normalizeDocumento(data.documento),
    };
    try {
      return await this.repo.create(tenantId, payload);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe uma pessoa com este documento nesta organização.',
        );
      }
      throw e;
    }
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
    const payload: UpdatePessoaDto = { ...data };
    if (data.documento !== undefined) {
      payload.documento = this.normalizeDocumento(data.documento);
    }
    try {
      const pessoa = await this.repo.update(id, tenantId, payload);
      if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
      return pessoa;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe uma pessoa com este documento nesta organização.',
        );
      }
      throw e;
    }
  }

  async remove(id: string, tenantId: string) {
    const vinculos = await this.repo.countLancamentosVinculados(id, tenantId);
    if (vinculos > 0) {
      throw new ConflictException(
        `Não é possível excluir: existem ${vinculos} lançamento(s) vinculados a esta pessoa. Exclua-os antes.`,
      );
    }
    try {
      const pessoa = await this.repo.delete(id, tenantId);
      if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
      return pessoa;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir: existem lançamentos vinculados a esta pessoa.',
        );
      }
      throw e;
    }
  }
}
