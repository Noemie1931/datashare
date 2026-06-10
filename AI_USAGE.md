# Utilisation de l'IA dans le développement

## US concernée : US05 — Consultation de l'historique (MySpacePage)

### Tâches confiées à l'IA (Claude)
- Génération du composant MySpacePage.tsx avec filtres Tout/Actifs/Expirés
- Implémentation de la logique de suppression avec confirmation
- Génération de la fonction copyLink pour partager les liens

### Rôle de supervision
- Relecture complète du code avant intégration
- Vérification sécurité : DELETE vérifie que l'utilisateur est propriétaire
- Ajout gestion d'erreur manquante dans les appels API

### Correctifs apportés
- Token JWT absent dans les headers → corrigé via intercepteur Axios
- Format date ISO → reformaté en français
