# Sécurité — DataShare

## Ce qui est en place

| Mesure | Détail |
|---|---|
| Authentification | JWT signé, token valable 7 jours |
| Mots de passe | hashés avec bcrypt (10 rounds), jamais stockés en clair |
| Liens de téléchargement | token UUID v4, impossible à deviner |
| Mot de passe sur un fichier | optionnel, également hashé bcrypt |
| Upload | taille limitée à 1 Go (limite Multer) |
| Type de fichier | inspection du **contenu réel** (magic number), pas de l'extension : les exécutables (MZ/ELF/Mach-O, scripts `#!`) sont refusés même renommés en `.txt` |
| Expiration | passé 1 à 7 jours (selon le choix), le lien est refusé au téléchargement |
| CORS | restreint à `http://localhost:5173` en dev |
| Identifiants vides | refusés côté client et côté serveur |
| Token invalide ou expiré | une réponse 401 déconnecte automatiquement et renvoie vers la connexion |

## npm audit

Lancé dans `backend/` :

```
24 vulnerabilities (18 moderate, 6 high)
```

Elles concernent toutes des dépendances de NestJS (`@nestjs/core`,
`@nestjs/platform-express`...), pas mon propre code. Je n'ai pas lancé
`npm audit fix --force` car cela casserait des versions majeures de Nest. En production,
il suffirait de suivre les mises à jour de NestJS et de monter de version dès qu'un
correctif est disponible.

## Avant une mise en production

- Sortir le `JWT_SECRET` du code et le passer en variable d'environnement
- Restreindre le CORS au vrai domaine de production
- Passer le tout en HTTPS
- Monter les versions de NestJS pour corriger les vulnérabilités
- Ajouter un cron qui supprime les fichiers expirés du disque : pour l'instant le lien
  est bloqué après expiration, mais le fichier reste stocké sur le serveur
