# MAINTENANCE.md — Maintenance DataShare

## Mise à jour des dépendances

### Fréquence recommandée
| Type | Fréquence |
|---|---|
| Correctifs de sécurité | Immédiatement |
| Mises à jour mineures | Mensuelle |
| Mises à jour majeures | Trimestrielle |

### Procédure
```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour les dépendances mineures
npm update

# Audit de sécurité
npm audit
npm audit fix
```

## Risques

| Risque | Impact | Mitigation |
|---|---|---|
| JWT_SECRET exposé | Critique | Variables d'environnement en production |
| Dépendances obsolètes | Moyen | Audit mensuel |
| Espace disque fichiers | Moyen | Cron de nettoyage quotidien |
| Base de données corrompue | Élevé | Sauvegardes régulières |

## Procédures

### Redémarrage de l'application
```bash
cd backend && npm run start:prod
cd frontend && npm run build
```

### Sauvegarde base de données
```bash
docker exec datashare_db pg_dump -U postgres datashare > backup.sql
```

### Restauration
```bash
docker exec -i datashare_db psql -U postgres datashare < backup.sql
```

## Variables d'environnement à changer en production
- `JWT_SECRET` : utiliser une clé aléatoire longue
- `DB_PASSWORD` : mot de passe fort
- `APP_URL` : URL de production
