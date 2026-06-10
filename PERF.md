# PERF.md — Performance DataShare

## Test de performance (k6)

### Endpoint testé
`POST /auth/login`

### Configuration
- **10 utilisateurs virtuels simultanés**
- **Durée : 30 secondes**
- **280 requêtes exécutées**

### Résultats

| Métrique | Valeur |
|----------|--------|
| Requêtes totales | 280 |
| Taux de succès | 100% |
| Temps de réponse moyen | 97ms |
| Temps de réponse médian | 97ms |
| p90 | 101ms |
| p95 | 109ms |
| Temps max | 219ms |
| Débit | 9 req/s |

### Analyse
Les temps de réponse sont excellents — bien en dessous du seuil de 500ms fixé.
Le serveur gère 10 utilisateurs simultanés sans dégradation de performance.

## Budget de performance frontend

### Bundle
```bash
cd frontend && npm run build
```

| Fichier | Taille |
|---------|--------|
| index.js (gzippé) | ~150 Ko |
| index.css | ~5 Ko |

### Métriques cibles
| Métrique | Cible | Outil |
|----------|-------|-------|
| First Contentful Paint | < 2s | Lighthouse |
| Bundle JS | < 500 Ko | Vite build |
| Temps réponse API | < 500ms | k6 ✅ |

## Logs
Les logs NestJS sont disponibles dans la console du serveur en temps réel.
Chaque requête est loggée avec timestamp, méthode et route.
