import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test d'intégration du parcours d'authentification : on lance toute
  // l'application (contrôleur + service + base) et on envoie de vraies
  // requêtes HTTP, comme le ferait le frontend.
  describe('Authentification (/auth)', () => {
    // Email unique à chaque exécution pour ne pas heurter la contrainte
    // d'unicité en base si le test est relancé plusieurs fois.
    const email = `e2e_${Date.now()}@test.com`;
    const password = 'password123';

    it('POST /auth/register crée un compte et renvoie un token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(email);
    });

    it('POST /auth/login connecte ce compte et renvoie un token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
    });

    it('POST /auth/login refuse un mauvais mot de passe (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'mauvais_mot_de_passe' })
        .expect(401);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
