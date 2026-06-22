# SECURITY.md — Sécurité DataShare

## Scan de sécurité

\`\`\`bash
npm audit
\`\`\`


## Mesures de sécurité implémentées

| Mesure | Détail |
|---|---|
| Authentification JWT | Tokens signés avec secret, expiration 7 jours |
| Hashage mots de passe | bcrypt avec salt factor 10 |
| Validation des fichiers | Taille max 1Go, types contrôlés |
| CORS | Limité à http://localhost:5173 |
| Tokens de téléchargement | UUID v4 non prédictible |
| Expiration automatique | Fichiers supprimés après 7 jours |

## Résultats npm audit

Lancer `npm audit` dans le dossier backend pour voir les vulnérabilités.

## Décisions

- Les vulnérabilités de faible sévérité des dépendances de développement sont acceptées.
- Le JWT_SECRET doit être changé en production.
- En production, CORS doit être limité au domaine de production.
