# Sécurité — DataShare

## Ce qui est en place

| Mesure | Détail |
|---|---|
| Authentification | JWT signé, token valable 7 jours |
| Mots de passe | hashés avec bcrypt (10 rounds), jamais stockés en clair |
| Liens de téléchargement | token UUID v4, impossible à deviner |
| Mot de passe sur un fichier | optionnel, également hashé bcrypt |
| Upload | taille limitée à 1 Go (limite Multer) |
| Expiration | passé 1 à 7 jours (selon le choix), le lien est refusé au téléchargement |
| CORS | restreint à `http://localhost:5173` en dev |

## npm audit

Lancé dans `backend/` :

```
24 vulnerabilities (18 moderate, 6 high)
```

Toutes dans des dépendances de NestJS (`@nestjs/core`, `@nestjs/platform-express`...),
rien dans mon code. Je fais pas `npm audit fix --force` parce que ça casse des versions
majeures de Nest. En prod il faudrait juste suivre les mises à jour de Nest.

## Avant la prod

- Sortir le `JWT_SECRET` du code (variable d'env)
- CORS sur le vrai domaine
- HTTPS
- Monter les versions de Nest
- Un cron pour virer les fichiers expirés du disque (pour l'instant le lien est
  bloqué mais le fichier reste là)
