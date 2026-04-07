# Web — Financeiro

Interface em **Next.js 15** (App Router), **Tailwind** e chamadas à API com **axios** (`withCredentials`).

## O que faz

Área autenticada (dashboard, lançamentos, pessoas, produtos, usuários MASTER), login e registo. A sessão fica nos **cookies do domínio da API**; em produção front e API costumam ser URLs diferentes.

## Variáveis de ambiente

Exemplos para `apps/web/.env.local`:

- `NEXT_PUBLIC_API_URL` — URL **pública** da API (HTTPS em produção), usada no browser
- `INTERNAL_API_URL` (opcional) — URL interna da API para pedidos no servidor Next (ex.: rede privada); se não existir, usa `NEXT_PUBLIC_API_URL`

## Comandos (a partir da raiz do monorepo)

```bash
pnpm install
pnpm dev:web
```

Ou: `pnpm --filter @financeiro/web run dev`  
O Next usa a porta **3000**; se a API também estiver na 3000, ajusta a porta do web (ex. `-p 3001` no script) ou a API.

Build: `pnpm turbo run build --filter=@financeiro/web`

## Mais detalhes

Visão geral do monorepo, Docker e deploy: [README na raiz](../../README.md).
