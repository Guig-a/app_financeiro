import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UnidadeProduto } from '../../../prisma/generated/client';

export { UnidadeProduto };

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsEnum(UnidadeProduto)
  unidade?: UnidadeProduto;

  @IsOptional()
  @IsNumber()
  preco?: number;
}
