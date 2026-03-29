import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as cookieParser from 'cookie-parser';

type AuthSession = {
  accessCookie: string;
  tenantId: string;
  userId: string;
  email: string;
};

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

describe('RBAC e restrições de negócio (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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

  async function registerTenant(prefix: string): Promise<AuthSession> {
    const payload = {
      name: `Empresa ${prefix}`,
      cnpj: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      email: `${prefix.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}@example.com`,
      password: 'senha123',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    return {
      accessCookie: extractCookie(res.headers['set-cookie'], 'access_token'),
      tenantId: res.body.user.tenantId,
      userId: res.body.user.id,
      email: payload.email,
    };
  }

  describe('GET /users', () => {
    it('MASTER lista usuários com 200', async () => {
      const master = await registerTenant('UsersMaster');
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', master.accessCookie)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.some((u: { id: string }) => u.id === master.userId)).toBe(
        true,
      );
    });

    it('USER recebe 403 ao listar usuários', async () => {
      const master = await registerTenant('Users403');
      const subEmail = `subuser-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', master.accessCookie)
        .send({
          email: subEmail,
          password: 'senha123',
          role: 'USER',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: subEmail, password: 'senha123' })
        .expect(200);

      const userCookie = extractCookie(
        loginRes.headers['set-cookie'],
        'access_token',
      );

      await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', userCookie)
        .expect(403);
    });
  });

  describe('Pessoa — documento duplicado no tenant', () => {
    it('deve retornar 409 ao cadastrar o mesmo documento duas vezes no mesmo tenant', async () => {
      const s = await registerTenant('DocDup');
      const doc = `doc-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', s.accessCookie)
        .send({
          nome: 'Primeiro',
          tipo: 'CLIENTE',
          documento: doc,
        })
        .expect(201);

      const dup = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', s.accessCookie)
        .send({
          nome: 'Segundo mesmo documento',
          tipo: 'FORNECEDOR',
          documento: doc,
        })
        .expect(409);

      expect(dup.body).toHaveProperty('message');
      expect(String(dup.body.message)).toMatch(/documento|organização/i);
    });

    it('deve permitir o mesmo documento em tenants diferentes', async () => {
      const a = await registerTenant('DocA');
      const b = await registerTenant('DocB');
      const doc = `shared-doc-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', a.accessCookie)
        .send({
          nome: 'Pessoa A',
          tipo: 'CLIENTE',
          documento: doc,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', b.accessCookie)
        .send({
          nome: 'Pessoa B',
          tipo: 'CLIENTE',
          documento: doc,
        })
        .expect(201);
    });
  });

  describe('Exclusão bloqueada por lançamentos (409 + contagem)', () => {
    async function criarLancamento(
      cookie: string,
      body: Record<string, unknown>,
    ) {
      return request(app.getHttpServer())
        .post('/lancamentos')
        .set('Cookie', cookie)
        .send(body)
        .expect(201);
    }

    it('DELETE pessoa com 1 lançamento vinculado → 409 e mensagem com contagem', async () => {
      const s = await registerTenant('DelPessoa1');
      const pessoa = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', s.accessCookie)
        .send({ nome: 'Cliente X', tipo: 'CLIENTE' })
        .expect(201);

      await criarLancamento(s.accessCookie, {
        descricao: 'L1',
        pessoaId: pessoa.body.id,
        valor: 100,
        dataCompetencia: '2026-05-01T00:00:00.000Z',
        dataVencimento: '2026-05-10T00:00:00.000Z',
        tipo: 'DESPESA',
      });

      const del = await request(app.getHttpServer())
        .delete(`/pessoas/${pessoa.body.id}`)
        .set('Cookie', s.accessCookie)
        .expect(409);

      expect(del.body.message).toMatch(/1/);
      expect(del.body.message).toMatch(/lançamento/i);
    });

    it('DELETE pessoa com 2 lançamentos → mensagem com contagem 2', async () => {
      const s = await registerTenant('DelPessoa2');
      const pessoa = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', s.accessCookie)
        .send({ nome: 'Cliente Y', tipo: 'CLIENTE' })
        .expect(201);

      await criarLancamento(s.accessCookie, {
        descricao: 'A',
        pessoaId: pessoa.body.id,
        valor: 50,
        dataCompetencia: '2026-06-01T00:00:00.000Z',
        dataVencimento: '2026-06-05T00:00:00.000Z',
        tipo: 'RECEITA',
      });
      await criarLancamento(s.accessCookie, {
        descricao: 'B',
        pessoaId: pessoa.body.id,
        valor: 75,
        dataCompetencia: '2026-06-02T00:00:00.000Z',
        dataVencimento: '2026-06-06T00:00:00.000Z',
        tipo: 'DESPESA',
      });

      const del = await request(app.getHttpServer())
        .delete(`/pessoas/${pessoa.body.id}`)
        .set('Cookie', s.accessCookie)
        .expect(409);

      expect(del.body.message).toMatch(/2/);
    });

    it('DELETE produto com lançamentos vinculados → 409 e mensagem com contagem', async () => {
      const s = await registerTenant('DelProd');
      const produto = await request(app.getHttpServer())
        .post('/produtos')
        .set('Cookie', s.accessCookie)
        .send({
          nome: 'Item Z',
          codigo: `SKU-DEL-${Date.now()}`,
          unidade: 'UN',
          preco: 9.99,
        })
        .expect(201);

      await criarLancamento(s.accessCookie, {
        descricao: 'Com produto',
        produtoId: produto.body.id,
        valor: 200,
        dataCompetencia: '2026-07-01T00:00:00.000Z',
        dataVencimento: '2026-07-15T00:00:00.000Z',
        tipo: 'DESPESA',
      });

      const del = await request(app.getHttpServer())
        .delete(`/produtos/${produto.body.id}`)
        .set('Cookie', s.accessCookie)
        .expect(409);

      expect(del.body.message).toMatch(/1/);
      expect(del.body.message).toMatch(/lançamento/i);
    });

    it('após excluir lançamentos, DELETE pessoa deve retornar 200', async () => {
      const s = await registerTenant('DelPessoaOk');
      const pessoa = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', s.accessCookie)
        .send({ nome: 'Só temporário', tipo: 'CLIENTE' })
        .expect(201);

      const lanc = await criarLancamento(s.accessCookie, {
        descricao: 'Temp',
        pessoaId: pessoa.body.id,
        valor: 10,
        dataCompetencia: '2026-08-01T00:00:00.000Z',
        dataVencimento: '2026-08-05T00:00:00.000Z',
        tipo: 'DESPESA',
      });

      await request(app.getHttpServer())
        .delete(`/lancamentos/${lanc.body.id}`)
        .set('Cookie', s.accessCookie)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/pessoas/${pessoa.body.id}`)
        .set('Cookie', s.accessCookie)
        .expect(200);
    });
  });
});
