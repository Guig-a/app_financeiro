import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/module/auth.module';
import { UsersModule } from '../users/users.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { ProdutosModule } from '../produtos/produtos.module';
import { LancamentosModule } from '../lancamentos/lancamentos.module';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_ACCESS_SECRET)
          throw new Error('JWT_ACCESS_SECRET is required');
        if (!config.JWT_REFRESH_SECRET)
          throw new Error('JWT_REFRESH_SECRET is required');
        if (!config.DATABASE_URL) throw new Error('DATABASE_URL is required');
        return config as Record<string, unknown>;
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 10000, limit: 10 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PessoasModule,
    ProdutosModule,
    LancamentosModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
