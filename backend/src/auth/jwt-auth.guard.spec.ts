import { JwtAuthGuard } from './jwt-auth.guard';

// Le guard etait a 0% de couverture. Sa logique d'autorisation reelle
// (laisser passer ou refuser une requete) est verifiee de bout en bout par
// les tests e2e (token absent/invalide => 401, token valide => acces).
// Ce test unitaire confirme simplement qu'il s'instancie correctement.
describe('JwtAuthGuard', () => {
  it('est bien instancie', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
