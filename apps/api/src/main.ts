import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3001';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Financeiro App API')
    .setDescription(
      [
        'API multi-tenant: lançamentos, pessoas, produtos, usuários e autenticação.',
        '',
        'Autenticação (web): após POST /auth/login ou /auth/register, o access token vai em cookie httpOnly access_token (path /); o refresh em refresh_token (path /auth). O Passport lê o JWT do cookie.',
        'Produção (origens diferentes): cookies SameSite=None e Secure; CORS com credenciais.',
        '',
        'No Swagger UI: Authorize → JWT-auth (Bearer no header) ou cookie-access (valor do token no cookie access_token).',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description:
          'JWT no header (útil para testes). No browser, o fluxo normal usa cookie.',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'Mesmo valor do access token (fluxo cookie).',
      },
      'cookie-access',
    )
    .addTag('auth', 'Autenticação e autorização')
    .addTag('health', 'Disponibilidade do serviço')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('pessoas', 'Clientes e fornecedores')
    .addTag('produtos', 'Cadastro de produtos')
    .addTag('lancamentos', 'Lançamentos financeiros')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
