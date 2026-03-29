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

export type SessionUser = {
  id: string;
  email: string;
  tenantId: string;
  role: string;
};
