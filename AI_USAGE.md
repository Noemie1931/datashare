# Utilisation de l'IA dans le développement

## Posture adoptée

J'ai utilisé un copilote IA principalement en **binômage** (pair-programming), et
ponctuellement comme un **développeur junior** à qui je confie une tâche cadrée puis dont
je relis et valide le travail. Dans tous les cas, c'est moi qui définis le besoin, qui
décide de ce qui est intégré, et qui valide le comportement final : l'IA propose, je
dispose.

## Tâches confiées à l'IA

**Développement de fonctionnalité — US05 (Mon espace)**
- Composant `MySpacePage` avec les filtres Tout / Actifs / Expirés
- Logique de suppression avec confirmation
- Fonction de copie du lien de partage

**Phase de durcissement et de finalisation**
- Écriture de tests (unitaires, intégration, end-to-end) sur les parties critiques
- Renforcement de la sécurité : validation du type de fichier par *magic number*,
  plafonnement de la durée d'expiration côté serveur
- Purge automatique des fichiers expirés (tâche planifiée / cron)

## Traçabilité dans l'historique Git (workflow IA → revue humaine)

Pour rendre la délégation **vérifiable**, la contribution de l'IA est isolée dans des
commits dédiés (convention *conventional commit*), suivis de ma revue humaine :

- `feat(ai): bouton "Copier le lien" dans Mon espace (US05, copilote IA)` (`7876458`)
  — première implémentation générée par le copilote IA.
- `fix: revue humaine du bouton "Copier le lien" (repli presse-papier + accessibilité)`
  (`c62e629`) — ma relecture : repli `textarea`/`execCommand` quand la Clipboard API est
  indisponible (contexte non sécurisé), annonce `aria-live` pour les lecteurs d'écran,
  nettoyage du minuteur au démontage du composant.
- `test: parcours Cypress couvre le bouton "Copier le lien" de Mon espace (US05)`
  (`4a590fc`) — vérification automatisée du parcours (copie + retour « Lien copié »).

Ce triptyque **IA → revue → test** illustre concrètement la posture : l'IA propose,
je relis et corrige, je vérifie.

## Rôle de supervision

- Je définis chaque tâche et son périmètre avant de la confier.
- Je valide le **comportement** de l'application (parcours testés : création de compte,
  upload, download, suppression, partage) avant d'intégrer.
- Je vérifie la **sécurité** : contrôle du propriétaire à la suppression, refus des
  exécutables, validation côté serveur des entrées.
- J'exécute les tests et je contrôle la couverture.
- Je tranche sur ce qui est gardé, adapté ou écarté.

## Correctifs et ajustements apportés

- Token JWT absent des en-têtes → corrigé via l'intercepteur Axios.
- Format de date ISO → reformaté en français.
- Choix de **bloquer les exécutables** par leur contenu réel plutôt qu'une liste blanche
  stricte, plus adapté à un service de partage généraliste.
- Harmonisation des chiffres (nombre de tests, couverture) entre le code et les documents.

## Apports et limites constatés

- **Apports** : gain de temps sur le code répétitif et les tests, suggestions de cas
  limites pertinents (fichier exécutable renommé, lien expiré, mot de passe incorrect),
  aide à la rédaction de la documentation.
- **Limites** : quelques incohérences à corriger, et la nécessité de **toujours relire**,
  surtout la sécurité. L'IA accélère, mais ne remplace ni la compréhension ni la
  validation humaine — c'est la supervision qui garantit la qualité finale.
