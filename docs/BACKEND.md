# 🛠️ Documentation Backend (Express)

## 1. Point d'entrée `server/server.js`

Responsabilités : chargement de la configuration, CORS whitelist, sécurité (helmet/headers, rate limiting), parsing JSON, service des fichiers statiques `uploads/`, montage de **60 préfixes d'API**, flux SSE de synchronisation, gestion d'erreurs centralisée.

## 2. Montage des routeurs

| Préfixe | Fichier de routes |
|---|---|
| `/api/auth` | `server/routes/authRoutes.js` |
| `/api/products` | `server/routes/productRoutes.js` |
| `/api/products-vendu` | `server/routes/productsVenduRoutes.js` |
| `/api/sales` | `server/routes/salesRoutes.js` |
| `/api/fidelite` | `server/routes/fideliteRoutes.js` |
| `/api/listes-fidelite` | `server/routes/listesFideliteRoutes.js` |
| `/api/clients` | `server/routes/clientRoutes.js` |
| `/api/clients-villes` | `server/routes/clientsVillesRoutes.js` |
| `/api/livraison-villes` | `server/routes/livraisonVilleRoutes.js` |
| `/api/pretfamilles` | `server/routes/pretFamillesRoutes.js` |
| `/api/pretproduits` | `server/routes/pretProduitsRoutes.js` |
| `/api/depenses` | `server/routes/depensesRoutes.js` |
| `/api/versements` | `server/routes/versementRoutes.js` |
| `/api/banks` | `server/routes/banksRoutes.js` |
| `/api/prix-products` | `server/routes/prixProductsRoutes.js` |
| `/api/sync` | `server/routes/syncRoutes.js` |
| `/api/benefices` | `server/routes/beneficesRoutes.js` |
| `/api/messages` | `server/routes/messagesRoutes.js` |
| `/api/commandes` | `server/routes/commandesRoutes.js` |
| `/api/rdv` | `server/routes/rdvRoutes.js` |
| `/api/rdv-notifications` | `server/routes/rdvNotificationsRoutes.js` |
| `/api/objectif` | `server/routes/objectifRoutes.js` |
| `/api/nouvelle-achat` | `server/routes/nouvelleAchatRoutes.js` |
| `/api/compta` | `server/routes/comptaRoutes.js` |
| `/api/remboursements` | `server/routes/remboursementsRoutes.js` |
| `/api/fournisseurs` | `server/routes/fournisseursRoutes.js` |
| `/api/entreprises` | `server/routes/entrepriseRoutes.js` |
| `/api/pointages` | `server/routes/pointageRoutes.js` |
| `/api/pointages-auto` | `server/routes/pointageAutoRoutes.js` |
| `/api/pointages-deleted` | `server/routes/pointageDeletedRoutes.js` |
| `/api/pointages-auto-sessions` | `server/routes/pointageAutoSessionsRoutes.js` |
| `/api/pointages-auto-declanche` | `server/routes/pointageAutoDeclancheRoutes.js` |
| `/api/travailleurs` | `server/routes/travailleurRoutes.js` |
| `/api/taches` | `server/routes/tacheRoutes.js` |
| `/api/taches-rdv` | `server/routes/tachesRdvRoutes.js` |
| `/api/rdv-taches` | `server/routes/rdvTachesRoutes.js` |
| `/api/notes` | `server/routes/notesRoutes.js` |
| `/api/notes-share` | `server/routes/notesShareRoutes.js` |
| `/api/share-links` | `server/routes/shareLinksRoutes.js` |
| `/api/avances` | `server/routes/avanceRoutes.js` |
| `/api/profile` | `server/routes/profileRoutes.js` |
| `/api/messagerie` | `server/routes/messagerieRoutes.js` |
| `/api/settings` | `server/routes/settingsRoutes.js` |
| `/api/indisponible` | `server/routes/indisponibleRoutes.js` |
| `/api/module-settings` | `server/routes/moduleSettingsRoutes.js` |
| `/api/parametres` | `server/routes/parametresRoutes.js` |
| `/api/encryption` | `server/routes/encryptionRoutes.js` |
| `/api/share-comments` | `server/routes/shareCommentsRoutes.js` |
| `/api/product-comments` | `server/routes/productCommentsRoutes.js` |
| `/api/maintenance` | `server/routes/maintenanceRoutes.js` |
| `/api/prepa-livraison` | `server/routes/prepaLivraisonRoutes.js` |
| `/api/confirmation-rdv` | `server/routes/confirmationRdvRoutes.js` |
| `/api/historique-connexion` | `server/routes/historiqueConnexionRoutes.js` |
| `/api/availability` | `server/routes/availability.js` |
| `/api/modele-produits` | `server/routes/productAttributeRoutes.js` |
| `/api/taille-produits` | `server/routes/productAttributeRoutes.js` |
| `/api/couleur-produits` | `server/routes/productAttributeRoutes.js` |
| `/api/devant-produits` | `server/routes/productAttributeRoutes.js` |
| `/api/autres-produits` | `server/routes/productAttributeRoutes.js` |
| `/api/attribut-kinds` | `server/routes/attributKinds.js` |

Routeurs d'attributs produits exposés depuis `routes/productAttributes.js` : `/api/modele-produits`, `/api/taille-produits`, `/api/couleur-produits`, `/api/devant-produits`, `/api/autres-produits`, plus `/api/attribut-kinds`.

## 3. Middlewares (`server/middleware`)

| Fichier | Rôle |
|---|---|
| `auth.js` | Vérifie le JWT `Authorization: Bearer`, injecte `req.user`, rejette en 401 |
| `security.js` | En-têtes de sécurité, rate limiting, protection brute force |
| `validation.js` | Validation et nettoyage des entrées |
| `encryption.js` | Chiffrement/déchiffrement des données sensibles (clé mise en cache) |
| `dbHelper.js` | Lecture/écriture atomique des fichiers JSON |
| `patchDbIO.js` | Interception des I/O base pour journalisation et déclenchement SSE |
| `sync.js` | Surveillance des fichiers JSON et diffusion des événements `data-changed` |
| `upload.js` | Upload générique (photos clients/produits) |
| `uploadAchat.js` | Upload des justificatifs d'achat (PDF/JPG/PNG) |
| `uploadDepense.js` | Upload des justificatifs de dépense |

## 4. Contrôleurs (`server/controllers`)

| Fichier | Fonctions exportées |
|---|---|
| `authController.js` | `verifyToken`, `healthCheck`, `login`, `checkEmail`, `register`, `resetPasswordRequest`, `resetPassword` |
| `beneficeController.js` | `getAll`, `getByProductId`, `create`, `update`, `delete` |
| `clientController.js` | `getAll`, `getById`, `create`, `update`, `delete` |
| `commandeController.js` | `getAll`, `getById`, `create`, `update`, `delete` |
| `comptaController.js` | `getAll`, `getMonthly`, `getYearly`, `getSummary`, `calculateMonth`, `recalculateYear` |
| `crudControllers.js` | `entreprise`, `travailleur`, `fournisseur`, `avance`, `pretFamille`, `pretProduit`, `nouvelleAchat`, `compta`, `rdvNotification` |
| `depenseController.js` | `getMouvements`, `getMouvementById`, `createMouvement`, `updateMouvement`, `deleteMouvement`, `getDepensesFixe`, `updateDepensesFixe`, `resetMouvements`, `checkMonth`, `getRsa`, `updateRsa`, `autoAddEntries` |
| `index.js` | — |
| `messageController.js` | `create`, `getByUser`, `getUnreadCount`, `markAsRead`, `markAsUnread`, `delete` |
| `objectifController.js` | `get`, `getHistorique`, `updateObjectif`, `recalculate`, `saveMonthly` |
| `pointageController.js` | `getAll`, `getById`, `create`, `update`, `delete` |
| `pretFamilleController.js` | `getAll`, `getById`, `create`, `update`, `remove`, `search` |
| `pretProduitController.js` | `getAll`, `search`, `getById`, `create`, `update`, `remove`, `transfer` |
| `productController.js` | `getAll`, `generateCodes`, `search`, `getById`, `create`, `update`, `delete`, `updateQuantity`, `uploadImage`, `uploadPhotos`, `replacePhotos`, `deletePhoto` |
| `rdvController.js` | `getAll`, `search`, `searchClients`, `getByWeek`, `checkConflicts`, `getById`, `create`, `update`, `updateByCommande`, `delete` |
| `remboursementController.js` | `getAll`, `getByMonth`, `searchSales`, `create`, `remove` |
| `saleController.js` | `getAll`, `getByMonth`, `getById`, `create`, `update`, `delete`, `exportMonth` |
| `tacheController.js` | `getAll`, `getById`, `create`, `update`, `delete` |

## 5. Modèles (`server/models`)

| Modèle | Fichier de données | Méthodes |
|---|---|---|
| `Avance.js` | `avance.json` | — |
| `Benefice.js` | `—` | — |
| `Client.js` | `—` | — |
| `Commande.js` | `—` | — |
| `Compta.js` | `—` | — |
| `DepenseDuMois.js` | `—` | — |
| `Entreprise.js` | `—` | — |
| `Fidelite.js` | `—` | — |
| `Fournisseur.js` | `—` | — |
| `ListesFidelite.js` | `—` | — |
| `Message.js` | `—` | `constructor`, `ensureFileExists`, `getAll`, `getByUserId`, `getUnreadCount`, `create`, `markAsRead`, `markAsUnread`, `delete`, `saveAll` |
| `Note.js` | `notes.json` | — |
| `NouvelleAchat.js` | `—` | — |
| `Objectif.js` | `—` | — |
| `Pointage.js` | `—` | — |
| `PretFamille.js` | `—` | — |
| `PretProduit.js` | `—` | — |
| `Product.js` | `—` | — |
| `ProductAttribute.js` | `—` | — |
| `ProductComment.js` | `—` | `writeJsonEncrypted`, `getAll`, `getByProductId`, `create`, `update`, `delete`, `deleteMany`, `deleteByProductId`, `getAverageRating`, `getAllRatings` |
| `Rdv.js` | `—` | — |
| `RdvNotification.js` | `—` | — |
| `Remboursement.js` | `—` | — |
| `Sale.js` | `—` | — |
| `Tache.js` | `—` | — |
| `Travailleur.js` | `—` | — |
| `User.js` | `—` | — |

## 6. Services serveur (`server/services`)

| Fichier | Rôle |
|---|---|
| `fileService.js` | Abstraction de lecture/écriture des fichiers JSON et des uploads |
| `availabilityService.js` | Calcul des créneaux disponibles pour les rendez-vous |
| `reservationCleanupService.js` | Nettoyage automatique des réservations expirées |

## 7. Détail des routeurs

### `server/routes/attributKinds.js`

- **Préfixe** : `/api/attribut-kinds`

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/api/attribut-kinds` | JWT |
| POST | `/api/attribut-kinds` | JWT |
| PUT | `/api/attribut-kinds/:id` | JWT |
| DELETE | `/api/attribut-kinds/:id` | JWT |
| GET | `/api/attribut-kinds/:id/values` | JWT |
| POST | `/api/attribut-kinds/:id/values` | JWT |
| PUT | `/api/attribut-kinds/:id/values/:vid` | JWT |
| DELETE | `/api/attribut-kinds/:id/values/:vid` | JWT |

### `server/routes/auth.js`

- **Préfixe** : `(monté dynamiquement)`

auth.js - Routes d'authentification

Gestion de la connexion, inscription et réinitialisation de mot de passe.
Inclut : rate limiting, blocage après N tentatives échouées, et gestion JWT.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/verify` | public |
| GET | `/health` | public |
| POST | `/login` | public |
| POST | `/check-email` | public |
| POST | `/register` | public |
| POST | `/reset-password-request` | public |
| POST | `/reset-password` | public |

### `server/routes/availability.js`

- **Préfixe** : `/api/availability`

availability.js - Créneaux disponibles agrégés (commandes + rdv-taches + tâches)
GET /api/availability/slots?date=YYYY-MM-DD[&excludeCommandeId=xxx]
 → { busy: [{start, end, source, label}], freeSlots: [{start, end}] }

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/api/availability/slots` | JWT |
| GET | `/api/availability/check` | JWT |

### `server/routes/avance.js`

- **Préfixe** : `(monté dynamiquement)`

avance.js - Routes API pour la gestion des avances sur salaire

CRUD pour les avances versées aux travailleurs.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/banks.js`

- **Préfixe** : `(monté dynamiquement)`

banks.js - Routes API pour la gestion des banques (bank.json)

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/benefices.js`

- **Préfixe** : `(monté dynamiquement)`

benefices.js - Routes API pour le calcul et suivi des bénéfices

Gestion des marges, bénéfices nets et rapports financiers.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/product/:productId` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/clients.js`

- **Préfixe** : `(monté dynamiquement)`

clients.js - Routes API pour la gestion des clients

CRUD complet avec upload de photo, recherche et filtrage.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/merge` | JWT |

### `server/routes/clientsVilles.js`

- **Préfixe** : `(monté dynamiquement)`

clientsVilles.js - Routes API pour la liste des villes des clients

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:original` | JWT |
| DELETE | `/:ville` | JWT |

### `server/routes/commandes.js`

- **Préfixe** : `(monté dynamiquement)`

commandes.js - Routes API pour la gestion des commandes fournisseurs

CRUD complet pour les commandes avec :
- Création et suivi des commandes fournisseurs
- Gestion des statuts (en attente, livrée, annulée)
- Historique des commandes
Toutes les routes sont authentifiées.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/expiring-soon` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/compta.js`

- **Préfixe** : `(monté dynamiquement)`

compta.js - Routes API pour la comptabilité

Gestion des écritures comptables, soldes et rapports financiers.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/monthly/:year/:month` | public |
| GET | `/yearly/:year` | public |
| GET | `/summary/:year` | public |
| POST | `/calculate/:year/:month` | public |
| POST | `/recalculate/:year` | public |

### `server/routes/confirmationRdv.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Confirmation RDV
Snapshot des rendez-vous dans les prochaines 24h + statut de confirmation.
Statut: 'en_attente' | 'maintenu' | 'annule' | 'reporter'

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `/sync` | JWT |
| PATCH | `/:id` | JWT |

### `server/routes/depenses.js`

- **Préfixe** : `(monté dynamiquement)`

depenses.js - Routes API pour la gestion des dépenses mensuelles

CRUD pour les dépenses avec catégorisation et suivi mensuel.

| Méthode | Chemin complet | Auth |
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

### `server/routes/encryption.js`

- **Préfixe** : `(monté dynamiquement)`

Routes pour la gestion du cryptage des données

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/status` | JWT |
| POST | `/activate` | JWT |
| POST | `/deactivate` | JWT |
| POST | `/change-key` | JWT |

### `server/routes/entreprise.js`

- **Préfixe** : `(monté dynamiquement)`

entreprise.js - Routes API pour la gestion des entreprises (pointage)

CRUD pour les entreprises associées au système de pointage.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/fidelite.js`

- **Préfixe** : `(monté dynamiquement)`

Routes de fidélité client.
GET /api/fidelite         -> map complet
GET /api/fidelite/:name   -> entrée pour un client
POST /api/fidelite/rebuild -> reconstruction depuis sales.json

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/:name` | public |
| POST | `/rebuild` | public |

### `server/routes/fournisseurs.js`

- **Préfixe** : `(monté dynamiquement)`

Routes API pour les fournisseurs

GET  /api/fournisseurs          → Liste complète
GET  /api/fournisseurs/search?q= → Recherche par nom
POST /api/fournisseurs          → Créer (si n'existe pas)
DELETE /api/fournisseurs/:id    → Supprimer

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/search` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/historiqueConnexion.js`

- **Préfixe** : `(monté dynamiquement)`

historiqueConnexion.js - Historique des connexions et visites du site.
Enregistre chaque tentative de connexion (succès / échec / bloqué) et chaque
visite anonyme (sans authentification). Stocké dans db/historique-connexion.json.
Champ : id, type ('login_success'|'login_failed'|'login_locked'|'visit'),
        userId, userEmail, userName, userRole, ip, userAgent, browser, os,
        device, statut, message, date (ISO).

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| POST | `/visit` | public |
| DELETE | `` | public |

### `server/routes/indisponible.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Indisponibilité - Gestion des jours/heures indisponibles
Supporte la récurrence (hebdomadaire) avec groupId

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| DELETE | `/group/:groupId` | JWT |
| POST | `/check` | JWT |

### `server/routes/listesFidelite.js`

- **Préfixe** : `(monté dynamiquement)`

Routes CRUD des paliers de fidélité (listes-fidelite.json).
Chaque modification déclenche un rebuild de fidelite.json pour resynchroniser
les tiers de tous les clients.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| PUT | `` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### `server/routes/livraisonVille.js`

- **Préfixe** : `(monté dynamiquement)`

livraisonVille.js - Routes API pour les villes de livraison avec frais

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:ville` | JWT |
| DELETE | `/:ville` | JWT |

### `server/routes/maintenance.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Maintenance
- GET  /api/maintenance/status      : public
- PUT  /api/maintenance/toggle      : admin principale
- POST /api/maintenance/check-admin : public
- CRUD /api/maintenance/scheduled   : admin principale (maintenances auto programmées)

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/status` | public |
| POST | `/check-admin` | public |
| PUT | `/toggle` | JWT |
| GET | `/scheduled` | JWT |
| POST | `/scheduled` | JWT |
| PUT | `/scheduled/:id` | JWT |
| DELETE | `/scheduled/:id` | JWT |

### `server/routes/messagerie.js`

- **Préfixe** : `(monté dynamiquement)`

messagerie.js - Routes API pour le système de messagerie/chat en temps réel

Chat admin avec conversations, SSE pour temps réel, et historique des messages.

| Méthode | Chemin complet | Auth |
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

### `server/routes/messages.js`

- **Préfixe** : `(monté dynamiquement)`

messages.js - Routes API pour la messagerie interne

Gestion des messages internes avec compteur de non-lus et marquage.

| Méthode | Chemin complet | Auth |
|---|---|---|
| POST | `` | public |
| GET | `` | JWT |
| GET | `/unread-count` | JWT |
| PUT | `/:id/read` | JWT |
| PUT | `/:id/unread` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/moduleSettings.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Module Settings - Paramètres spécifiques par module

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:module` | JWT |
| PUT | `/:module` | JWT |

### `server/routes/notes.js`

- **Préfixe** : `(monté dynamiquement)`

notes.js - Routes API pour la gestion des notes (post-its)

CRUD pour les notes avec support de colonnes, dessins et mémos vocaux.

| Méthode | Chemin complet | Auth |
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

### `server/routes/notesShare.js`

- **Préfixe** : `(monté dynamiquement)`

notesShare.js - Routes API pour le partage des notes via token

Ce module gère le partage en lecture seule des notes :
- POST /generate : Génère un token de partage unique (authentifié)
- DELETE /revoke : Révoque tous les tokens actifs (authentifié)
- GET /view/:token : Accès public aux notes partagées (sans auth)

Stockage : noteShareTokens.json pour les tokens, notes.json et noteColumns.json pour les données

| Méthode | Chemin complet | Auth |
|---|---|---|
| POST | `/generate` | JWT |
| DELETE | `/revoke` | JWT |
| GET | `/view/:token` | public |

### `server/routes/nouvelleAchat.js`

- **Préfixe** : `(monté dynamiquement)`

nouvelleAchat.js - Routes API pour la gestion des achats/approvisionnements

CRUD pour les nouveaux achats de stock avec calcul du prix de revient.

| Méthode | Chemin complet | Auth |
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

### `server/routes/objectif.js`

- **Préfixe** : `(monté dynamiquement)`

objectif.js - Routes API pour la gestion des objectifs de ventes

Définition et suivi des objectifs mensuels/annuels avec calcul de progression.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/historique` | JWT |
| PUT | `/objectif` | JWT |
| POST | `/recalculate` | JWT |
| POST | `/save-monthly` | JWT |
| POST | `/reset` | JWT |

### `server/routes/parametres.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Prix Pointage & Paramètre Tâches

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/prixpointage` | JWT |
| PUT | `/prixpointage` | JWT |
| GET | `/parametretache` | JWT |
| PUT | `/parametretache` | JWT |

### `server/routes/pointage.js`

- **Préfixe** : `(monté dynamiquement)`

pointage.js - Routes API pour la gestion du pointage des travailleurs

CRUD complet pour les entrées de pointage (heures travaillées, montants, entreprises).
Toutes les routes sont authentifiées via le middleware auth.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/pointageAuto.js`

- **Préfixe** : `(monté dynamiquement)`

=============================================================================
Routes Pointage Automatique
=============================================================================
Gère les règles de pointage automatique configurées par l'admin.
Chaque règle contient :
 - id, travailleurId, travailleurNom (Personne)
 - jours: tableau de jours ['lundi','mardi',...] OU 'toute' pour toute la semaine
 - entrepriseId, entrepriseNom
 - typePaiement, heures, prixHeure, prixJournalier, montantTotal
 - active: boolean (activé/désactivé)
 - createdAt

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/pointageAutoDeclanche.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PATCH | `/:id` | JWT |
| DELETE | `/cleanup` | JWT |

### `server/routes/pointageAutoSessions.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PATCH | `/:id` | JWT |
| DELETE | `/cleanup` | JWT |

### `server/routes/pointageDeleted.js`

- **Préfixe** : `(monté dynamiquement)`

=============================================================================
Routes Pointage Deleted (empreintes)
=============================================================================
Conserve la trace des pointages supprimés (date + travailleurId + entrepriseId)
pour empêcher le pointage AUTOMATIQUE de recréer le même pointage.
Un pointage MANUEL (création directe via /api/pointages) reste autorisé.
Format d'une entrée :
  { date: 'YYYY-MM-DD', travailleurId: '...', entrepriseId: '...', deletedAt: ISO }

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| DELETE | `` | JWT |

### `server/routes/prepaLivraison.js`

- **Préfixe** : `(monté dynamiquement)`

Routes Préparation Livraison
Stocke un snapshot des commandes/réservations (en_attente, valide, annule, reporter)
+ l'état de préparation (termine, statut: 'en_cours' | 'fini').

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `/sync` | JWT |
| PATCH | `/:id` | JWT |

### `server/routes/pretfamilles.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| GET | `/search/nom` | JWT |

### `server/routes/pretproduits.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/search` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/transfer` | JWT |

### `server/routes/prixproducts.js`

- **Préfixe** : `(monté dynamiquement)`

prixproducts.js - Routes API pour l'historique des prix d'achat
Enregistre chaque variation de prix d'achat (augmentation, diminution, stable)
avec tous les renseignements du produit pour générer des graphes d'évolution.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/product/:productId` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/productAttributes.js`

- **Préfixe** : `(monté dynamiquement)`

Routes API pour les attributs produits :
/api/modele-produits, /api/taille-produits, /api/couleur-produits, /api/devant-produits
Toutes utilisent la même structure { id, nom, description }.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/productComments.js`

- **Préfixe** : `(monté dynamiquement)`

productComments.js - Routes API pour les commentaires sur les produits

CRUD pour les commentaires associés aux produits (avis, notes internes).

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/ratings` | public |
| GET | `/product/:productId` | public |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/bulk` | JWT |
| DELETE | `/:id` | JWT |
| DELETE | `/product/:productId` | JWT |

### `server/routes/products.js`

- **Préfixe** : `(monté dynamiquement)`

products.js - Routes API pour la gestion des produits

CRUD complet pour les produits avec support de :
- Upload d'images produit
- Gestion du stock (entrées, sorties, alertes)
- Recherche et filtrage
- Commentaires sur les produits
Toutes les routes sont authentifiées.

| Méthode | Chemin complet | Auth |
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

### `server/routes/productsVendu.js`

- **Préfixe** : `(monté dynamiquement)`

productsVendu.js — Liste des produits par volume de ventes
Agrège les ventes depuis sales.json et les stocks depuis products.json
pour produire une liste triée des produits les plus vendus vers les moins
vendus (et jamais vendus). Persistée dans products.vendu.json avec une
stratégie de mise à jour incrémentale : on ne réinitialise que si des
changements sont détectés, en conservant les entrées inchangées.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |

### `server/routes/profile.js`

- **Préfixe** : `(monté dynamiquement)`

profile.js - Routes API pour la gestion du profil utilisateur

Modification des informations personnelles, photo de profil,
changement de mot de passe et paramètres de sécurité.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| PUT | `` | JWT |
| POST | `/photo` | JWT |
| PUT | `/password` | JWT |
| GET | `/security-settings` | JWT |
| PUT | `/security-settings` | JWT |
| GET | `/timeout-settings` | JWT |
| PUT | `/timeout-settings` | JWT |

### `server/routes/rdv.js`

- **Préfixe** : `(monté dynamiquement)`

rdv.js - Routes API pour la gestion des rendez-vous

CRUD complet avec notifications, rappels et lien avec les clients.

| Méthode | Chemin complet | Auth |
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

### `server/routes/rdvNotifications.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
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

### `server/routes/rdvTaches.js`

- **Préfixe** : `(monté dynamiquement)`

rdvTaches.js - RDV liés aux tâches de coiffure (tissages, tresses, perruques, etc.)
Stocke dans server/db/rdv-taches.json
Champs : id, personneId, personneNom, clientId, clientNom, tacheId, tacheNom,
         lieu, telephone, date, heureDebut, heureFin, commentaires,
         statut (planifie|confirme|annule|reporte|termine), createdAt, updatedAt

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/free-slots` | public |
| POST | `` | public |
| PUT | `/by-commande/:commandeId` | public |
| DELETE | `/by-commande/:commandeId` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### `server/routes/remboursements.js`

- **Préfixe** : `(monté dynamiquement)`

remboursements.js - Routes API pour la gestion des remboursements clients

CRUD pour les remboursements avec suivi des statuts et historique.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/by-month` | JWT |
| GET | `/search-sales` | JWT |
| POST | `` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/sales.js`

- **Préfixe** : `(monté dynamiquement)`

sales.js - Routes API pour la gestion des ventes

CRUD complet pour les ventes avec :
- Enregistrement de ventes (produits, quantités, prix)
- Mise à jour automatique du stock produit
- Statistiques et rapports de ventes
- Filtrage par période, produit, client
Toutes les routes sont authentifiées.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/by-month` | JWT |
| GET | `/by-year` | JWT |
| GET | `/yearly-stats` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |
| POST | `/export-month` | JWT |

### `server/routes/settings.js`

- **Préfixe** : `(monté dynamiquement)`

=============================================================================
Routes Paramètres - Gestion des données et configuration
=============================================================================

| Méthode | Chemin complet | Auth |
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

### `server/routes/shareComments.js`

- **Préfixe** : `(monté dynamiquement)`

| Méthode | Chemin complet | Auth |
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

### `server/routes/shareLinks.js`

- **Préfixe** : `(monté dynamiquement)`

shareLinks.js - Routes API pour la gestion des liens de partage sécurisés

Permet de créer des liens de partage pour les données (pointage, tâches, notes)
avec code d'accès et possibilité de sélection d'éléments spécifiques.

Routes :
- POST /generate : Créer un lien avec token + code d'accès
- GET /list : Lister les liens par type
- DELETE /revoke/:id : Révoquer un lien
- POST /access/:token : Valider le code d'accès et retourner les données

| Méthode | Chemin complet | Auth |
|---|---|---|
| POST | `/generate` | JWT |
| GET | `/list` | JWT |
| DELETE | `/revoke/:id` | JWT |
| POST | `/verify/:token` | public |
| GET | `/view/:token` | public |

### `server/routes/sync.js`

- **Préfixe** : `(monté dynamiquement)`

sync.js - Routes API pour la synchronisation en temps réel (SSE)

Gère les Server-Sent Events pour notifier les clients des changements de données.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `/events` | public |
| POST | `/force-sync` | JWT |
| GET | `/status` | public |
| GET | `/test` | public |

### `server/routes/tache.js`

- **Préfixe** : `(monté dynamiquement)`

tache.js - Routes API pour la gestion des tâches

CRUD complet pour les tâches avec support de :
- Création, modification, suppression de tâches
- Marquage comme complétée/non complétée
- Filtrage par date, importance, travailleur
Toutes les routes sont authentifiées.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| GET | `/:id` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| PUT | `/by-commande/:commandeId` | public |
| DELETE | `/:id` | public |
| DELETE | `/by-commande/:commandeId` | public |

### `server/routes/tachesRdv.js`

- **Préfixe** : `(monté dynamiquement)`

tachesRdv.js - Catalogue des types de tâches RDV (tissage, tresse, perruque, etc.)
Stocke dans server/db/taches-rdv.json

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | public |
| POST | `` | public |
| PUT | `/:id` | public |
| DELETE | `/:id` | public |

### `server/routes/travailleur.js`

- **Préfixe** : `(monté dynamiquement)`

travailleur.js - Routes API pour la gestion des travailleurs

CRUD pour les travailleurs utilisés dans le pointage et les tâches.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| GET | `/:id` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

### `server/routes/versement.js`

- **Préfixe** : `(monté dynamiquement)`

versement.js - Routes API pour la gestion des versements espèce
Stocke les versements espèce et le montant maximum mensuel autorisé.
Calcul "fenêtre glissante 30 jours" effectué côté client.

| Méthode | Chemin complet | Auth |
|---|---|---|
| GET | `` | JWT |
| PUT | `/max` | JWT |
| POST | `` | JWT |
| PUT | `/:id` | JWT |
| DELETE | `/:id` | JWT |

