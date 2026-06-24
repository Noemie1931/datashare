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
- Connexion réussie : renvoie un token
- Mauvais mot de passe : `UnauthorizedException`
- Utilisateur inexistant : `UnauthorizedException`

**Utilisateurs (`users.service`)**
- Création d'un utilisateur
- Email déjà pris : `ConflictException`

**Fichiers (`files.service`)**
- Upload : renvoie l'entité `FileEntity`
- Recherche par token : renvoie le fichier correspondant
- Token inconnu : `NotFoundException`
- Suppression : se fait sans erreur
- Suppression d'un fichier inexistant : `NotFoundException`

Au total **18 tests**, tous au vert (3 suites).

## Couverture

```
File                | % Stmts | % Lines |
--------------------|---------|---------|
All files           |   79.4  |   82.0  |
  auth.service.ts   |   92.0  |   90.5  |
  users.service.ts  |  100.0  |  100.0  |
  files.service.ts  |   95.7  |   95.2  |
```

L'objectif fixé était 70%, donc c'est atteint. La moyenne globale est un peu tirée
vers le bas par les fichiers de configuration (modules, `main.ts`, stratégie JWT) qui
ne contiennent pas de logique à tester — les services métier, eux, sont au-dessus de
90%.

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
