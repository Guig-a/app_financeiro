import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/types/role';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersRepository {
  private readonly argonOptions: Readonly<argon2.Options> = {
    type: argon2.argon2id,
    memoryCost: Number(process.env.ARGON_MEMORY ?? 65536),
    timeCost: Number(process.env.ARGON_TIME ?? 3),
    parallelism: Number(process.env.ARGON_THREADS ?? 4),
  };

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateUserDto) {
    const senhaComPepper = this.passwordWithPepper(data.password);
    const hashed = await argon2.hash(senhaComPepper, this.argonOptions);

    return this.prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        passwordHash: hashed,
        role: data.role ?? Role.USER,
      },
    });
  }

  findById(id: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        tenant: { select: { name: true, slug: true } },
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
    });
  }

  async update(id: string, tenantId: string, data: UpdateUserDto) {
    const payload: {
      email?: string;
      role?: Role;
      passwordHash?: string;
    } = {};

    if (data.email !== undefined) payload.email = data.email;
    if (data.role !== undefined) payload.role = data.role;
    if (data.password !== undefined) {
      const senhaComPepper = this.passwordWithPepper(data.password);
      payload.passwordHash = await argon2.hash(
        senhaComPepper,
        this.argonOptions,
      );
    }

    const { count } = await this.prisma.user.updateMany({
      where: { id, tenantId },
      data: payload,
    });
    if (!count) return null;
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    const user = await this.findById(id, tenantId);
    if (!user) return null;
    await this.prisma.user.deleteMany({ where: { id, tenantId } });
    return user;
  }

  private passwordWithPepper(password: string): string {
    const pepper = process.env.PEPPER_SECRET ?? '';
    if (!pepper) return password;
    return crypto
      .createHmac('sha256', pepper)
      .update(password, 'utf8')
      .digest('hex');
  }
}
