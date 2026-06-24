# Performance — DataShare

## Backend sous charge (k6)

J'ai testé l'endpoint le plus sollicité, `POST /auth/login` (il fait un appel base +
un compare bcrypt, donc c'est le plus coûteux), avec k6 : 10 utilisateurs en parallèle
pendant 30 secondes.

Résultats (`k6 run k6_test.js`) :

| Métrique | Valeur |
|---|---|
| Requêtes | 274 (~8,9 req/s) |
| Succès | 100 % (548/548 checks) |
| Temps moyen | 107 ms |
| Médiane | 101 ms |
| p90 | 111 ms |
| p95 | 157 ms |
| Max | 490 ms |

Tout reste sous la barre des 500 ms que je m'étais fixée, et aucune requête n'a échoué.
Le maximum à 490 ms correspond aux toutes premières requêtes, le temps que bcrypt se mette
en route ; la médiane à 101 ms est plus représentative du comportement réel.

## Frontend (build Vite)

Sortie de `npm run build` :

| Fichier | Brut | Gzippé |
|---|---|---|
| index.js | 298 Ko | 95,6 Ko |
| index.css | 0,86 Ko | 0,48 Ko |
| index.html | 0,46 Ko | 0,30 Ko |

Build en ~130 ms. Le bundle JS gzippé tient sous 100 Ko, ce qui est largement correct
pour une SPA (React + React Router + Axios). Vite se charge du tree-shaking automatiquement.

## Pistes si le projet grossit

- Activer la compression gzip côté NestJS en prod
- Pagination sur `GET /files` quand un compte a beaucoup de fichiers
- Cache HTTP sur les téléchargements
- CDN pour les assets statiques
