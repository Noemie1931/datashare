# --- Etape 1 : construction du bundle React ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etape 2 : service des fichiers statiques par nginx ---
# Une application React compilee n'est que du HTML/CSS/JS statique : un
# serveur web leger comme nginx suffit a la servir.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
