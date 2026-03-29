import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as argon2 from 'argon2';
import { getStorageToken } from '@nestjs/throttler';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/service/auth.service';
import * as cookieParser from 'cookie-parser';

function resetThrottlerStorage(moduleRef: TestingModule) {
  const storage = moduleRef.get(getStorageToken());
  storage.storage.clear();
  const s = storage as { timeoutIds?: Map<string, NodeJS.Timeout[]> };
  if (s.timeoutIds) {
    s.timeoutIds.forEach((ids) => ids.forEach(clearTimeout));
    s.timeoutIds.clear();
  }
}

function extractCookie(
  setCookies: string | string[] | undefined,
  name: string,
): string {
  const cookies = Array.isArray(setCookies)
    ? setCookies
    : setCookies
      ? [setCookies]
      : [];
  const cookie = cookies.find((value) => value.startsWith(`${name}=`));
  if (!cookie) throw new Error(`Missing cookie: ${name}`);
  return cookie.split(';')[0];
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register - Criação de usuário', () => {
    it('deve criar tenant e usuário MASTER com dados válidos', async () => {
      const payload = {
        name: 'Empresa Teste',
        cnpj: `${Date.now()}`,
        email: `teste-${Date.now()}@example.com`,
        password: 'senha123',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      expect(
        extractCookie(res.headers['set-cookie'], 'access_token'),
      ).toContain('access_token=');
      expect(
        extractCookie(res.headers['set-cookie'], 'refresh_token'),
      ).toContain('refresh_token=');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        email: payload.email,
        role: 'MASTER',
      });
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('tenantId');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('deve rejeitar senha com menos de 6 caracteres', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Outra Empresa',
          cnpj: `${Date.now()}`,
          email: `outro-${Date.now()}@example.com`,
          password: '12345',
        })
        .expect(400);
    });

    it('deve rejeitar email inválido', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Teste',
          cnpj: `${Date.now()}`,
          email: 'email-invalido',
          password: 'senha123',
        })
        .expect(400);
    });

    it('deve ignorar campos extras (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Extra',
          cnpj: `${Date.now()}`,
          email: `extra-${Date.now()}@example.com`,
          password: 'senha123',
          role: 'admin',
        })
        .expect(201);

      expect(res.body.user).toHaveProperty('role', 'MASTER');
    });

    it('deve rejeitar email duplicado', async () => {
      const payload = {
        name: 'Empresa Primeiro',
        cnpj: `${Date.now()}`,
        email: `duplicado-${Date.now()}@example.com`,
        password: 'senha123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...payload, name: 'Empresa Segundo' })
        .expect(400);
    });
  });

  describe('Brute force', () => {
    it('deve retornar 429 na 11ª tentativa de login (rate limit)', async () => {
      const email = `ratelimit-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa RateLimit',
          cnpj: `${Date.now()}`,
          email,
          password: 'senha123',
        })
        .expect(201);

      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password: 'senhaerrada' })
          .expect(401);
      }

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'senhaerrada' })
        .expect(429);
    });

    it('deve responder 401 em múltiplas tentativas de login com senha errada', async () => {
      resetThrottlerStorage(moduleRef);
      const email = `brute-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Brute',
          cnpj: `${Date.now()}`,
          email,
          password: 'senha123',
        })
        .expect(201);

      for (let i = 0; i < 9; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password: 'senhaerrada' })
          .expect(401);
      }

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'senha123' })
        .expect(200);
    });
  });

  describe('Login', () => {
    const loginUser = {
      name: 'Empresa Login',
      cnpj: `${Date.now()}`,
      email: `login-${Date.now()}@example.com`,
      password: 'senha123',
    };

    beforeAll(async () => {
      resetThrottlerStorage(moduleRef);
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(loginUser)
        .expect(201);
    });

    it('deve fazer login com credenciais válidas', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: loginUser.email, password: loginUser.password })
        .expect(200);

      expect(
        extractCookie(res.headers['set-cookie'], 'access_token'),
      ).toContain('access_token=');
      expect(
        extractCookie(res.headers['set-cookie'], 'refresh_token'),
      ).toContain('refresh_token=');
      expect(res.body.user).toMatchObject({
        email: loginUser.email,
      });
      expect(res.body.user).toHaveProperty('tenantId');
      expect(res.body.user).toHaveProperty('role');
    });

    it('deve rejeitar senha errada', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: loginUser.email, password: 'senhaerrada' })
        .expect(401);
    });

    it('deve rejeitar usuário inexistente', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'naoexiste@example.com',
          password: 'senha123',
        })
        .expect(401);
    });
  });

  describe('Refresh token', () => {
    let refreshCookie: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Refresh',
          cnpj: `${Date.now()}`,
          email: `refresh-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .expect(201);
      refreshCookie = extractCookie(res.headers['set-cookie'], 'refresh_token');
    });

    it('deve renovar tokens com refresh válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(
        extractCookie(res.headers['set-cookie'], 'access_token'),
      ).toContain('access_token=');
      expect(
        extractCookie(res.headers['set-cookie'], 'refresh_token'),
      ).toContain('refresh_token=');
    });

    it('deve rejeitar refresh inválido', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=token-invalido')
        .expect(401);
    });

    it('deve rejeitar refresh token reutilizado (rotação)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Rotation',
          cnpj: `${Date.now()}`,
          email: `rotation-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .expect(201);
      const oldRefresh = extractCookie(
        res.headers['set-cookie'],
        'refresh_token',
      );
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', oldRefresh)
        .expect(200);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', oldRefresh)
        .expect(401);
    });

    it('logout revoga o refresh token (logout real)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Logout',
          cnpj: `${Date.now()}`,
          email: `logout-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .expect(201);
      const refresh = extractCookie(res.headers['set-cookie'], 'refresh_token');
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', refresh)
        .expect(200);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refresh)
        .expect(401);
    });
  });

  describe('Rota protegida (GET /users/me)', () => {
    let accessCookie: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Profile',
          cnpj: `${Date.now()}`,
          email: `profile-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .expect(201);
      accessCookie = extractCookie(res.headers['set-cookie'], 'access_token');
    });

    it('deve retornar perfil com token válido', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', accessCookie)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('tenantId');
      expect(res.body).toHaveProperty('role');
      expect(res.body.tenant).toMatchObject({
        name: expect.any(String),
        slug: expect.any(String),
      });
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('deve rejeitar token inválido', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', 'access_token=token-invalido')
        .expect(401);
    });

    it('deve rejeitar requisição sem token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('deve rejeitar access token expirado', async () => {
      const jwt = moduleRef.get(JwtService);
      const expiredToken = jwt.sign(
        {
          sub: 'user-id',
          email: 'any@example.com',
          tenantId: 'tenant-id',
          role: 'MASTER',
        },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '0s' },
      );
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', `access_token=${expiredToken}`)
        .expect(401);
    });
  });

  describe('Rehash (Argon2 needsRehash)', () => {
    it('deve rehashar senha no login quando parâmetros mudaram', async () => {
      resetThrottlerStorage(moduleRef);
      const email = `rehash-${Date.now()}@example.com`;
      const password = 'senha123';
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Empresa Rehash',
          cnpj: `${Date.now()}`,
          email,
          password,
        })
        .expect(201);
      const userId = registerRes.body.user.id;

      const authService = moduleRef.get(AuthService);
      const senhaComPepper = authService.getPasswordWithPepper(password);
      const hashAntigo = await argon2.hash(senhaComPepper, {
        type: argon2.argon2id,
        memoryCost: 32768,
        timeCost: 2,
        parallelism: 2,
      });

      const prisma = moduleRef.get(PrismaService);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashAntigo },
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      const userAfter = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(userAfter).not.toBeNull();
      expect(userAfter?.passwordHash).toMatch(/\$m=65536,/);
    });
  });
});
