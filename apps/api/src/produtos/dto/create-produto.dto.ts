import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  unidade?: string; // ex: UN, CX, KG

  @IsOptional()
  @IsNumber()
  preco?: number;
}
