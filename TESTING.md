# Plan de tests — DataShare

J'ai concentré les tests unitaires sur la logique métier : l'authentification, la
gestion des utilisateurs et celle des fichiers. C'est là que se trouvent les règles
importantes (hash du mot de passe, unicité de l'email, vérification du token) et donc
le plus de risques de régression.

## Tests unitaires

Les services sont testés avec Jest, en mockant le repository TypeORM pour ne pas
dépendre de la base.

**Authentification (`auth.service`)**
- Inscription : renvoie bien l'utilisateur et un token JWT
- Inscription avec un email invalide : `BadRequestException`
- Inscription avec un mot de passe trop court : `BadRequestException`
- Connexion réussie : renvoie un token
- Mauvais mot de passe : `UnauthorizedException`
- Utilisateur inexistant : `UnauthorizedException`
- Identifiants vides : `UnauthorizedException`

**Utilisateurs (`users.service`)**
- Création d'un utilisateur
- Email déjà pris : `ConflictException`

**Fichiers (`files.service`)**
- Upload : renvoie l'entité `FileEntity`
- Upload avec un mot de passe trop court : `BadRequestException`
- Recherche par token : renvoie le fichier correspondant
- Token inconnu : `NotFoundException`
- Filtres tous / actifs / expirés
- Vérification du mot de passe (avec et sans mot de passe)
- Suppression (avec et sans fichier physique sur le disque)
- Suppression d'un fichier inexistant : `NotFoundException`
- Refus d'un fichier exécutable même renommé (vérification du magic number)

**Contrôleur de fichiers (`files.controller`)** — la logique de la route publique de téléchargement
- Lien expiré : `ForbiddenException` (403)
- Mauvais mot de passe de fichier : `ForbiddenException` (403)
- Téléchargement réussi (avec et sans mot de passe)
- Upload (renvoie le lien), liste et suppression des fichiers

Au total **39 tests**, tous au vert (4 suites).

## Couverture

```
File                | % Stmts | % Lines |
--------------------|---------|---------|
All files           |   89.2  |   91.0  |
  auth.service.ts   |  100.0  |  100.0  |
  users.service.ts  |  100.0  |  100.0  |
  files.service.ts  |  100.0  |  100.0  |
  jwt-auth.guard.ts |  100.0  |  100.0  |
```

Les trois services métier sont à 100%. La moyenne globale (89%) est tirée vers le bas
par les fichiers de configuration (modules, `main.ts`, stratégie JWT, contrôleurs) qui ne
contiennent pas de logique métier à mesurer. L'objectif de 70% est largement dépassé.

## Tests end-to-end (Cypress)

Trois parcours côté navigateur pour valider que les pages répondent :

- La page d'accueil s'affiche et propose de se connecter
- Le formulaire de connexion est bien présent et utilisable
- Un lien de téléchargement invalide affiche le bon message d'erreur

## Lancer les tests

```bash
# unitaires
cd backend && npm run test

# avec le rapport de couverture
cd backend && npm run test:cov

# end-to-end
cd frontend && npx cypress run --browser chrome
```
