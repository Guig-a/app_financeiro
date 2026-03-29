import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { ProdutosRepository } from './produtos.repository';

import { ProdutosImportService } from './import/produtos-import.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProdutosController],
  providers: [ProdutosService, ProdutosRepository, ProdutosImportService],
  exports: [ProdutosService],
})
export class ProdutosModule {}
