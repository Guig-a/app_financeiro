import { Module } from '@nestjs/common';
import { LancamentosController } from './lancamentos.controller';
import { LancamentosService } from './lancamentos.service';
import { LancamentosRepository } from './lancamentos.repository';

import { PrismaModule } from '../database/prisma.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { ProdutosModule } from '../produtos/produtos.module';

@Module({
  imports: [PrismaModule, PessoasModule, ProdutosModule],
  controllers: [LancamentosController],
  providers: [LancamentosService, LancamentosRepository],
})
export class LancamentosModule {}
