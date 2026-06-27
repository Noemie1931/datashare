import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

// Tests unitaires de la strategie JWT : elle etait a 0% de couverture.
// On simule (mock) ConfigService pour fournir un secret de test.
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const config = {
      get: jest.fn().mockReturnValue('secret_de_test'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(config);
  });

  it('est bien instanciee', () => {
    expect(strategy).toBeDefined();
  });

  it('validate renvoie uniquement sub et email depuis le payload', async () => {
    // Le payload reel contient aussi iat/exp ajoutes par la signature :
    // validate ne doit remonter que l'identite (sub + email).
    const payload = { sub: 'user-123', email: 'noemie@test.com', iat: 1, exp: 2 };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ sub: 'user-123', email: 'noemie@test.com' });
  });
});
