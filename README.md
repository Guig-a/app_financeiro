# Financeiro Monorepo

Monorepo com backend NestJS e frontend Next.js.

## Estrutura

- `apps/api`: API NestJS (backend atual)
- `apps/web`: Frontend Next.js `15.5.x` com Tailwind e `@phosphor-icons/react`
- `packages/*`: espaço para pacotes compartilhados futuros

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker Desktop (opcional, para ambiente containerizado)

## Comandos principais

- Instalar dependências: `pnpm install`
- Build geral: `pnpm build`
- Lint geral: `pnpm lint`
- Testes backend e2e: `pnpm test:e2e`
- Dev API: `pnpm dev:api`
- Dev Web: `pnpm dev:web`

## Docker (API)

- Subir API: `pnpm docker:up`
- Parar containers: `pnpm docker:down`

O serviço da API expõe a porta `3000`.
