# 🔌 Référence API

Base URL : `VITE_API_BASE_URL` (défaut `https://server-gestion-ventes.onrender.com`).
Authentification : en-tête `Authorization: Bearer <token>` ajouté automatiquement par l'intercepteur de `src/services/api/api.ts`.
Timeout : 30 s. Retry : 2 tentatives (backoff 2 s puis 4 s) sur erreur réseau ou 503. Un 401 purge le stockage local et émet `auth:logout`.

## 1. Endpoints exposés par le serveur

### /api/attribut-kinds

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/api/attribut-kinds` | JWT |
| POST | `/api/attribut-kinds` | JWT |
| PUT | `/api/attribut-kinds/:id` | JWT |
| DELETE | `/api/attribut-kinds/:id` | JWT |
| GET | `/api/attribut-kinds/:id/values` | JWT |
| POST | `/api/attribut-kinds/:id/values` | JWT |
| PUT | `/api/attribut-kinds/:id/values/:vid` | JWT |
| DELETE | `/api/attribut-kinds/:id/values/:vid` | JWT |

### auth.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/verify` | public |
| GET | `/health` | public |
| POST | `/login` | public |
| POST | `/check-email` | public |
| POST | `/register` | public |
| POST | `/reset-password-request` | public |
| POST | `/reset-password` | public |

### /api/availability

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/api/availability/slots` | JWT |
| GET | `/api/availability/check` | JWT |

### avance.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### banks.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### benefices.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/product/:productId` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### clients.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/merge` | JWT |

### clientsVilles.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:original` | JWT |
| DELETE | `/:ville` | JWT |

### commandes.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/expiring-soon` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### compta.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/monthly/:year/:month` | public |
| GET | `/yearly/:year` | public |
| GET | `/summary/:year` | public |
| POST | `/calculate/:year/:month` | public |
| POST | `/recalculate/:year` | public |

### confirmationRdv.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `/sync` | JWT |
| PATCH | `/:id` | JWT |

### depenses.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/mouvements` | JWT |
| GET | `/mouvements/:id` | JWT |
| POST | `/mouvements` | JWT |
| PUT | `/mouvements/:id` | JWT |
| DELETE | `/mouvements/:id` | JWT |
| GET | `/fixe` | JWT |
| PUT | `/fixe` | JWT |
| POST | `/reset` | JWT |
| GET | `/check-month` | JWT |
| GET | `/rsa` | JWT |
| PUT | `/rsa` | JWT |
| POST | `/auto-entries` | JWT |

### encryption.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/status` | JWT |
| POST | `/activate` | JWT |
| POST | `/deactivate` | JWT |
| POST | `/change-key` | JWT |

### entreprise.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### fidelite.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/:name` | public |
| POST | `/rebuild` | public |

### fournisseurs.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/search` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### historiqueConnexion.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| POST | `/visit` | public |
| DELETE | `` | public |

### indisponible.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| DELETE | `/group/:groupId` | JWT |
| POST | `/check` | JWT |

### listesFidelite.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| PUT | `` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### livraisonVille.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:ville` | JWT |
| DELETE | `/:ville` | JWT |

### maintenance.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/status` | public |
| POST | `/check-admin` | public |
| PUT | `/toggle` | JWT |
| GET | `/scheduled` | JWT |
| POST | `/scheduled` | JWT |
| PUT | `/scheduled/:id` | JWT |
| DELETE | `/scheduled/:id` | JWT |

### messagerie.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/events` | public |
| GET | `/admin-status` | public |
| GET | `/admin-users` | JWT |
| GET | `/admin-conversations` | JWT |
| GET | `/admin-messages/:otherAdminId` | JWT |
| POST | `/admin-send` | JWT |
| PUT | `/admin-mark-read/:otherAdminId` | JWT |
| GET | `/admin-unread-count` | JWT |
| GET | `/conversations` | JWT |
| GET | `/messages/:visitorId/:adminId` | public |
| POST | `/send` | public |
| POST | `/typing` | public |
| POST | `/admin-typing` | public |
| PUT | `/mark-read/:visitorId/:adminId` | public |
| GET | `/unread-count/:adminId` | public |
| PUT | `/edit/:messageId` | public |
| DELETE | `/delete/:messageId` | public |
| DELETE | `/admin-delete-own/:messageId` | JWT |
| DELETE | `/admin-hide/:messageId` | JWT |
| POST | `/like/:messageId` | public |
| POST | `/group/create` | JWT |
| GET | `/groups` | JWT |
| GET | `/visitor-groups/:visitorId` | public |
| GET | `/visitor-group-messages/:groupId/:visitorId` | public |
| POST | `/visitor-group-send` | public |
| PUT | `/visitor-group-mark-read/:groupId/:visitorId` | public |
| POST | `/visitor-group-typing` | public |
| GET | `/group-messages/:groupId` | JWT |
| POST | `/group-send` | JWT |
| PUT | `/group-mark-read/:groupId` | JWT |
| PUT | `/group/rename/:groupId` | JWT |
| POST | `/group-typing` | JWT |

### messages.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `` | public |
| GET | `` | JWT |
| GET | `/unread-count` | JWT |
| PUT | `/:id/read` | JWT |
| PUT | `/:id/unread` | JWT |
| DELETE | `/:id` | JWT |

### moduleSettings.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:module` | JWT |
| PUT | `/:module` | JWT |

### notes.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `/upload-fichier` | JWT |
| POST | `/upload-fichiers` | JWT |
| DELETE | `/fichier` | JWT |
| POST | `/upload-drawing` | JWT |
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| PUT | `/:id/move` | JWT |
| PUT | `/batch/reorder` | JWT |
| GET | `/columns` | JWT |
| POST | `/columns` | JWT |
| PUT | `/columns/:id` | JWT |
| DELETE | `/columns/:id` | JWT |

### notesShare.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `/generate` | JWT |
| DELETE | `/revoke` | JWT |
| GET | `/view/:token` | public |

### nouvelleAchat.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `/depense/upload-receipt` | JWT |
| POST | `/achat/upload-receipt` | JWT |
| GET | `` | JWT |
| GET | `/monthly/:year/:month` | JWT |
| GET | `/yearly/:year` | JWT |
| GET | `/stats/monthly/:year/:month` | JWT |
| GET | `/stats/yearly/:year` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| POST | `/depense` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### objectif.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/historique` | JWT |
| PUT | `/objectif` | JWT |
| POST | `/recalculate` | JWT |
| POST | `/save-monthly` | JWT |
| POST | `/reset` | JWT |

### parametres.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/prixpointage` | JWT |
| PUT | `/prixpointage` | JWT |
| GET | `/parametretache` | JWT |
| PUT | `/parametretache` | JWT |

### pointage.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### pointageAuto.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### pointageAutoDeclanche.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PATCH | `/:id` | JWT |
| DELETE | `/cleanup` | JWT |

### pointageAutoSessions.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PATCH | `/:id` | JWT |
| DELETE | `/cleanup` | JWT |

### pointageDeleted.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `` | JWT |

### prepaLivraison.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `/sync` | JWT |
| PATCH | `/:id` | JWT |

### pretfamilles.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| GET | `/search/nom` | JWT |

### pretproduits.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/search` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/transfer` | JWT |

### prixproducts.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/product/:productId` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### productAttributes.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### productComments.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/ratings` | public |
| GET | `/product/:productId` | public |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/bulk` | JWT |
| DELETE | `/:id` | JWT |
| DELETE | `/product/:productId` | JWT |

### products.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| POST | `/generate-codes` | JWT |
| GET | `/search` | public |
| GET | `/:id` | public |
| POST | `` | JWT |
| POST | `/with-photos` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| PATCH | `/:id/quantity` | JWT |
| PATCH | `/:id/achats/:index/disponibilite` | JWT |
| PUT | `/:id/achats/:index` | JWT |
| DELETE | `/:id/achats/:index` | JWT |
| PUT | `/:id/ventes/:index` | JWT |
| DELETE | `/:id/ventes/:index` | JWT |
| POST | `/:id/image` | JWT |
| POST | `/:id/photos` | JWT |
| PUT | `/:id/photos` | JWT |
| DELETE | `/:id/photos/:photoIndex` | JWT |
| POST | `/merge` | JWT |

### productsVendu.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |

### profile.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| PUT | `` | JWT |
| POST | `/photo` | JWT |
| PUT | `/password` | JWT |
| GET | `/security-settings` | JWT |
| PUT | `/security-settings` | JWT |
| GET | `/timeout-settings` | JWT |
| PUT | `/timeout-settings` | JWT |

### rdv.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/search` | JWT |
| GET | `/search-clients` | JWT |
| GET | `/week` | JWT |
| GET | `/conflicts` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| PUT | `/by-commande/:commandeId` | JWT |
| DELETE | `/:id` | JWT |
| DELETE | `/by-commande/:commandeId` | JWT |

### rdvNotifications.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/unread` | JWT |
| GET | `/count` | JWT |
| POST | `/check` | JWT |
| PUT | `/:id/read` | JWT |
| DELETE | `/:id` | JWT |
| GET | `/by-rdv/:rdvId` | JWT |
| PUT | `/status/:rdvId` | JWT |
| PUT | `/by-rdv/:rdvId` | JWT |
| DELETE | `/by-rdv/:rdvId` | JWT |

### rdvTaches.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/free-slots` | public |
| POST | `` | public |
| PUT | `/by-commande/:commandeId` | public |
| DELETE | `/by-commande/:commandeId` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### remboursements.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/by-month` | JWT |
| GET | `/search-sales` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### sales.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/by-month` | JWT |
| GET | `/by-year` | JWT |
| GET | `/yearly-stats` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/export-month` | JWT |

### settings.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/users` | JWT |
| PUT | `/user-role` | JWT |
| DELETE | `/user/:id` | JWT |
| PUT | `/user-specification` | JWT |
| PUT | `` | JWT |
| POST | `/backup` | JWT |
| POST | `/restore` | JWT |
| POST | `/delete-all` | JWT |
| POST | `/bulk-delete` | JWT |
| GET | `/bulk-data` | JWT |
| POST | `/auto-backup` | JWT |
| POST | `/verify-password` | JWT |
| GET | `/auto-sauvegarde` | JWT |
| PUT | `/auto-sauvegarde` | JWT |
| GET | `/auto-injecter` | JWT |
| PUT | `/auto-injecter` | JWT |
| GET | `/needs-injection` | JWT |

### shareComments.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `/submit/:token` | public |
| POST | `/send/:id` | public |
| GET | `/check/:token` | public |
| GET | `/list` | JWT |
| GET | `/unread` | JWT |
| PATCH | `/read/:id` | JWT |
| GET | `/detail/:id` | JWT |
| GET | `/snapshot/:filename` | JWT |
| POST | `/sync-html` | JWT |
| POST | `/import-json` | JWT |
| DELETE | `/delete/:id` | JWT |
| GET | `/export-json` | JWT |

### shareLinks.js

| Méthode | Chemin | Auth |
|---|---|---|
| POST | `/generate` | JWT |
| GET | `/list` | JWT |
| DELETE | `/revoke/:id` | JWT |
| POST | `/verify/:token` | public |
| GET | `/view/:token` | public |

### sync.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `/events` | public |
| POST | `/force-sync` | JWT |
| GET | `/status` | public |
| GET | `/test` | public |

### tache.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/:id` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| PUT | `/by-commande/:commandeId` | public |
| DELETE | `/:id` | public |
| DELETE | `/by-commande/:commandeId` | public |

### tachesRdv.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### travailleur.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### versement.js

| Méthode | Chemin | Auth |
|---|---|---|
| GET | `` | JWT |
| PUT | `/max` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

## 2. Services front correspondants

### `src/services/api/api.ts`

- **Appels HTTP** : —

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/attributKindsApi.ts`

- **Appels HTTP** : `GET /api/attribut-kinds`, `POST /api/attribut-kinds`, `PUT /api/attribut-kinds/${id}`, `DELETE /api/attribut-kinds/${id}`, `GET /api/attribut-kinds/${kindId}/values`, `POST /api/attribut-kinds/${kindId}/values`, `PUT /api/attribut-kinds/${kindId}/values/${vid}`, `DELETE /api/attribut-kinds/${kindId}/values/${vid}`

| Méthode | Signature | Retour |
|---|---|---|
| `listKinds` | `()` | `AttributeKindDef[]` |
| `createKind` | `(nom: string, color?: string)` | `AttributeKindDef` |
| `renameKind` | `(id: string, nom: string)` | `AttributeKindDef` |
| `updateKind` | `(id: string, patch: Partial<AttributeKindDef>)` | `AttributeKindDef` |
| `deleteKind` | `(id: string)` | `boolean` |
| `listValues` | `(kindId: string)` | `AttributeValue[]` |
| `addValue` | `(kindId: string, nom: string, description?: string)` | `AttributeValue` |
| `updateValue` | `(kindId: string, vid: string, patch: Partial<AttributeValue>)` | `AttributeValue` |
| `deleteValue` | `(kindId: string, vid: string)` | `boolean` |

### `src/services/api/authApi.ts`

- **Appels HTTP** : `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/check-email`, `POST /api/auth/reset-password`, `POST /api/auth/reset-password-request`, `GET /api/auth/verify`

| Méthode | Signature | Retour |
|---|---|---|
| `login` | `(credentials: LoginCredentials)` | `AuthResponse` |
| `register` | `(credentials: RegisterCredentials)` | `AuthResponse` |
| `checkEmail` | `(email: string)` | `{ exists: boolean }` |
| `resetPassword` | `(email: string)` | `{ success: boolean }` |
| `resetPasswordRequest` | `(data: { email: string })` | `boolean` |
| `verifyToken` | `()` | `{ user: User }` |

### `src/services/api/availabilityApi.ts`

- **Appels HTTP** : —

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/avanceApi.ts`

- **Appels HTTP** : `DELETE /api/avances/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/beneficeApi.ts`

- **Appels HTTP** : `GET /api/benefices`, `GET /api/benefices/product/${productId}`, `POST /api/benefices`, `PUT /api/benefices/${id}`, `DELETE /api/benefices/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Benefice[]` |
| `getByProductId` | `(productId: string)` | `Benefice \| null` |
| `create` | `(data: Omit<Benefice, 'id'>)` | `Benefice` |
| `update` | `(id: string, data: Partial<Benefice>)` | `Benefice` |
| `delete` | `(id: string)` | `boolean` |

### `src/services/api/clientApi.ts`

- **Appels HTTP** : `GET /api/clients`, `GET /api/clients/${id}`, `POST /api/clients`, `PUT /api/clients/${id}`, `DELETE /api/clients/${id}`, `GET /api/clients/search?q=${encodeURIComponent(query)}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Client[]` |
| `getById` | `(id: string)` | `Client` |
| `create` | `(data: ClientFormData)` | `Client` |
| `update` | `(id: string, data: Partial<ClientFormData>)` | `Client` |
| `delete` | `(id: string)` | `boolean` |
| `search` | `(query: string)` | `Client[]` |

### `src/services/api/commandeApi.ts`

- **Appels HTTP** : `GET /api/commandes`, `GET /api/commandes/${id}`, `POST /api/commandes`, `PUT /api/commandes/${id}`, `DELETE /api/commandes/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Commande[]` |
| `getById` | `(id: string)` | `Commande` |
| `create` | `(data: CommandeFormData)` | `Commande` |
| `update` | `(id: string, data: Partial<Commande>)` | `Commande` |
| `delete` | `(id: string)` | `boolean` |
| `updateStatus` | `(id: string, statut: string)` | `Commande` |
| `markNotificationSent` | `(id: string)` | `Commande` |

### `src/services/api/comptaApi.ts`

- **Appels HTTP** : `GET /api/compta`, `GET /api/compta/monthly/${year}/${month}`, `GET /api/compta/yearly/${year}`, `GET /api/compta/summary/${year}`, `POST /api/compta/calculate/${year}/${month}`, `POST /api/compta/recalculate/${year}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `ComptaMonthData[]` |
| `getByMonthYear` | `(year: number, month: number)` | `ComptaMonthData` |
| `getByYear` | `(year: number)` | `ComptaMonthData[]` |
| `getYearlySummary` | `(year: number)` | `ComptaYearlySummary` |
| `calculateMonth` | `(year: number, month: number)` | `ComptaMonthData` |
| `recalculateYear` | `(year: number)` | `{ year: number; months: number; data: ComptaMonthData[] }` |

### `src/services/api/confirmationRdvApi.ts`

- **Appels HTTP** : `GET /api/confirmation-rdv`, `POST /api/confirmation-rdv/sync`, `PATCH /api/confirmation-rdv/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `ConfirmationRdvEntry[]` |
| `sync` | `(entries: RDV[])` | `ConfirmationRdvEntry[]` |
| `update` | `( id: string, payload: { confirmationStatut: 'maintenu' \| 'annule' \| 'reporter'; date?: string; heureDebut?: string; heureFin?: string } )` | `ConfirmationRdvEntry` |

### `src/services/api/depenseApi.ts`

- **Appels HTTP** : `GET /api/depenses/mouvements`, `POST /api/depenses/mouvements`, `PUT /api/depenses/mouvements/${id}`, `DELETE /api/depenses/mouvements/${id}`, `POST /api/depenses/reset`, `GET /api/depenses/fixe`, `PUT /api/depenses/fixe`

| Méthode | Signature | Retour |
|---|---|---|
| `getMouvements` | `()` | `DepenseDuMois[]` |
| `createMouvement` | `(data: Omit<DepenseDuMois, 'id'>)` | `DepenseDuMois` |
| `updateMouvement` | `(id: string, data: Partial<DepenseDuMois>)` | `DepenseDuMois` |
| `deleteMouvement` | `(id: string)` | `boolean` |
| `resetMouvements` | `()` | `boolean` |
| `getDepensesFixe` | `()` | `DepenseFixe` |
| `updateDepensesFixe` | `(data: Partial<DepenseFixe>)` | `DepenseFixe` |

### `src/services/api/entrepriseApi.ts`

- **Appels HTTP** : `DELETE /api/entreprises/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/fideliteApi.ts`

- **Appels HTTP** : `GET /api/sales`, `GET /api/fidelite`, `GET /api/fidelite/${encodeURIComponent(name)}`, `POST /api/fidelite/rebuild`

| Méthode | Signature | Retour |
|---|---|---|
| `async` | `()` | `any[]` |
| `getAll` | `()` | `Record<string, FideliteEntry` |
| `getByName` | `(name: string)` | `FideliteEntry` |
| `rebuild` | `()` | `void` |

### `src/services/api/fournisseurApi.ts`

- **Appels HTTP** : `GET /api/fournisseurs`, `GET /api/fournisseurs/search?q=${encodeURIComponent(query)}`, `POST /api/fournisseurs`, `DELETE /api/fournisseurs/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Fournisseur[]` |
| `search` | `(query: string)` | `Fournisseur[]` |
| `create` | `(nom: string)` | `Fournisseur` |
| `delete` | `(id: string)` | `boolean` |

### `src/services/api/historiqueConnexionApi.ts`

- **Appels HTTP** : `POST /api/historique-connexion/visit`, `DELETE /api/historique-connexion`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/indisponibleApi.ts`

- **Appels HTTP** : `GET /api/indisponible`, `POST /api/indisponible`, `PUT /api/indisponible/${id}`, `DELETE /api/indisponible/${id}`, `DELETE /api/indisponible/group/${groupId}`, `POST /api/indisponible/check`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Indisponibilite[]` |
| `create` | `(data: { date: string; heureDebut?: string; heureFin?: string; motif?: string; journeeComplete?: boolean; exception?: boolean; recurrence?: 'once' \| 'weekly'; nombreSemaines?: number; })` | `Indisponibilite[]` |
| `update` | `(id: string, data: { date?: string; heureDebut?: string; heureFin?: string; motif?: string; journeeComplete?: boolean; exception?: boolean; selectedDates?: string[]; })` | `Indisponibilite \| Indisponibilite[]` |
| `delete` | `(id: string)` | `void` |
| `deleteGroup` | `(groupId: string)` | `void` |
| `checkDisponibilite` | `( date: string, heureDebut?: string, heureFin?: string )` | `DisponibiliteCheck` |

### `src/services/api/listesFideliteApi.ts`

- **Appels HTTP** : `GET /api/listes-fidelite`, `POST /api/listes-fidelite`, `PUT /api/listes-fidelite/${encodeURIComponent(id)}`, `DELETE /api/listes-fidelite/${encodeURIComponent(id)}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `FideliteTierConfig[]` |
| `add` | `(tier: Partial<FideliteTierConfig>)` | `FideliteTierConfig[]` |
| `update` | `(id: string, patch: Partial<FideliteTierConfig>)` | `FideliteTierConfig[]` |
| `remove` | `(id: string)` | `FideliteTierConfig[]` |

### `src/services/api/moduleSettingsApi.ts`

- **Appels HTTP** : `GET /api/module-settings`, `GET /api/module-settings/${module}`, `PUT /api/module-settings/${module}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `ModuleSettings` |
| `getModule` | `(module: string)` | `any` |
| `updateModule` | `(module: string, data: any)` | `{ success: boolean; settings: any }` |

### `src/services/api/noteApi.ts`

- **Appels HTTP** : `DELETE /api/notes/${id}`, `PUT /api/notes/batch/reorder`, `DELETE /api/notes/fichier`, `DELETE /api/notes/columns/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/noteShareApi.ts`

- **Appels HTTP** : `DELETE /api/notes-share/revoke`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/nouvelleAchatApi.ts`

- **Appels HTTP** : `GET /api/nouvelle-achat`, `GET /api/nouvelle-achat/monthly/${year}/${month}`, `GET /api/nouvelle-achat/yearly/${year}`, `GET /api/nouvelle-achat/stats/monthly/${year}/${month}`, `GET /api/nouvelle-achat/stats/yearly/${year}`, `GET /api/nouvelle-achat/${id}`, `POST /api/nouvelle-achat`, `POST /api/nouvelle-achat/depense`, `PUT /api/nouvelle-achat/${id}`, `DELETE /api/nouvelle-achat/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `NouvelleAchat[]` |
| `getByMonthYear` | `(year: number, month: number)` | `NouvelleAchat[]` |
| `getByYear` | `(year: number)` | `NouvelleAchat[]` |
| `getMonthlyStats` | `(year: number, month: number)` | `MonthlyStats` |
| `getYearlyStats` | `(year: number)` | `YearlyStats` |
| `getById` | `(id: string)` | `NouvelleAchat` |
| `create` | `(data: NouvelleAchatFormData)` | `NouvelleAchat` |
| `addDepense` | `(data: DepenseFormData)` | `NouvelleAchat` |
| `update` | `(id: string, data: Partial<NouvelleAchatFormData>)` | `NouvelleAchat` |
| `delete` | `(id: string)` | `boolean` |
| `uploadReceipt` | `(file: File)` | `string` |
| `uploadAchatReceipt` | `(file: File)` | `string` |

### `src/services/api/objectifApi.ts`

- **Appels HTTP** : `GET /api/objectif`, `PUT /api/objectif/objectif`, `POST /api/objectif/recalculate`, `GET /api/objectif/historique`, `POST /api/objectif/save-monthly`, `POST /api/objectif/reset`

| Méthode | Signature | Retour |
|---|---|---|
| `get` | `()` | `ObjectifData` |
| `updateObjectif` | `(objectif: number)` | `ObjectifData` |
| `recalculate` | `()` | `ObjectifData` |
| `getHistorique` | `()` | `ObjectifHistorique` |
| `saveMonthlyData` | `()` | `ObjectifHistorique` |
| `resetObjectif` | `()` | `ObjectifData` |

### `src/services/api/parametresApi.ts`

- **Appels HTTP** : `GET /api/parametres/prixpointage`, `PUT /api/parametres/prixpointage`, `GET /api/parametres/parametretache`, `PUT /api/parametres/parametretache`

| Méthode | Signature | Retour |
|---|---|---|
| `getPrixPointage` | `()` | `PrixPointage` |
| `updatePrixPointage` | `(data: Partial<PrixPointage>)` | `PrixPointage` |
| `getParametreTache` | `()` | `ParametreTache` |
| `updateParametreTache` | `(data: Partial<ParametreTache>)` | `ParametreTache` |

### `src/services/api/pointageApi.ts`

- **Appels HTTP** : `DELETE /api/pointages/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/pointageAutoApi.ts`

- **Appels HTTP** : `DELETE /api/pointages-auto/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/pointageAutoDeclancheApi.ts`

- **Appels HTTP** : —

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/pointageAutoSessionsApi.ts`

- **Appels HTTP** : —

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/pointageDeletedApi.ts`

- **Appels HTTP** : `POST /api/pointages-deleted`, `DELETE /api/pointages-deleted`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/prepaLivraisonApi.ts`

- **Appels HTTP** : `GET /api/prepa-livraison`, `POST /api/prepa-livraison/sync`, `PATCH /api/prepa-livraison/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `PrepaLivraisonEntry[]` |
| `sync` | `(entries: Commande[])` | `PrepaLivraisonEntry[]` |
| `setTermine` | `(id: string, termine: boolean)` | `PrepaLivraisonEntry` |

### `src/services/api/pretFamilleApi.ts`

- **Appels HTTP** : `GET /api/pretfamilles`, `GET /api/pretfamilles/${id}`, `POST /api/pretfamilles`, `PUT /api/pretfamilles/${id}`, `DELETE /api/pretfamilles/${id}`, `GET /api/pretfamilles/search/nom?q=${encodeURIComponent(name)}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `PretFamille[]` |
| `getById` | `(id: string)` | `PretFamille` |
| `create` | `(data: Omit<PretFamille, 'id'>)` | `PretFamille` |
| `update` | `(id: string, data: Partial<PretFamille>)` | `PretFamille` |
| `delete` | `(id: string)` | `boolean` |
| `searchByName` | `(name: string)` | `PretFamille[]` |

### `src/services/api/pretProduitApi.ts`

- **Appels HTTP** : `GET /api/pretproduits`, `GET /api/pretproduits/${id}`, `POST /api/pretproduits`, `PUT /api/pretproduits/${id}`, `DELETE /api/pretproduits/${id}`, `POST /api/pretproduits/transfer`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `PretProduit[]` |
| `getById` | `(id: string)` | `PretProduit` |
| `create` | `(data: Omit<PretProduit, 'id'>)` | `PretProduit` |
| `update` | `(id: string, data: Partial<PretProduit>)` | `PretProduit` |
| `delete` | `(id: string)` | `boolean` |
| `transfer` | `(fromName: string, toName: string, pretIds: string[])` | `{ message: string; transferred: number }` |

### `src/services/api/prixProductsApi.ts`

- **Appels HTTP** : `DELETE /api/prix-products/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `PrixProductEntry[]` |
| `getByProduct` | `(productId: string)` | `PrixProductEntry[]` |
| `create` | `(payload: PrixProductPayload)` | `PrixProductEntry` |
| `remove` | `(id: string)` | `void` |

### `src/services/api/productApi.ts`

- **Appels HTTP** : `GET /api/products`, `GET /api/products/${id}`, `POST /api/products`, `PUT /api/products/${id}`, `DELETE /api/products/${id}`, `POST /api/products/generate-codes`, `POST /api/products/with-photos`, `PUT /api/products/${productId}/photos`, `PATCH /api/products/${productId}/achats/${achatIndex}/disponibilite`, `PUT /api/products/${productId}/achats/${achatIndex}`, `DELETE /api/products/${productId}/achats/${achatIndex}`, `PUT /api/products/${productId}/ventes/${venteIndex}`, `DELETE /api/products/${productId}/ventes/${venteIndex}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Product[]` |
| `getById` | `(id: string)` | `Product` |
| `create` | `(data: ProductFormData)` | `Product` |
| `update` | `(id: string, data: Partial<ProductFormData>)` | `Product` |
| `delete` | `(id: string)` | `boolean` |
| `generateCodesForExistingProducts` | `()` | `{ message: string; updatedCount: number }` |
| `createWithPhotos` | `( data: ProductFormData, files: File[], mainIndex = 0 )` | `Product` |
| `replacePhotos` | `( productId: string, newFiles: File[], keptExistingUrls: string[], mainIndex = 0 )` | `Product` |
| `setAchatDisponibilite` | `(productId: string, achatIndex: number, disponible: boolean)` | `Product` |
| `updateAchat` | `(productId: string, achatIndex: number, patch: Partial<{ date: string; quantity: number; purchasePrice: number; fournisseur: string; disponible: boolean; }>)` | `Product` |
| `deleteAchat` | `(productId: string, achatIndex: number)` | `Product` |
| `updateVente` | `(productId: string, venteIndex: number, patch: Partial<{ date: string; quantity: number; sellingPrice: number; }>)` | `Product` |
| `deleteVente` | `(productId: string, venteIndex: number)` | `Product` |

### `src/services/api/productCommentsApi.ts`

- **Appels HTTP** : `GET /api/product-comments/ratings`, `GET /api/product-comments/product/${productId}`, `POST /api/product-comments`, `PUT /api/product-comments/${id}`, `DELETE /api/product-comments/${id}`, `DELETE /api/product-comments/bulk`, `DELETE /api/product-comments/product/${productId}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAllRatings` | `()` | `Record<string, ProductRatingInfo` |
| `getByProductId` | `(productId: string)` | `ProductComment[]` |
| `create` | `(data: { productId: string; comment: string; rating: number; clientName?: string })` | `ProductComment` |
| `update` | `(id: string, data: { comment: string; rating: number; clientName?: string })` | `ProductComment` |
| `delete` | `(id: string)` | `void` |
| `deleteMany` | `(ids: string[])` | `{ message: string; count: number }` |
| `deleteByProductId` | `(productId: string)` | `void` |

### `src/services/api/profileApi.ts`

- **Appels HTTP** : `GET /api/profile`, `PUT /api/profile`, `PUT /api/profile/password`

| Méthode | Signature | Retour |
|---|---|---|
| `getProfile` | `()` | `ProfileData` |
| `updateProfile` | `(data: Partial<ProfileData>)` | `{ success: boolean; user: ProfileData }` |
| `uploadPhoto` | `(file: File)` | `{ success: boolean; photoUrl: string; user: ProfileData }` |
| `changePassword` | `(data: { currentPassword: string; newPassword: string; confirmPassword: string })` | `{ success: boolean; message: string }` |

### `src/services/api/rdvApi.ts`

- **Appels HTTP** : `GET /api/rdv`, `GET /api/rdv/${id}`, `POST /api/rdv`, `PUT /api/rdv/${id}`, `DELETE /api/rdv/${id}`, `GET /api/rdv/search?q=${encodeURIComponent(query)}`, `GET /api/rdv/week?start=${startDate}&end=${endDate}`, `GET /api/rdv/conflicts?${params.toString()}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `RDV[]` |
| `getById` | `(id: string)` | `RDV` |
| `create` | `(data: RDVFormData)` | `RDV` |
| `update` | `(id: string, data: Partial<RDVFormData>)` | `RDV` |
| `delete` | `(id: string)` | `boolean` |
| `search` | `(query: string)` | `RDV[]` |
| `getByWeek` | `(startDate: string, endDate: string)` | `RDV[]` |
| `checkConflicts` | `(date: string, heureDebut: string, heureFin: string, excludeId?: string)` | `RDV[]` |

### `src/services/api/rdvNotificationsApi.ts`

- **Appels HTTP** : `GET /api/rdv-notifications`, `GET /api/rdv-notifications/unread`, `GET /api/rdv-notifications/count`, `POST /api/rdv-notifications/check`, `PUT /api/rdv-notifications/${id}/read`, `DELETE /api/rdv-notifications/${id}`, `GET /api/rdv-notifications/by-rdv/${rdvId}`, `PUT /api/rdv-notifications/status/${rdvId}`, `PUT /api/rdv-notifications/by-rdv/${rdvId}`, `DELETE /api/rdv-notifications/by-rdv/${rdvId}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `RdvNotification[]` |
| `getUnread` | `()` | `RdvNotification[]` |
| `getUnreadCount` | `()` | `number` |
| `checkAndCreate` | `()` | `{ created: number; notifications: RdvNotification[] }` |
| `markAsRead` | `(id: string)` | `boolean` |
| `delete` | `(id: string)` | `boolean` |
| `getByRdvId` | `(rdvId: string)` | `RdvNotification \| null` |
| `updateStatus` | `(rdvId: string, status: string)` | `boolean` |
| `updateByRdvId` | `(rdvId: string, data: Partial<RdvNotification>)` | `RdvNotification \| null` |
| `deleteByRdvId` | `(rdvId: string)` | `boolean` |

### `src/services/api/rdvTachesApi.ts`

- **Appels HTTP** : `DELETE /api/rdv-taches/${id}`, `DELETE /api/rdv-taches/by-commande/${commandeId}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/remboursementApi.ts`

- **Appels HTTP** : `GET /api/remboursements`, `GET /api/remboursements/by-month?month=${month}&year=${year}`, `GET /api/remboursements/search-sales?clientName=${encodeURIComponent(clientName)}`, `POST /api/remboursements`, `DELETE /api/remboursements/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/saleApi.ts`

- **Appels HTTP** : `GET /api/sales`, `GET /api/sales/by-month?month=${month}&year=${year}`, `GET /api/sales/${id}`, `POST /api/sales`, `PUT /api/sales/${id}`, `DELETE /api/sales/${id}`, `POST /api/sales/export-month`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `Sale[]` |
| `getByMonth` | `(month: number, year: number)` | `Sale[]` |
| `getById` | `(id: string)` | `Sale` |
| `create` | `(data: Omit<Sale, 'id'>)` | `Sale` |
| `update` | `(id: string, data: Partial<Sale>)` | `Sale` |
| `delete` | `(id: string)` | `boolean` |
| `exportMonth` | `(month: number, year: number)` | `boolean` |

### `src/services/api/settingsApi.ts`

- **Appels HTTP** : `GET /api/settings`, `PUT /api/settings`, `POST /api/settings/backup`, `POST /api/settings/restore`, `POST /api/settings/delete-all`, `POST /api/settings/verify-password`, `POST /api/settings/auto-backup`

| Méthode | Signature | Retour |
|---|---|---|
| `getSettings` | `()` | `{ settings: AppSettings; isAdmin: boolean }` |
| `updateSettings` | `(data: Partial<AppSettings>)` | `{ success: boolean; settings: AppSettings }` |
| `backupData` | `(encryptionCode: string)` | `{ success: boolean; backup: any; filename: string }` |
| `restoreData` | `(encryptedData: any, decryptionCode: string)` | `{ success: boolean; message: string; status?: 'updated' \| 'unchanged'; updatedFilesCount?: number; unchangedFilesCount?: number; totalAddedEntries?: number }` |
| `deleteAllData` | `(password: string)` | `{ success: boolean; message: string }` |
| `verifyPassword` | `(password: string)` | `{ valid: boolean }` |
| `autoBackup` | `(encryptionPassword: string)` | `{ success: boolean; backup: any; filename: string }` |

### `src/services/api/shareCommentsApi.ts`

- **Appels HTTP** : `PATCH /api/share-comments/read/${id}`, `POST /api/share-comments/sync-html`, `POST /api/share-comments/import-json`, `DELETE /api/share-comments/delete/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/shareLinksApi.ts`

- **Appels HTTP** : `DELETE /api/share-links/revoke/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/tacheApi.ts`

- **Appels HTTP** : `DELETE /api/taches/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/tachesRdvApi.ts`

- **Appels HTTP** : `DELETE /api/taches-rdv/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/travailleurApi.ts`

- **Appels HTTP** : `DELETE /api/travailleurs/${id}`

| Méthode | Signature | Retour |
|---|---|---|
| — | — | — |

### `src/services/api/villesApi.ts`

- **Appels HTTP** : `GET /api/clients-villes`, `POST /api/clients-villes`, `PUT /api/clients-villes/${encodeURIComponent(original)}`, `DELETE /api/clients-villes/${encodeURIComponent(ville)}`, `GET /api/livraison-villes`, `POST /api/livraison-villes`, `PUT /api/livraison-villes/${encodeURIComponent(originalVille)}`, `DELETE /api/livraison-villes/${encodeURIComponent(ville)}`

| Méthode | Signature | Retour |
|---|---|---|
| `getAll` | `()` | `string[]` |
| `add` | `(ville: string)` | `string[]` |
| `update` | `(original: string, ville: string)` | `string[]` |
| `remove` | `(ville: string)` | `string[]` |
| `getAll` | `()` | `LivraisonVille[]` |
| `add` | `(ville: string, fee: number)` | `LivraisonVille[]` |
| `update` | `(originalVille: string, ville: string, fee: number)` | `LivraisonVille[]` |
| `remove` | `(ville: string)` | `LivraisonVille[]` |

## 3. Conventions

- Codes : `200` OK, `201` créé, `400` requête invalide, `401` non authentifié, `403` interdit, `404` introuvable, `429` trop de requêtes, `500` erreur serveur.
- Corps d'erreur : `{ "message": "..." }`.
- Les identifiants sont des chaînes générées côté serveur.
- Les uploads utilisent `multipart/form-data` et retournent le chemin public du fichier sous `/uploads/...`.

