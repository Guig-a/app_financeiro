import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Conecta apenas se DATABASE_URL estiver configurado corretamente
    try {
      await this.$connect();
    } catch {
      console.warn(
        'Database connection failed. Make sure DATABASE_URL is configured correctly.',
      );
      // Não bloqueia a inicialização da aplicação
    }
  }
}
