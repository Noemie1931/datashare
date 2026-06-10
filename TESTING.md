# TESTING.md — Plan de tests DataShare

## Tests unitaires

| Fonctionnalité | Type | Critère d'acceptation | Résultat |
|---|---|---|---|
| Register | Unitaire | Retourne user + token JWT | ✅ |
| Login succès | Unitaire | Retourne token | ✅ |
| Login mauvais MDP | Unitaire | Lève UnauthorizedException | ✅ |
| Login user inexistant | Unitaire | Lève UnauthorizedException | ✅ |
| Upload fichier | Unitaire | Retourne FileEntity | ✅ |
| Trouver fichier par token | Unitaire | Retourne FileEntity | ✅ |
| Token invalide | Unitaire | Lève NotFoundException | ✅ |
| Supprimer fichier | Unitaire | Supprime sans erreur | ✅ |
| Fichier inexistant | Unitaire | Lève NotFoundException | ✅ |
| Créer utilisateur | Unitaire | Retourne user créé | ✅ |
| Email dupliqué | Unitaire | Lève ConflictException | ✅ |

## Résultats couverture

- **18 tests unitaires — tous passent**
- **Couverture globale : 81%** (objectif : 70% ✅)
- `auth.service.ts` : 100%
- `users.service.ts` : 100%
- `files.service.ts` : 97%

## Tests E2E (Cypress)

| Scénario | Description | Résultat |
|---|---|---|
| Scénario 1 | Page accueil accessible | ✅ |
| Scénario 2 | Formulaire login visible et fonctionnel | ✅ |
| Scénario 3 | Page téléchargement lien invalide | ✅ |

## Exécution

```bash
# Tests unitaires
cd backend && npm run test

# Rapport de couverture
cd backend && npm run test:cov

# Tests E2E
cd frontend && npx cypress run --browser chrome
```
