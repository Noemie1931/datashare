import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
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
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  // Health check : route publique utilisee par Docker pour savoir si l'API
  // est prete. Prouve aussi que AppController est bien cable dans AppModule.
  describe('Health (/health)', () => {
    it('GET /health renvoie 200 et le statut du service', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toEqual({ status: 'ok', service: 'datashare-api' });
    });
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
        .post('/v1/auth/register')
        .send({ email, password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(email);
    });

    it('POST /auth/login connecte ce compte et renvoie un token', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
    });

    it('POST /auth/login refuse un mauvais mot de passe (401)', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password: 'mauvais_mot_de_passe' })
        .expect(401);
    });
  });

  // L'upload est protege par le JwtAuthGuard. Sans token JWT valide, la
  // requete doit etre refusee AVANT meme d'atteindre le service : c'est le
  // garde qui repond 401. On le verifie par une vraie requete HTTP, car un
  // test unitaire de controleur (qui mocke le service) court-circuite le
  // garde et ne peut donc pas prouver ce comportement.
  describe('Fichiers (/files)', () => {
    it('POST /files/upload sans token est refuse (401)', async () => {
      await request(app.getHttpServer())
        .post('/v1/files/upload')
        .expect(401);
    });

    it('POST /files/upload avec un token invalide est refuse (401)', async () => {
      await request(app.getHttpServer())
        .post('/v1/files/upload')
        .set('Authorization', 'Bearer token_bidon')
        .expect(401);
    });

    // Chemin authentifie REUSSI : on cree un compte, on recupere son vrai
    // token, puis on accede a une route protegee avec ce token. Ce test
    // exerce de bout en bout le JwtAuthGuard (il laisse passer) ET la
    // JwtStrategy (sa methode validate remonte l'utilisateur) — les deux
    // fichiers qui etaient a 0% de couverture.
    it('GET /files avec un token valide est accepte (200)', async () => {
      const creds = { email: `e2e_files_${Date.now()}@test.com`, password: 'password123' };
      const register = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(creds)
        .expect(201);

      const token = register.body.access_token;

      const res = await request(app.getHttpServer())
        .get('/v1/files')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Réponse paginée : { items, total, page, limit, totalPages }
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
