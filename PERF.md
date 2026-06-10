# PERF.md — Performance DataShare

## Test de performance backend (k6)

### Endpoint testé
`POST /auth/login`

### Configuration
- 10 utilisateurs virtuels simultanés
- Durée : 30 secondes
- 280 requêtes exécutées

### Résultats

| Métrique | Valeur | Seuil |
|----------|--------|-------|
| Requêtes totales | 280 | — |
| Taux de succès | 100% | 100% ✅ |
| Temps moyen | 97ms | < 500ms ✅ |
| Temps médian | 97ms | < 500ms ✅ |
| p90 | 101ms | < 500ms ✅ |
| p95 | 109ms | < 500ms ✅ |
| Temps max | 219ms | < 500ms ✅ |
| Débit | 9 req/s | — |

### Analyse
Le serveur gère 10 utilisateurs simultanés sans dégradation. Tous les temps de réponse sont bien en dessous du seuil de 500ms. Aucune requête échouée.

## Budget de performance frontend

### Résultats du build Vite

| Fichier | Taille brute | Taille gzippée |
|---------|-------------|----------------|
| index.js | 284 Ko | 92 Ko ✅ |
| index.css | 1.78 Ko | 0.81 Ko ✅ |
| index.html | 0.46 Ko | 0.30 Ko ✅ |
| **Total** | **286 Ko** | **93 Ko** |

### Analyse bundle
Le bundle JS de 92 Ko gzippé est excellent (seuil recommandé < 200 Ko).
React + Axios + React Router = dépendances légères bien tree-shakées par Vite.

## Métriques clés

| Métrique | Valeur mesurée |
|----------|---------------|
| Temps réponse API (avg) | 97ms |
| Temps réponse API (p95) | 109ms |
| Bundle JS gzippé | 92 Ko |
| Build time | 327ms |
| Taux de succès sous charge | 100% |

## Actions d'optimisation possibles

- Activer la compression gzip sur NestJS en production
- Mettre en place un CDN pour les assets statiques
- Ajouter du cache HTTP sur les endpoints de téléchargement
- Implémenter la pagination sur GET /files pour les gros historiques
