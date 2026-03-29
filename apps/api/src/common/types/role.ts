/**
 * Papel do usuário no tenant.
 * SQLite não suporta `enum` no schema Prisma aqui; o campo `User.role` permanece string no banco.
 */
export const Role = {
  MASTER: 'MASTER',
  USER: 'USER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
