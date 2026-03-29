# Sistema Financeiro

Aqui é onde eu experimento. Sempre que descubro algo novo ou quero solidificar
um conceito, coloco nesse projeto.

Monorepo de um sistema financeiro **multi-tenant**: cada empresa (tenant) fica isolada, com papéis de usuário (RBAC), cadastro de pessoas e produtos, e lançamentos ligados a isso tudo. A ideia é ter uma base sólida no backend e uma interface web em cima.

---

## O que tem de tecnologia

| Camada | Stack |
|--------|--------|
| Backend | NestJS, Prisma, PostgreSQL |
| Auth | JWT (access + refresh com rotação), Argon2 |
| Frontend | Next.js 15, Tailwind, Phosphor Icons |
| Ferramentas | pnpm, Turborepo, Docker |

---

## Como o repo está organizado

- **`apps/api`** — API NestJS (REST, Swagger no dia a dia de dev).
- **`apps/web`** — frontend Next.js.
- **`packages/*`** — espaço pra código compartilhado no futuro.

---

## Antes de rodar

- Node.js **20+**
- **pnpm** 10+
- **Docker Desktop** — não é obrigatório pra desenvolver tudo, mas os testes e2e da API esperam um Postgres subindo via compose (e dá pra subir API/web em container também).

---

## Bora rodar local

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

A API fica em **http://localhost:3000**. O Next também quer a 3000 por padrão — se for rodar os dois ao mesmo tempo, ajusta a porta do front (por exemplo `next dev -p 3001` no script do `apps/web`).

Build e lint gerais:

```bash
pnpm build
pnpm lint
```

A API usa variáveis no `apps/api/.env` (por exemplo `DATABASE_URL`). Em produção você aponta pro Postgres de verdade; em dev, o que importa é ter uma URL válida pro Prisma.

---

## Testes (e2e da API)

Tem suite **e2e** com Jest + Supertest batendo na API de verdade, com banco Postgres parecido com o que você usaria em produção.

**O que entra na cobertura, em resumo:**

- **Auth** — registro, login, refresh com rotação (refresh velho não vale de novo), rate limit no login, logout que mata o refresh, JWT na rota protegida, e Argon2 com rehash quando os parâmetros de hash mudam.
- **Multi-tenant** — um token não mexe nos dados de outro tenant (pessoas, produtos, lançamentos).
- **RBAC e regras de negócio** — por exemplo, só perfil MASTER lista usuários; documento duplicado no mesmo tenant dá conflito; não dá pra apagar pessoa/produto com lançamentos ligados (com mensagem que mostra quantos são).

**Como rodar:**

1. Sobe o Postgres de teste (porta **5433** no host, espera o container ficar saudável):

   ```bash
   pnpm docker:postgres-e2e
   ```

2. Roda a suíte:

   ```bash
   pnpm test:e2e
   ```

O script usa `prisma db push --force-reset` — ou seja, **zera e recria** o schema no banco `financeiro_e2e`. É só pra dev/teste; não use esse banco pra dados que você queira guardar.

---

## Docker no dia a dia

| Comando | O que faz |
|---------|-----------|
| `pnpm docker:up` | Sobe API + web (e o que mais estiver no compose) com build |
| `pnpm docker:down` | Para e remove os containers do projeto |
| `pnpm docker:postgres-e2e` | Só o Postgres usado nos e2e (em background + wait no healthcheck) |

A API no compose costuma responder na **3000**. Pra parar só o Postgres de teste sem derrubar o resto:

```bash
docker compose stop postgres-e2e
```

---

MIT License — veja [LICENSE](./LICENSE) para detalhes.
