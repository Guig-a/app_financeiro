import type { Role } from './role';

/** Usuário autenticado (JWT / Passport). */
export type AuthenticatedUser = {
  userId: string;
  email: string;
  tenantId: string;
  role: Role;
};
