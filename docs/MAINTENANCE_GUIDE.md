# 🛠️ Guide de maintenance

## Mode maintenance
`ProfilePage → Paramètres → Maintenance` (`MaintenanceSection`) écrit dans `maintenance.json`. `MaintenanceGate` redirige alors les utilisateurs vers `MaintenancePage`, les administrateurs conservant l'accès.

## Sauvegardes
- Automatique : piloté par `auto-sauvegarde.json`.
- Manuelle : archiver `server/db` et `server/uploads`.
- Restauration : arrêter le serveur, remplacer les fichiers, redémarrer.

## Surveillance
- Journal des connexions : `historique-connexion.json` (affiché en temps réel dans le profil).
- Tentatives bloquées : `tentativeblocage.json`. Inactivité : `timeoutinactive.json`.
- Corbeille pointages : `pointageDeleted.json`.

## Incidents fréquents
| Symptôme | Cause probable | Action |
|---|---|---|
| 401 en boucle | JWT expiré ou `JWT_SECRET` modifié | se reconnecter ; vérifier la variable serveur |
| Données non rafraîchies | flux SSE coupé | vérifier `/api/sync/events` et `RealtimeStatus` |
| Erreur CORS | domaine absent de la whitelist | ajouter l'origine dans la configuration serveur |
| Upload refusé | format ou taille non autorisés | vérifier `upload.js` / `uploadAchat.js` |
| Page blanche | erreur runtime | consulter la console, l'`ErrorBoundary` affiche le détail |

## Hygiène du code
Un composant > 400 lignes doit être découpé ; tout nouveau fichier JSON doit être ajouté à `sync.js` ; toute nouvelle fonctionnalité doit être reportée dans `docs/`.

