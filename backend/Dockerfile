# --- Etape 1 : compilation TypeScript -> JavaScript ---
# On installe TOUTES les dependances (dont les outils de dev) pour pouvoir
# compiler le projet avec "npm run build".
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etape 2 : image finale, legere ---
# On repart d'une image propre et on n'installe que les dependances de
# production (--omit=dev). On copie uniquement le code compile (dist).
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Dossier ou Multer ecrit les fichiers uploades (persiste via un volume).
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "dist/main"]
