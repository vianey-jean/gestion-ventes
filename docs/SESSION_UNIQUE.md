# Session unique par profil (`connecte-profil-unique.json`)

Ce module garantit qu'un profil (sauf **administrateur principal**) ne peut être
connecté que sur **un seul appareil / navigateur à la fois**, et conserve
l'historique complet des connexions et déconnexions.

## Architecture (MVC)

| Couche | Fichier | Rôle |
| --- | --- | --- |
| Model | `server/models/ConnecteProfilUnique.js` | Lecture/écriture chiffrée de `server/db/connecte-profil-unique.json`, empreinte d'appareil (IP + navigateur + OS + appareil + clé client), helpers de session |
| Controller | `server/controllers/connecteProfilUniqueController.js` | Logique métier : détection de conflit, demandes de déconnexion, expirations, notifications |
| Routes | `server/routes/connecteProfilUnique.js` | Mapping HTTP → contrôleur (aucune logique) |
| Service (front) | `src/services/api/connecteProfilUniqueApi.ts` | Appels API + détection navigateur/OS/fuseau + clé d'appareil persistée |
| Controller (front) | `src/hooks/useSessionUnique.ts` | Heartbeat 2 s, déconnexion forcée, demandes et notifications |
| Vues (front) | `src/pages/SessionConflictPage.tsx`, `src/components/auth/SessionUniqueWatcher.tsx` | Choix auto/manuel lors d'un conflit, notification globale de demande de déconnexion |

## Endpoints

| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/api/connecte-profil-unique/check` | Le profil peut-il se connecter ici ? Retourne `allowed`, `principal`, `conflict` |
| POST | `/api/connecte-profil-unique/register-login` | Enregistre la connexion (date, heure, IP, navigateur, OS, fuseau) et retourne un `sessionId` |
| POST | `/api/connecte-profil-unique/logout` | Enregistre l'heure de déconnexion |
| POST | `/api/connecte-profil-unique/request-logout` | Demande de déconnexion distante (`mode: 'auto' \| 'manuel'`) |
| GET | `/api/connecte-profil-unique/request-status/:requestId` | État de la demande : `pending`, `granted`, `granted_timeout`, `refused` |
| POST | `/api/connecte-profil-unique/respond-logout` | Réponse du poste distant (`accept: true/false`) |
| POST | `/api/connecte-profil-unique/poll` | Heartbeat : déconnexion forcée, demande en attente, notifications |
| GET | `/api/connecte-profil-unique/actives` | Sessions actives |
| GET / DELETE | `/api/connecte-profil-unique` | Historique complet / réinitialisation |

## Déroulé fonctionnel

1. **Connexion** — l'email et le mot de passe sont vérifiés comme avant. En cas de
   succès, `check` est appelé avant d'ouvrir la session.
2. **Même appareil** — si le profil se reconnecte depuis la même IP + le même
   navigateur, seule une nouvelle **heure de connexion** est ajoutée à son
   historique existant.
3. **Autre appareil** — l'utilisateur est redirigé vers `/session-conflict` qui
   affiche l'IP, le navigateur, l'OS, le fuseau et l'heure de la session en cours,
   avec deux choix :
   - **Déconnexion automatique** : la session distante est fermée immédiatement,
     l'historique est mis à jour et la nouvelle session s'ouvre vers `/dashboard`.
   - **Déconnexion manuelle** : le poste distant reçoit une notification
     (rappel toutes les 5 s, visible sur toutes les pages) avec *Confirmer* ou
     *Refuser*.
     - *Confirmer* → déconnexion immédiate côté distant, connexion automatique
       côté demandeur.
     - *Refuser* → le demandeur revient au login avec le message
       « la demande de déconnexion a été refusée ».
     - *Aucune réponse en 5 minutes* → déconnexion forcée du poste distant
       (`granted_timeout`) puis connexion automatique du demandeur.
4. **Administrateur principal** — connexions multiples autorisées. Chaque nouvelle
   connexion enregistre l'historique et envoie une notification à toutes ses
   autres sessions actives (IP, navigateur, heure de connexion, fuseau horaire).
5. **Déconnexion** — `AuthContext.logout()` appelle `/logout` pour horodater la
   fin de session dans la base.

## Synchronisation

Le heartbeat (`/poll`) tourne toutes les **2 secondes** côté session connectée et
le suivi de demande (`/request-status`) toutes les **1,5 seconde** côté demandeur :
un clic sur un bouton est donc répercuté sur l'autre navigateur quasi
instantanément. La route `/api/connecte-profil-unique` est exemptée du
rate-limit global (`server/server.js`) pour garantir la stabilité du polling.

## Structure d'une entrée

```json
{
  "id": "cpu_xxx",
  "userId": "1",
  "email": "admin@exemple.com",
  "nom": "Nom Prénom",
  "role": "administrateur principale",
  "ip": "1.2.3.4",
  "browser": "Firefox",
  "os": "Windows",
  "device": "Desktop",
  "timezone": "Indian/Reunion",
  "deviceKey": "ip|navigateur|os|appareil|cléClient",
  "currentSessionId": "sess_xxx",
  "active": true,
  "historique": [
    { "sessionId": "sess_xxx", "dateConnexion": "07/08/2026", "heureConnexion": "09:12:33",
      "dateDeconnexion": "07/08/2026", "heureDeconnexion": "11:04:02", "motif": "deconnexion_manuelle" }
  ],
  "logoutRequest": null,
  "notifications": []
}
```
