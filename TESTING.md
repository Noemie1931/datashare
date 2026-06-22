# TESTING.md — Plan de tests DataShare

## Tests unitaires

| Fonctionnalité | Type | Critère d'acceptation | Résultat |
|---|---|---|---|
| Register | Unitaire | Retourne user + token JWT | PASS |
| Login succès | Unitaire | Retourne token | PASS |
| Login mauvais MDP | Unitaire | Lève UnauthorizedException | PASS |
| Login user inexistant | Unitaire | Lève UnauthorizedException | PASS |
| Upload fichier | Unitaire | Retourne FileEntity | PASS |
| Trouver fichier par token | Unitaire | Retourne FileEntity | PASS |
| Token invalide | Unitaire | Lève NotFoundException | PASS |
| Supprimer fichier | Unitaire | Supprime sans erreur | PASS |
| Fichier inexistant | Unitaire | Lève NotFoundException | PASS |
| Créer utilisateur | Unitaire | Retourne user créé | PASS |
| Email dupliqué | Unitaire | Lève ConflictException | PASS |

## Résultats couverture

- 18 tests unitaires — tous passent
- Couverture globale : 81% (objectif : 70% atteint)
- `auth.service.ts` : 100%
- `users.service.ts` : 100%
- `files.service.ts` : 97%

## Tests E2E (Cypress)

| Scénario | Description | Résultat |
|---|---|---|
| Scénario 1 | Page accueil accessible | PASS |
| Scénario 2 | Formulaire login visible et fonctionnel | PASS |
| Scénario 3 | Page téléchargement lien invalide | PASS |

## Exécution

```bash
# Tests unitaires
cd backend && npm run test

# Rapport de couverture
cd backend && npm run test:cov

# Tests E2E
cd frontend && npx cypress run --browser chrome
```
