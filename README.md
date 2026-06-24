# DataShare

Application de partage de fichiers via liens temporaires.

## Stack technique

- **Backend** : NestJS (TypeScript)
- **Frontend** : React + Vite (TypeScript)
- **Base de données** : PostgreSQL (Docker)
- **Auth** : JWT

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

### 2. Lancer PostgreSQL
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Accès

- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## Tests

```bash
cd backend
npm run test        # tests unitaires
npm run test:cov    # couverture de code
```

## Fonctionnalités

- Upload de fichiers (max 1 Go)
- Lien de téléchargement unique
- Protection par mot de passe (optionnelle)
- Lien valable 1 à 7 jours, puis refusé
- Espace personnel (historique, suppression)
- Authentification JWT
