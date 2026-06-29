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

## Suivi des vulnérabilités (npm audit)

Procédure de suivi, à exécuter au moins une fois par mois et avant chaque mise en production :

1. **Détecter** : lancer `npm audit` dans `backend/` et `frontend/`.
2. **Classer** chaque vulnérabilité en trois catégories, et **tracer la décision** :
   - **Corrigée** : `npm audit fix` (sans casse) → on monte la dépendance.
   - **Acceptée** : risque non exploitable dans notre contexte (ex. dépendance de dev/build,
     ou faille qui demande un accès qu'on n'expose pas). On note pourquoi.
   - **Ignorée temporairement** : pas de correctif disponible → on surveille jusqu'à la sortie d'un patch.
3. **Documenter** l'état dans `SECURITY.md` (date, nombre, décision).
4. **Automatiser** : le pipeline CI (GitHub Actions) relance les tests à chaque push ;
   on peut y ajouter un `npm audit --audit-level=high` informatif.

État actuel (voir `SECURITY.md`) : 25 vulnérabilités (18 modérées, 7 hautes), **toutes
transitives dans l'écosystème NestJS**, aucune dans notre code. Décision : **acceptées** ;
on ne lance pas `npm audit fix --force` (casse des versions majeures de NestJS), on monte de
version dès qu'un correctif compatible est publié.

## Migrations de base de données

En développement, le schéma est généré automatiquement depuis les entités (`synchronize: true`).
**En production, on désactive ce comportement** (`DB_SYNCHRONIZE=false`) pour éviter toute
perte de données accidentelle, et on applique des **migrations TypeORM versionnées** :

```bash
# Générer une migration à partir des changements d'entités
npm run typeorm migration:generate -- ./migrations/NomDeLaMigration
# Appliquer les migrations en attente
npm run typeorm migration:run
```

## Risques

| Risque | Impact | Mitigation |
|---|---|---|
| JWT_SECRET exposé | Critique | **Fait** : lu depuis `.env` via ConfigService (hors Git) ; clé longue et aléatoire en prod |
| Dépendances obsolètes | Moyen | Audit mensuel |
| Espace disque fichiers | Moyen | **Fait** : cron quotidien de purge des fichiers expirés (`@nestjs/schedule`) |
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
- `CORS_ORIGIN` : domaine du front en production (au lieu du défaut `http://localhost:5173`)
- `DB_SYNCHRONIZE` : `false` en production (on passe par des migrations)
