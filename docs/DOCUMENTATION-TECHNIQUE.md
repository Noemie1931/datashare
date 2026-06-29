# Documentation technique — DataShare

Point d'entrée concis de la documentation technique. Chaque section renvoie au document détaillé correspondant.

DataShare est une application web de **partage de fichiers par lien temporaire** : un utilisateur dépose un fichier, l'application génère un lien unique (protégeable par mot de passe) qui expire au bout de 1 à 7 jours.

---

## 1. Architecture de l'application

Architecture **3 couches**, entièrement conteneurisée :

- **Frontend** React + Vite (nginx, port 5173) → **Backend** NestJS (port 3000) → **PostgreSQL** (port 5433).
- Le front parle au back via une **API REST** (HTTP/JSON) avec un JWT en en-tête ; le back lit/écrit les métadonnées en base via TypeORM et stocke les fichiers sur disque (`/uploads`) en streaming.

Diagramme et trajet détaillé d'une requête : **[ARCHITECTURE.md](ARCHITECTURE.md)** (image + source Mermaid).

---

## 2. Justification des choix technologiques

Tous les choix de stack sont pris **parmi les options imposées** ; voici le pourquoi de chacun et les alternatives écartées.

### Backend — NestJS (TypeScript)
- **Pourquoi** : impose une **architecture modulaire** (modules / contrôleurs / services), intègre nativement TypeScript, l'**injection de dépendances**, la validation, les tâches planifiées (`@nestjs/schedule`) et les tests.
- **Alternatives** : Spring (Java, plus lourd à mettre en place pour un MVP), Symfony (PHP), Express (trop minimal, peu de structure imposée).
- **Compromis** : courbe d'apprentissage des décorateurs, compensée par un code organisé et testable.

### Langage — TypeScript (front et back)
- **Pourquoi** : le **typage** détecte les erreurs avant l'exécution (mauvais type, faute de frappe), précieux sur un projet API + base de données. Code plus clair et maintenable.
- **Alternative** : JavaScript pur — écarté pour la sûreté de typage.

### Frontend — React + Vite
- **Pourquoi** : React est le **standard du marché** pour les interfaces dynamiques, large écosystème. **Vite** offre un démarrage et un build très rapides (HMR instantané, bundle optimisé par tree-shaking).
- **Alternatives** : Angular (plus structurant mais plus verbeux), Vue (écosystème plus restreint).

### Base de données — PostgreSQL
- **Pourquoi** : base **relationnelle** robuste et gratuite, adaptée à des données liées (« un utilisateur possède plusieurs fichiers »). Garantit les **relations** (clé étrangère) et l'**unicité** (email unique).
- **Alternative** : MongoDB (NoSQL) — écarté car le modèle est clairement relationnel.

### ORM — TypeORM
- **Pourquoi** : intégration native NestJS ; mes classes annotées `@Entity` deviennent des tables, je manipule des objets plutôt que du SQL à la main.
- **Compromis** : `synchronize: true` est pratique en dev mais à remplacer par des **migrations** en production.

### Authentification — JWT + bcrypt
- **Pourquoi** : **JWT** est *stateless* (pas de session serveur à stocker, scalable) ; le serveur signe un jeton et vérifie sa signature. **bcrypt** hache les mots de passe (à sens unique, lent par conception → résistant à la force brute).
- **Alternative** : sessions serveur (état à maintenir), OAuth (surdimensionné pour le MVP).

### Stockage des fichiers — disque + métadonnées en base
- **Pourquoi** : les **fichiers** vont sur le disque (`/uploads`), seules les **métadonnées** (nom, taille, token, expiration) en base. Stocker les fichiers en base serait lourd et lent.
- **Réception** : **Multer** (middleware d'upload), avec une limite de taille de 1 Go.

### Conteneurisation — Docker Compose
- **Pourquoi** : un **environnement identique partout** et un déploiement reproductible (fin du « ça marche sur ma machine »). 3 services orchestrés : PostgreSQL, backend, frontend.

### Tests — Jest, Supertest, Cypress, k6
- **Pourquoi** : **Jest** (unitaire, livré avec NestJS), **Supertest** (intégration HTTP), **Cypress** (end-to-end navigateur), **k6** (test de charge). Couvre la pyramide des tests + la performance.

---

## 3. Modèle de données

Deux entités : **USER** (1) — (n) **FILE**, reliées par une clé étrangère `user_id` (nullable, `ON DELETE CASCADE`). MCD complet (formalisme Merise) + tables détaillées : **[MODELE-DE-DONNEES.md](MODELE-DE-DONNEES.md)**.

---

## 4. Documentation des endpoints (API)

Contrat d'interface complet au format **OpenAPI 3.0.3** : **[../openapi.yaml](../openapi.yaml)** (doc interactive : [api.html](api.html)).

| Méthode | Route | Rôle | Auth |
|---|---|---|---|
| GET | `/health` | Health check | — |
| POST | `/auth/register` | Créer un compte | — |
| POST | `/auth/login` | Se connecter (renvoie un JWT) | — |
| POST | `/files/upload` | Téléverser un fichier | JWT |
| GET | `/files` | Lister mes fichiers (filtre actifs/expirés) | JWT |
| DELETE | `/files/:id` | Supprimer un de mes fichiers | JWT |
| GET | `/d/:token` | Infos d'un lien de partage | — |
| POST | `/d/:token/download` | Télécharger le fichier | — |

---

## 5. Sécurité et gestion des accès

Mots de passe hachés (bcrypt), JWT signé (secret en variable d'environnement), liens = UUID non devinables + expiration, refus des exécutables (magic number), cloisonnement par propriétaire, limite de taille (anti-DoS). Détail et `npm audit` : **[../SECURITY.md](../SECURITY.md)**.

---

## 6. Qualité, tests et maintenance

58 tests (47 unitaires + 7 intégration + 4 e2e), couverture ~99 %, test de charge k6, logs structurés. Détail : **[../TESTING.md](../TESTING.md)** · performance **[../PERF.md](../PERF.md)** · maintenance **[../MAINTENANCE.md](../MAINTENANCE.md)**.

---

## 7. Installation et exécution

Prérequis : Node 20+, Docker. Démarrage rapide :

```bash
./setup.sh                      # base PostgreSQL + dépendances
cd backend && npm run start:dev # backend (:3000)
cd frontend && npm run dev      # frontend (:5173)
```

Ou tout en conteneurs : `docker-compose up -d --build`. Détail complet : **[../README.md](../README.md)**.

---

## 8. Utilisation de l'IA dans le développement

Tâches confiées, rôle de supervision et correctifs apportés : **[../AI_USAGE.md](../AI_USAGE.md)**.
