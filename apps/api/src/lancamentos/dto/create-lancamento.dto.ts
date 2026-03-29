import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TipoLancamento {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export class CreateLancamentoDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  pessoaId?: string;

  @IsOptional()
  @IsString()
  produtoId?: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  dataCompetencia: string;

  @IsDateString()
  dataVencimento: string;

  @IsOptional()
  @IsDateString()
  dataQuitacao?: string;

  @IsEnum(TipoLancamento)
  tipo: TipoLancamento;
}
