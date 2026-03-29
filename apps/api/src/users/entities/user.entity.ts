import type { Role } from '../../common/types/role';

export class UserEntity {
  id: string;
  tenantId: string;
  email: string;
  role: Role;
  createdAt: Date;
}
