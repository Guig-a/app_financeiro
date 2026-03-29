import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoPessoa } from '../../../prisma/generated/client';

export { TipoPessoa };

export class CreatePessoaDto {
  @IsString()
  nome: string;

  @IsEnum(TipoPessoa)
  tipo: TipoPessoa;

  @IsOptional()
  @IsString()
  documento?: string;
}
