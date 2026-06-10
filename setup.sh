#!/bin/bash
echo "🚀 Installation DataShare..."

# 1. Lancer PostgreSQL
echo "📦 Démarrage PostgreSQL..."
docker-compose up -d
sleep 3

# 2. Backend
echo "⚙️ Installation backend..."
cd backend
cp .env.example .env
npm install
echo "✅ Backend prêt"

# 3. Frontend
echo "🎨 Installation frontend..."
cd ../frontend
npm install
echo "✅ Frontend prêt"

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Pour lancer l'application :"
echo "  Terminal 1 : cd backend && npm run start:dev"
echo "  Terminal 2 : cd frontend && npm run dev"
echo ""
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:3000"
