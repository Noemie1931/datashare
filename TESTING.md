# Plan de tests — DataShare

Les tests suivent la **pyramide** : beaucoup de tests unitaires rapides à la base,
quelques tests d'intégration, quelques tests end-to-end au sommet. S'y ajoutent des
**tests de sécurité** et un **test de performance**.

**Au total : 58 tests, tous au vert** — 47 unitaires (Jest) + 7 d'intégration/e2e API
(Supertest) + 4 end-to-end navigateur (Cypress). Couverture **98,7 %** (logique métier à 100 %).

## 1. Tests unitaires (Jest) — 47 tests

Les services sont testés en **mockant le repository TypeORM**, pour ne pas dépendre de la base.

**Authentification (`auth.service`)**
- Inscription : renvoie l'utilisateur et un token JWT ; email invalide / mot de passe trop court → `BadRequestException`
- Connexion réussie ; mauvais mot de passe / utilisateur inexistant / identifiants vides → `UnauthorizedException`

**Sécurité JWT (`jwt.strategy`, `jwt-auth.guard`)** *(étaient à 0 % — corrigé)*
- `JwtStrategy.validate` ne remonte que `sub` et `email` (moindre information)
- `JwtAuthGuard` s'instancie correctement (comportement réel couvert en e2e)

**Utilisateurs (`users.service`)**
- Création d'un utilisateur ; email déjà pris → `ConflictException`

**Fichiers (`files.service`)**
- Upload : renvoie l'entité ; mot de passe trop court → `BadRequestException`
- Recherche par token ; token inconnu → `NotFoundException`
- Filtres tous / actifs / expirés ; vérification du mot de passe (avec et sans)
- Suppression (avec et sans fichier physique) ; fichier inexistant → `NotFoundException`
- *(tests de sécurité — voir section 4)*

**Contrôleur de fichiers (`files.controller`)**
- Lien expiré → 403 ; mauvais mot de passe de fichier → 403
- Téléchargement réussi (avec et sans mot de passe) ; upload (renvoie le lien), liste, suppression

**Technique (`logging.interceptor`, `app.controller`)** *(étaient à 0 % — corrigé)*
- L'intercepteur journalise `method`, `url`, `statusCode`, `durationMs`
- `GET /health` renvoie le statut du service

## 2. Tests d'intégration / e2e API (Jest + Supertest) — 7 tests

On lance **toute l'application** (contrôleur + service + vraie base) et on envoie de **vraies requêtes HTTP** :
- `GET /health` → 200 (et prouve que `AppController` est bien câblé)
- `POST /auth/register` puis `/auth/login` ; mauvais mot de passe → 401
- `POST /files/upload` sans token → 401 ; avec token bidon → 401
- **Accès authentifié réussi** : register → token → `GET /files` avec ce token → 200
  (exerce le **Guard** et la **Strategy** de bout en bout)

## 3. Tests end-to-end navigateur (Cypress) — 4 parcours

- La page d'accueil s'affiche et propose de se connecter
- Le formulaire de connexion est présent et utilisable
- Un lien de téléchargement invalide affiche le bon message d'erreur
- **Parcours complet (vraies interactions)** : inscription via le formulaire → téléversement
  d'un fichier → récupération du lien de partage → ouverture du lien et téléchargement

> Besoin du back ? Afficher une page non ; le scénario du lien invalide fait un vrai
> appel à l'API et n'affiche le message que si le back renvoie 404. Un vrai end-to-end
> teste la chaîne complète navigateur → API → base.

## 4. Tests de sécurité

La sécurité n'est pas une catégorie à part dans le code : **une bonne partie des tests
unitaires SONT des tests de sécurité**. Concrètement, sont testés :

- **Refus d'un exécutable** même renommé en `.txt` (vérification du *magic number* : MZ/ELF/Mach-O/`#!`)
- **Refus d'un script `#!`** déguisé en fichier texte
- **Limite de taille** (> 1 Go refusé + fichier supprimé) → protection anti-déni de service
- **Expiration bornée** côté serveur (durée hors de 1–7 jours refusée) → on ne fait pas confiance au client
- **Cloisonnement par propriétaire** : un utilisateur ne peut pas supprimer le fichier d'un autre
- **Mots de passe de fichier** hachés (bcrypt) et vérifiés ; mot de passe trop court refusé
- **Authentification** : accès refusé sans token / avec token invalide (401), distinction lien invalide (404) / expiré (403)

En complément, audit des dépendances avec `npm audit` (voir `SECURITY.md`).

## 5. Tests de performance (k6)

Deux scénarios de charge, **10 utilisateurs en parallèle pendant 30 s**, budget p95 < 500 ms :

| Scénario | Endpoint(s) | Succès | p95 |
|---|---|---|---|
| `k6_test.js` | `POST /auth/login` (bcrypt) | 100 % | ~157 ms |
| `k6_upload_test.js` | `upload` + `download` (transfert de fichiers) | 100 % | upload ~41 ms / download ~22 ms |

Le second scénario couvre le **chemin critique du produit** (téléversement puis téléchargement,
avec authentification). Détail des deux et **budget de performance front (Lighthouse)** dans `PERF.md`.

## 6. Couverture

![Rapport de couverture Jest/Istanbul — 98,71 % statements](docs/coverage_report.png)

*Capture réelle du rapport généré par `npm run test:cov`.*

```
File                     | % Stmts | % Lines |
-------------------------|---------|---------|
All files                |  98.71  |  98.50  |
  auth.service.ts        |   100   |   100   |
  jwt.strategy.ts        |  90.90  |  88.88  |
  jwt-auth.guard.ts      |   100   |   100   |
  users.service.ts       |   100   |   100   |
  files.service.ts       |  98.71  |  98.59  |
  logging.interceptor.ts |   100   |   100   |
  app.service.ts         |   100   |   100   |
```

**98,7 % au global** (objectif de 70 % largement dépassé). La logique métier (services) reste à **100 %**.

### Pourquoi pas 100 % ? (à savoir expliquer)

Les ~1 % restants ne sont **pas** de la logique non testée. Trois catégories précises :

**1. Des branches « fantômes » générées par TypeScript** (l'essentiel) — sur les injections de dépendances dans les constructeurs :

| Fichier | Ligne | Code |
|---|---|---|
| auth.service.ts | 11 | `private usersService: UsersService` |
| users.service.ts | 11 | `private usersRepository: Repository<User>` |
| files.service.ts | 18 | `private repo: Repository<FileEntity>` |
| jwt.strategy.ts | 8 | `constructor(config: ConfigService)` |

Quand TS compile `constructor(private x: Type)`, il génère un motif que l'outil de couverture (Istanbul) interprète comme une branche conditionnelle « paramètre absent », qui ne s'exécute jamais. **Conséquence : 100 % de couverture de *branches* est inatteignable tant qu'on utilise les paramètres-propriétés de TypeScript.** Ce n'est pas du code métier.

**2. Le déclencheur du cron** — `files.service.ts` L134-135 :

```ts
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async handleExpiredCleanup(): Promise<void> {
  await this.purgeExpired();   // <- seul statement non couvert
}
```

La **vraie logique de purge** (`purgeExpired`) est testée à 100 % ; seul le *wrapper* qui l'appelle automatiquement à 3 h ne l'est pas (il faudrait simuler l'horloge).

**3. Quelques branches défensives / cas limites** (`files.service.ts`) :
- L52 : durée d'expiration `< 1` jour (seul `> 7` est testé)
- L60 : upload réussi **avec** mot de passe (la branche hash)
- L122 : fichier déjà absent du disque lors de la purge
- L126 : purge quand il n'y a **aucun** fichier expiré

Ces chemins ne changent pas le comportement.

**4. L'extracteur de cookie du JWT** — `jwt.strategy.ts` L10 :

```ts
const cookieExtractor = (req) => req?.cookies?.access_token || null;
```

Cette fonction lit le JWT dans le cookie HttpOnly. Elle est appelée par Passport **au moment d'une vraie requête HTTP** ; les tests unitaires, eux, testent `validate()`, pas l'extraction. Le bon fonctionnement du cookie est vérifié de bout en bout par les tests d'intégration (Supertest) et Cypress, qui ne comptent pas dans cette couverture *unitaire*.

> **À retenir :** tester 100 % n'est pas le but, et 100 % de branches est même impossible ici (point n°1). La couverture est un indicateur ; on la concentre là où il y a du risque.

## Lancer les tests

```bash
# unitaires
cd backend && npm run test

# intégration / e2e API (nécessite la base : docker-compose up -d)
cd backend && npm run test:e2e

# couverture
cd backend && npm run test:cov

# end-to-end navigateur
cd frontend && npx cypress run --browser chrome

# performance (k6 installé)
k6 run k6_test.js          # charge sur /auth/login
k6 run k6_upload_test.js   # charge sur upload + download
```
