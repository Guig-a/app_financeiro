# API — Financeiro

REST em **NestJS** com **Prisma** (PostgreSQL), autenticação JWT em **cookies httpOnly** (access + refresh com rotação).

## O que faz

Multi-tenant: pessoas, produtos, lançamentos, usuários e auth. Swagger em `/api-docs` em desenvolvimento.

## Variáveis de ambiente

Há um modelo em [`.env.example`](./.env.example). Crie `apps/api/.env`. Variáveis principais:

- `DATABASE_URL` — PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` — origem do front (ex.: `http://localhost:3001` em dev; em produção, URL pública HTTPS do Next)

Em produção com front noutro domínio, os cookies usam `SameSite=None` e `Secure` para o browser enviar credenciais nos pedidos cross-origin.

## Comandos (a partir da raiz do monorepo)

```bash
pnpm install
pnpm dev:api
```

Ou só neste pacote: `pnpm --filter @financeiro/api run start:dev`

Build: `pnpm turbo run build --filter=@financeiro/api`  
Produção: `start:prod` inclui `prisma db push` antes do processo (ver `package.json`).

## Testes e2e

Ver o [README do monorepo](../../README.md) — Postgres de teste e `pnpm test:e2e`.

## Mais detalhes

Documentação geral do projeto: [README na raiz do monorepo](../../README.md).
