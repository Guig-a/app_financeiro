import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TipoPessoa {
  CLIENTE = 'CLIENTE',
  FORNECEDOR = 'FORNECEDOR',
  AMBOS = 'AMBOS',
}

export class CreatePessoaDto {
  @IsString()
  nome: string;

  @IsEnum(TipoPessoa)
  tipo: TipoPessoa;

  @IsOptional()
  @IsString()
  documento?: string; // CPF/CNPJ
}
