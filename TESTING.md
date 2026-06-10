# TESTING.md — Plan de tests DataShare

## Tests unitaires

| Fonctionnalité | Type | Critère d'acceptation |
|---|---|---|
| Register | Unitaire | Retourne user + token JWT |
| Login | Unitaire | Retourne token ou 401 |
| Login mauvais MDP | Unitaire | Lève UnauthorizedException |
| Upload fichier | Unitaire | Retourne FileEntity |
| Trouver fichier par token | Unitaire | Retourne FileEntity ou 404 |
| Supprimer fichier | Unitaire | Supprime sans erreur |
| Créer utilisateur | Unitaire | Retourne user créé |
| Email dupliqué | Unitaire | Lève ConflictException |

## Résultats

- **18 tests passent**
- **Couverture globale : 81%** (objectif : 70%)
- `auth.service.ts` : 100%
- `users.service.ts` : 100%
- `files.service.ts` : 97%

## Exécution

```bash
cd backend
npm run test        # tests unitaires
npm run test:cov    # rapport de couverture
```
