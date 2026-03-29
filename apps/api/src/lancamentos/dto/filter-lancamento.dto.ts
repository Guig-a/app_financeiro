import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoLancamento } from './create-lancamento.dto';

export class FilterLancamentoDto {
  @IsOptional()
  @IsString()
  pessoaId?: string;

  @IsOptional()
  @IsString()
  produtoId?: string;

  @IsOptional()
  @IsEnum(TipoLancamento)
  tipo?: TipoLancamento;

  @IsOptional()
  @IsDateString()
  inicio?: string;

  @IsOptional()
  @IsDateString()
  fim?: string;
}
