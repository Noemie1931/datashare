# Sécurité — DataShare

## Ce qui est en place

| Mesure | Détail |
|---|---|
| Authentification | JWT signé, token valable 7 jours |
| Mots de passe | hashés avec bcrypt (10 rounds), jamais stockés en clair |
| Liens de téléchargement | token UUID v4, impossible à deviner |
| Mot de passe sur un fichier | optionnel, également hashé bcrypt |
| Upload | taille limitée à 1 Go |
| Expiration | les fichiers sont supprimés après 1 à 7 jours selon le choix |
| CORS | restreint à `http://localhost:5173` en dev |

## npm audit

Lancé dans `backend/` :

```
24 vulnerabilities (18 moderate, 6 high)
```

Elles viennent toutes de dépendances transitives de NestJS (`@nestjs/core`,
`@nestjs/platform-express`, etc.), pas de mon code. Je ne lance pas `npm audit fix --force`
car ça casserait des versions majeures de NestJS pour un projet pédagogique. En conditions
réelles il faudrait suivre les mises à jour de NestJS et monter de version quand un correctif
est dispo.

## À faire avant une mise en production

- Changer le `JWT_SECRET` (actuellement en dur, à passer en variable d'environnement)
- Limiter le CORS au vrai domaine de prod
- Servir le tout en HTTPS
- Mettre à jour les dépendances NestJS vulnérables
