export type Usuario = {
  id: string;
  email: string;
  role: 'MASTER' | 'USER';
  tenantId: string;
};

export type UsuarioPayload = {
  email: string;
  password?: string;
  role?: 'MASTER' | 'USER';
};
