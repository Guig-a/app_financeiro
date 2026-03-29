export type { SessionUser } from '@/shared/lib/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  cnpj?: string;
};
