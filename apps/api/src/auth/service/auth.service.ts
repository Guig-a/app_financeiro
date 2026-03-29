import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { Prisma, User } from '../../../prisma/generated/client';
import { Role } from '../../common/types/role';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const MAX_REFRESH_TOKENS_PER_USER = 5;

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer!: NodeJS.Timeout;

  private readonly argonOptions: Readonly<argon2.Options> = {
    type: argon2.argon2id,
    memoryCost: Number(process.env.ARGON_MEMORY ?? 65536),
    timeCost: Number(process.env.ARGON_TIME ?? 3),
    parallelism: Number(process.env.ARGON_THREADS ?? 4),
  };

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  onModuleInit() {
    this.cleanupExpiredRefreshTokens();
    this.cleanupTimer = setInterval(
      () => this.cleanupExpiredRefreshTokens(),
      REFRESH_CLEANUP_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
  }

  private async cleanupExpiredRefreshTokens() {
    await this.prisma.refreshToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {});
  }

  async register(data: RegisterDto) {
    if (!data.cpf && !data.cnpj) {
      throw new BadRequestException('CPF or CNPJ is required');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new BadRequestException('Email already registered');
    }

    const senhaComPepper = this.passwordWithPepper(data.password);
    const hashed = await argon2.hash(senhaComPepper, this.argonOptions);

    const user = await this.prisma.$transaction(async (tx) => {
      const slug = await this.generateUniqueTenantSlug(data.name, tx);
      const tenant = await tx.tenant.create({
        data: {
          slug,
          name: data.name,
          cpf: data.cpf,
          cnpj: data.cnpj,
        },
      });

      return tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          passwordHash: hashed,
          role: Role.MASTER,
        },
      });
    });

    return await this.generateTokens(user);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const senhaComPepper = this.passwordWithPepper(data.password);
    const ok = await argon2.verify(user.passwordHash, senhaComPepper);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (argon2.needsRehash(user.passwordHash, this.argonOptions)) {
      const newHash = await argon2.hash(senhaComPepper, this.argonOptions);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    return await this.generateTokens(user);
  }

  async refresh(userId: string, jti: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Invalid token');

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenId: jti, userId },
    });
    if (!stored) throw new UnauthorizedException('Token revoked or reused');
    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken
        .delete({ where: { id: stored.id } })
        .catch(() => {});
      throw new UnauthorizedException('Token expired');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return await this.generateTokens(user);
  }

  async logout(userId: string, jti: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, tokenId: jti },
    });
  }

  private getPepper(): string {
    return process.env.PEPPER_SECRET ?? '';
  }

  /** Exposto para testes e2e (rehash) usarem a mesma lógica da aplicação. */
  getPasswordWithPepper(password: string): string {
    return this.passwordWithPepper(password);
  }

  private passwordWithPepper(password: string): string {
    const pepper = this.getPepper();
    if (!pepper) return password;
    return crypto
      .createHmac('sha256', pepper)
      .update(password, 'utf8')
      .digest('hex');
  }

  private async generateUniqueTenantSlug(
    tenantName: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const baseSlug = this.slugify(tenantName);
    let slug = baseSlug;
    let suffix = 1;

    while (await tx.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    return slug;
  }

  private slugify(value: string): string {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const slug = normalized
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    if (slug) return slug;
    return `tenant-${crypto.randomUUID().slice(0, 8)}`;
  }

  private async enforceMaxSessionsPerUser(userId: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (tokens.length <= MAX_REFRESH_TOKENS_PER_USER) return;
    const toRemove = tokens.slice(MAX_REFRESH_TOKENS_PER_USER);
    await this.prisma.refreshToken.deleteMany({
      where: { id: { in: toRemove.map((t) => t.id) } },
    });
  }

  private async generateTokens(
    user: Pick<User, 'id' | 'tenantId' | 'email' | 'role'>,
  ) {
    const jti = crypto.randomUUID();
    const accessPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };
    const refreshPayload = { ...accessPayload, jti };

    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenId: jti, expiresAt },
    });

    await this.enforceMaxSessionsPerUser(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }
}
