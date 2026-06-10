# PERF.md — Performance DataShare

## Test de performance (k6)

### Endpoint testé
`POST /files/upload`

### Installation k6
```bash
brew install k6
```

### Script de test
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/auth/login');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

### Exécution
```bash
k6 run script.js
```

## Métriques clés

| Métrique | Valeur cible |
|---|---|
| Temps de réponse p95 | < 500ms |
| Taille bundle frontend | < 1Mo |
| Taille max fichier | 1Go |

## Budget performance frontend

- Bundle JS : analysé avec `npm run build`
- Score Lighthouse : > 80
- First Contentful Paint : < 2s

## Logs

Les logs NestJS sont disponibles dans la console du serveur.
