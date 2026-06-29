# Sécurité — DataShare

## Ce qui est en place

| Mesure | Détail |
|---|---|
| Authentification | JWT signé, token valable 7 jours |
| Mots de passe | hashés avec bcrypt (10 rounds), jamais stockés en clair |
| Liens de téléchargement | token UUID v4, impossible à deviner |
| Mot de passe sur un fichier | optionnel, également hashé bcrypt |
| Upload | taille limitée à 1 Go (limite Multer + contrôle côté serveur) |
| Type de fichier | inspection du **contenu réel** (magic number), pas de l'extension : les exécutables (MZ/ELF/Mach-O, scripts `#!`) sont refusés même renommés en `.txt` |
| Expiration | passé 1 à 7 jours (selon le choix), le lien est refusé au téléchargement |
| CORS | restreint à `http://localhost:5173` en dev |
| Identifiants vides | refusés côté client et côté serveur |
| Token invalide ou expiré | une réponse 401 déconnecte automatiquement et renvoie vers la connexion |

## npm audit

Lancé dans `backend/` :

```
25 vulnerabilities (18 moderate, 7 high)
```

Elles concernent toutes des dépendances de NestJS (`@nestjs/core`,
`@nestjs/platform-express`...), pas mon propre code. Je n'ai pas lancé
`npm audit fix --force` car cela casserait des versions majeures de Nest. En production,
il suffirait de suivre les mises à jour de NestJS et de monter de version dès qu'un
correctif est disponible.

## Durci suite au retour du mentor

- **`JWT_SECRET` sorti du code** : lu depuis le `.env` via `ConfigService` (signature dans `auth.module.ts`, vérification dans `jwt.strategy.ts`). Plus aucun secret en dur, et le `.env` est dans le `.gitignore`.
- **Conteneurisation complète** : front + back + base via `docker-compose` ; endpoint `/health` pour le health check Docker.
- **Couverture des fichiers de sécurité** : `jwt.strategy.ts` et `jwt-auth.guard.ts` sont désormais testés (étaient à 0 %) → couverture globale **98,7 %** (logique métier à 100 %).

## Conformité RGPD (données personnelles)

DataShare manipule des données personnelles : il faut donc cadrer leur usage.

| Donnée personnelle | Pourquoi on la stocke | Durée de conservation |
|---|---|---|
| Email du compte | Identifier l'utilisateur, le connecter | Tant que le compte existe |
| Mot de passe (haché bcrypt) | Authentifier | Tant que le compte existe ; jamais en clair |
| Fichiers téléversés + métadonnées | Le service de partage | **1 à 7 jours** puis **purge automatique** (cron) |
| Logs (méthode, route, statut, latence) | Exploitation/observabilité | Court terme ; **pas de donnée personnelle** dans les logs |

**Minimisation** : on ne collecte que l'email et le mot de passe (aucune donnée superflue :
ni nom, ni adresse, ni téléphone).

**Droit à l'effacement** : un fichier peut être supprimé à tout moment par son propriétaire
(suppression du disque **et** de la base), et les fichiers expirés sont purgés automatiquement.

**Sécurité des données** : mots de passe hachés (bcrypt), accès aux fichiers cloisonné par
propriétaire, liens non devinables (UUID) et temporaires.

**Reste à faire pour une conformité complète (prod)** : une page « suppression de compte »
(effaçant le compte et tous ses fichiers), une politique de confidentialité, et le
consentement explicite. À ce stade MVP, ces points sont identifiés mais non implémentés.

## Avant une mise en production (reste à faire)

- Restreindre le CORS au vrai domaine de production
- Passer le tout en HTTPS
- Monter les versions de NestJS pour corriger les vulnérabilités `npm audit`
- Ajouter la révocation de token (refresh token / liste de révocation)

> Note : la purge des fichiers expirés (suppression disque + base) est **déjà en place**
> via un cron quotidien (`@nestjs/schedule`), en plus du blocage du lien à l'expiration.
