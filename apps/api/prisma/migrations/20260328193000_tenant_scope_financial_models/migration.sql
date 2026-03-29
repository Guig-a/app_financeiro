PRAGMA foreign_keys=OFF;

CREATE TABLE "_DefaultTenant" (
    "tenantId" TEXT NOT NULL PRIMARY KEY
);

INSERT INTO "_DefaultTenant" ("tenantId")
SELECT "tenantId"
FROM "User"
ORDER BY "createdAt"
LIMIT 1;

INSERT INTO "Tenant" ("id", "slug", "name", "createdAt")
SELECT lower(hex(randomblob(16))), 'sistema', 'Sistema', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "_DefaultTenant")
  AND NOT EXISTS (SELECT 1 FROM "Tenant" WHERE "slug" = 'sistema');

INSERT INTO "_DefaultTenant" ("tenantId")
SELECT "id"
FROM "Tenant"
WHERE NOT EXISTS (SELECT 1 FROM "_DefaultTenant")
ORDER BY "createdAt"
LIMIT 1;

-- RedefineTables
CREATE TABLE "new_Pessoa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "documento" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pessoa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Pessoa" ("id", "tenantId", "nome", "tipo", "documento", "createdAt")
SELECT
    p."id",
    (SELECT "tenantId" FROM "_DefaultTenant" LIMIT 1),
    p."nome",
    p."tipo",
    p."documento",
    p."createdAt"
FROM "Pessoa" p;

DROP TABLE "Pessoa";
ALTER TABLE "new_Pessoa" RENAME TO "Pessoa";

CREATE TABLE "new_Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "unidade" TEXT,
    "preco" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Produto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Produto" ("id", "tenantId", "nome", "codigo", "unidade", "preco", "createdAt")
SELECT
    p."id",
    (SELECT "tenantId" FROM "_DefaultTenant" LIMIT 1),
    p."nome",
    p."codigo",
    p."unidade",
    p."preco",
    p."createdAt"
FROM "Produto" p;

DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";

CREATE TABLE "new_Lancamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "descricao" TEXT,
    "pessoaId" TEXT,
    "produtoId" TEXT,
    "valor" REAL NOT NULL,
    "dataCompetencia" DATETIME NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "dataQuitacao" DATETIME,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lancamento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Lancamento" ("id", "tenantId", "descricao", "pessoaId", "produtoId", "valor", "dataCompetencia", "dataVencimento", "dataQuitacao", "tipo", "createdAt")
SELECT
    l."id",
    (SELECT "tenantId" FROM "_DefaultTenant" LIMIT 1),
    l."descricao",
    l."pessoaId",
    l."produtoId",
    l."valor",
    l."dataCompetencia",
    l."dataVencimento",
    l."dataQuitacao",
    l."tipo",
    l."createdAt"
FROM "Lancamento" l;

DROP TABLE "Lancamento";
ALTER TABLE "new_Lancamento" RENAME TO "Lancamento";

DROP TABLE "_DefaultTenant";

-- CreateIndex
CREATE INDEX "Pessoa_tenantId_idx" ON "Pessoa"("tenantId");

-- CreateIndex
CREATE INDEX "Produto_tenantId_idx" ON "Produto"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_tenantId_codigo_key" ON "Produto"("tenantId", "codigo");

-- CreateIndex
CREATE INDEX "Lancamento_tenantId_idx" ON "Lancamento"("tenantId");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
