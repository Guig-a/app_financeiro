import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/types/role';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}

  async create(currentUser: Pick<AuthenticatedUser, 'tenantId' | 'role'>, data: CreateUserDto) {
    if (currentUser.role !== Role.MASTER) {
      throw new ForbiddenException('Only MASTER can create users');
    }
    return this.repo.create(currentUser.tenantId, data);
  }

  async findAll(currentUser: Pick<AuthenticatedUser, 'tenantId' | 'role'>) {
    if (currentUser.role !== Role.MASTER) {
      throw new ForbiddenException('Only MASTER can list users');
    }
    return this.repo.findAll(currentUser.tenantId);
  }

  async findById(id: string, tenantId: string) {
    const user = await this.repo.findById(id, tenantId);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }

  async update(
    currentUser: Pick<AuthenticatedUser, 'tenantId' | 'role'>,
    id: string,
    data: UpdateUserDto,
  ) {
    if (currentUser.role !== Role.MASTER) {
      throw new ForbiddenException('Only MASTER can update users');
    }
    const user = await this.repo.update(id, currentUser.tenantId, data);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }

  async remove(currentUser: Pick<AuthenticatedUser, 'tenantId' | 'role'>, id: string) {
    if (currentUser.role !== Role.MASTER) {
      throw new ForbiddenException('Only MASTER can delete users');
    }
    const user = await this.repo.delete(id, currentUser.tenantId);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }
}
