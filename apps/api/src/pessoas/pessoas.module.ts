import { Module } from '@nestjs/common';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { PessoasRepository } from './pessoas.repository';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PessoasController],
  providers: [PessoasService, PessoasRepository],
  exports: [PessoasService],
})
export class PessoasModule {}
