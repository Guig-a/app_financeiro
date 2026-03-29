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

describe('Tenant Isolation (e2e)', () => {
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
      email: `${prefix.toLowerCase()}-${Date.now()}@example.com`,
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

  describe('Pessoas', () => {
    it('deve impedir acesso cruzado entre tenants', async () => {
      const tenantA = await registerTenant('Pessoa-A');
      const tenantB = await registerTenant('Pessoa-B');

      const created = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Cliente A',
          tipo: 'CLIENTE',
          documento: '12345678901',
        })
        .expect(201);

      const pessoaId = created.body.id;

      await request(app.getHttpServer())
        .get(`/pessoas/${pessoaId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/pessoas/${pessoaId}`)
        .set('Cookie', tenantB.accessCookie)
        .send({ nome: 'Tentativa Invasao' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/pessoas/${pessoaId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      const listB = await request(app.getHttpServer())
        .get('/pessoas')
        .set('Cookie', tenantB.accessCookie)
        .expect(200);

      expect(Array.isArray(listB.body)).toBe(true);
      expect(listB.body.find((p: any) => p.id === pessoaId)).toBeUndefined();
    });
  });

  describe('Produtos', () => {
    it('deve impedir acesso cruzado entre tenants', async () => {
      const tenantA = await registerTenant('Produto-A');
      const tenantB = await registerTenant('Produto-B');

      const created = await request(app.getHttpServer())
        .post('/produtos')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Produto A',
          codigo: `SKU-${Date.now()}`,
          unidade: 'UN',
          preco: 10.5,
        })
        .expect(201);

      const produtoId = created.body.id;

      await request(app.getHttpServer())
        .get(`/produtos/${produtoId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/produtos/${produtoId}`)
        .set('Cookie', tenantB.accessCookie)
        .send({ nome: 'Produto Invasao' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/produtos/${produtoId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      const listB = await request(app.getHttpServer())
        .get('/produtos')
        .set('Cookie', tenantB.accessCookie)
        .expect(200);

      expect(Array.isArray(listB.body)).toBe(true);
      expect(listB.body.find((p: any) => p.id === produtoId)).toBeUndefined();
    });
  });

  describe('Lançamentos', () => {
    it('deve impedir acesso cruzado e referência externa de pessoa/produto', async () => {
      const tenantA = await registerTenant('Lanc-A');
      const tenantB = await registerTenant('Lanc-B');

      const pessoaA = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Pessoa A',
          tipo: 'CLIENTE',
        })
        .expect(201);

      const produtoA = await request(app.getHttpServer())
        .post('/produtos')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Produto A',
          codigo: `LANC-A-${Date.now()}`,
        })
        .expect(201);

      const createdLanc = await request(app.getHttpServer())
        .post('/lancamentos')
        .set('Cookie', tenantA.accessCookie)
        .send({
          descricao: 'Receita tenant A',
          pessoaId: pessoaA.body.id,
          produtoId: produtoA.body.id,
          valor: 1200.45,
          dataCompetencia: '2026-03-01T00:00:00.000Z',
          dataVencimento: '2026-03-10T00:00:00.000Z',
          tipo: 'RECEITA',
        })
        .expect(201);

      const lancamentoId = createdLanc.body.id;

      await request(app.getHttpServer())
        .get(`/lancamentos/${lancamentoId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/lancamentos/${lancamentoId}`)
        .set('Cookie', tenantB.accessCookie)
        .send({ descricao: 'Tentativa Invasao' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/lancamentos/${lancamentoId}`)
        .set('Cookie', tenantB.accessCookie)
        .expect(404);

      await request(app.getHttpServer())
        .post('/lancamentos')
        .set('Cookie', tenantB.accessCookie)
        .send({
          descricao: 'Tentando usar referencia de outro tenant',
          pessoaId: pessoaA.body.id,
          produtoId: produtoA.body.id,
          valor: 100,
          dataCompetencia: '2026-03-01T00:00:00.000Z',
          dataVencimento: '2026-03-10T00:00:00.000Z',
          tipo: 'DESPESA',
        })
        .expect(400);

      const listB = await request(app.getHttpServer())
        .get('/lancamentos')
        .set('Cookie', tenantB.accessCookie)
        .expect(200);

      expect(Array.isArray(listB.body)).toBe(true);
      expect(
        listB.body.find((l: any) => l.id === lancamentoId),
      ).toBeUndefined();
    });

    it('deve respeitar isolamento nos filtros por pessoaId e produtoId', async () => {
      const tenantA = await registerTenant('Lanc-Filtro-A');
      const tenantB = await registerTenant('Lanc-Filtro-B');

      const pessoaA = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Pessoa Filtro A',
          tipo: 'CLIENTE',
        })
        .expect(201);

      const produtoA = await request(app.getHttpServer())
        .post('/produtos')
        .set('Cookie', tenantA.accessCookie)
        .send({
          nome: 'Produto Filtro A',
          codigo: `FILTRO-A-${Date.now()}`,
        })
        .expect(201);

      const lancA = await request(app.getHttpServer())
        .post('/lancamentos')
        .set('Cookie', tenantA.accessCookie)
        .send({
          descricao: 'Lançamento do tenant A',
          pessoaId: pessoaA.body.id,
          produtoId: produtoA.body.id,
          valor: 500,
          dataCompetencia: '2026-04-01T00:00:00.000Z',
          dataVencimento: '2026-04-05T00:00:00.000Z',
          tipo: 'RECEITA',
        })
        .expect(201);

      const pessoaB = await request(app.getHttpServer())
        .post('/pessoas')
        .set('Cookie', tenantB.accessCookie)
        .send({
          nome: 'Pessoa Filtro B',
          tipo: 'FORNECEDOR',
        })
        .expect(201);

      const produtoB = await request(app.getHttpServer())
        .post('/produtos')
        .set('Cookie', tenantB.accessCookie)
        .send({
          nome: 'Produto Filtro B',
          codigo: `FILTRO-B-${Date.now()}`,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/lancamentos')
        .set('Cookie', tenantB.accessCookie)
        .send({
          descricao: 'Lançamento do tenant B',
          pessoaId: pessoaB.body.id,
          produtoId: produtoB.body.id,
          valor: 350,
          dataCompetencia: '2026-04-02T00:00:00.000Z',
          dataVencimento: '2026-04-06T00:00:00.000Z',
          tipo: 'DESPESA',
        })
        .expect(201);

      const listAByPessoa = await request(app.getHttpServer())
        .get('/lancamentos')
        .query({ pessoaId: pessoaA.body.id })
        .set('Cookie', tenantA.accessCookie)
        .expect(200);
      expect(listAByPessoa.body.some((l: any) => l.id === lancA.body.id)).toBe(
        true,
      );

      const listAByProduto = await request(app.getHttpServer())
        .get('/lancamentos')
        .query({ produtoId: produtoA.body.id })
        .set('Cookie', tenantA.accessCookie)
        .expect(200);
      expect(listAByProduto.body.some((l: any) => l.id === lancA.body.id)).toBe(
        true,
      );

      const listBByPessoaA = await request(app.getHttpServer())
        .get('/lancamentos')
        .query({ pessoaId: pessoaA.body.id })
        .set('Cookie', tenantB.accessCookie)
        .expect(200);
      expect(listBByPessoaA.body).toEqual([]);

      const listBByProdutoA = await request(app.getHttpServer())
        .get('/lancamentos')
        .query({ produtoId: produtoA.body.id })
        .set('Cookie', tenantB.accessCookie)
        .expect(200);
      expect(listBByProdutoA.body).toEqual([]);
    });
  });
});
