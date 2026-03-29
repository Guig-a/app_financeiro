import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}

  async create(
    currentUser: { tenantId: string; role: string },
    data: CreateUserDto,
  ) {
    if (currentUser.role !== 'MASTER') {
      throw new ForbiddenException('Only MASTER can create users');
    }
    return this.repo.create(currentUser.tenantId, data);
  }

  async findAll(tenantId: string) {
    return this.repo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const user = await this.repo.findById(id, tenantId);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }

  async update(
    currentUser: { tenantId: string; role: string },
    id: string,
    data: UpdateUserDto,
  ) {
    if (currentUser.role !== 'MASTER') {
      throw new ForbiddenException('Only MASTER can update users');
    }
    const user = await this.repo.update(id, currentUser.tenantId, data);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }

  async remove(currentUser: { tenantId: string; role: string }, id: string) {
    if (currentUser.role !== 'MASTER') {
      throw new ForbiddenException('Only MASTER can delete users');
    }
    const user = await this.repo.delete(id, currentUser.tenantId);
    if (!user) throw new NotFoundException('User not found');
    const rest = { ...user };
    delete rest.passwordHash;
    return rest;
  }
}
