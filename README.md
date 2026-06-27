# DataShare

Application de partage de fichiers via liens temporaires.

## Stack technique

- **Backend** : NestJS (TypeScript)
- **Frontend** : React + Vite (TypeScript)
- **Base de données** : PostgreSQL (Docker)
- **Auth** : JWT (secret en variable d'environnement)
- **Conteneurisation** : Docker Compose (PostgreSQL + backend + frontend)

## Prérequis

- Node.js v20+
- Docker Desktop
- npm

## Installation

### 1. Cloner le repo
```bash
git clone https://github.com/Noemie1931/datashare.git
cd datashare
```

### Option A — Tout avec Docker (recommandé)
```bash
cp backend/.env.example backend/.env
docker-compose up -d --build   # PostgreSQL + backend (:3000) + frontend (:5173)
```
Le backend expose `GET /health` ; Docker attend qu'il soit « sain » avant de lancer le frontend.

### Option B — Développement local

#### 2. Lancer PostgreSQL seul
```bash
docker-compose up -d postgres
```

#### 3. Backend
```bash
cd backend
cp .env.example .env       # contient JWT_SECRET (lu via ConfigService)
npm install
npm run start:dev
```

#### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Accès

- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## Tests

57 tests (47 unitaires + 7 intégration + 3 e2e), couverture ~99 %. Détail dans `TESTING.md`.

```bash
cd backend
npm run test        # tests unitaires (Jest)
npm run test:e2e    # tests d'intégration (Supertest, base requise)
npm run test:cov    # couverture de code

cd ../frontend
npx cypress run     # tests end-to-end navigateur

k6 run k6_test.js   # test de performance (depuis la racine)
```

## Contrat d'interface (API)

Le contrat d'interface complet est décrit au format **OpenAPI 3.0.3** dans [`openapi.yaml`](openapi.yaml) : routes, paramètres, structures de données et codes de retour pour la communication front ↔ back.

Pour le visualiser : coller le contenu dans [editor.swagger.io](https://editor.swagger.io), ou utiliser une extension OpenAPI/Swagger de l'éditeur.

## Fonctionnalités

- Upload de fichiers (max 1 Go)
- Lien de téléchargement unique
- Protection par mot de passe (optionnelle)
- Lien valable 1 à 7 jours, puis refusé
- Espace personnel (historique, suppression)
- Authentification JWT
