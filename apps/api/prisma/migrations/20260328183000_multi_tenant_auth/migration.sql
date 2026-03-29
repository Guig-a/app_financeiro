PRAGMA foreign_keys=OFF;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Keep deterministic mapping while migrating existing users
CREATE TABLE "_UserTenantMap" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL
);

INSERT INTO "_UserTenantMap" ("userId", "tenantId")
SELECT "id", lower(hex(randomblob(16)))
FROM "User";

INSERT INTO "Tenant" ("id", "slug", "name", "createdAt")
SELECT
    m."tenantId",
    'tenant-' || substr(u."id", 1, 8),
    u."name",
    u."createdAt"
FROM "User" u
JOIN "_UserTenantMap" m ON m."userId" = u."id";

-- RedefineTables
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_User" ("id", "tenantId", "email", "passwordHash", "role", "createdAt")
SELECT
    u."id",
    m."tenantId",
    u."email",
    u."password",
    'MASTER',
    u."createdAt"
FROM "User" u
JOIN "_UserTenantMap" m ON m."userId" = u."id";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
DROP TABLE "_UserTenantMap";

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
