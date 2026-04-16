# 🖥️ Documentation Backend — Riziky Gestion

> Ce document décrit **toutes les routes API**, **tous les modèles**, **tous les middlewares** et **tous les contrôleurs** du serveur Node.js/Express.

---

## 📑 Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Routes API](#2-routes-api)
3. [Contrôleurs](#3-contrôleurs)
4. [Modèles](#4-modèles)
5. [Middlewares](#5-middlewares)
6. [Services](#6-services)

---

## 1. Vue d'ensemble

Le backend est un serveur **Express 5** qui :
- Écoute sur le port `10000` (configurable via `PORT`)
- Utilise des **fichiers JSON** comme base de données (dans `server/db/`)
- Authentifie via **JWT** (tokens valides 8 heures)
- Chiffre les fichiers JSON de manière transparente (`ENCRYPTION_KEY`)
- Synchronise en temps réel via **SSE** (Server-Sent Events)
- Sécurise avec rate limiting, sanitization, headers sécurisés

### Point d'entrée : `server/server.js`

Ce fichier :
1. Charge le patch de chiffrement (`patchDbIO.js`) — **doit être avant tout import de modèle**
2. Configure Express (CORS, compression, body-parser, sécurité)
3. Monte toutes les routes sous `/api/`
4. Sert les fichiers statiques (`/uploads`)
5. Démarre le serveur

---

## 2. Routes API

Toutes les routes sont montées sous le préfixe `/api/`. L'authentification est requise sauf mention contraire.

### 2.1 Authentification (`/api/auth/`)

| Méthode | Route | Auth ? | Description |
|---------|-------|--------|-------------|
| `POST` | `/api/auth/login` | ❌ | Connexion avec email + mot de passe. Retourne un token JWT. Gère le verrouillage après X tentatives |
| `POST` | `/api/auth/register` | ❌ | Inscription nouvel utilisateur. Valide email unique, mot de passe ≥6 chars |
| `GET` | `/api/auth/verify` | ✅ | Vérifie si le token JWT est valide et l'utilisateur existe |
| `POST` | `/api/auth/check-email` | ❌ | Vérifie si un email existe. Retourne l'état de verrouillage du compte |
| `POST` | `/api/auth/reset-password-request` | ❌ | Vérifie l'email pour la réinitialisation |
| `POST` | `/api/auth/reset-password` | ❌ | Réinitialise le mot de passe (validation : majuscule, minuscule, chiffre, spécial, ≥6 chars) |
| `GET` | `/api/auth/health` | ❌ | Health check du serveur |

### 2.2 Produits (`/api/products/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/products` | Liste tous les produits |
| `GET` | `/api/products/:id` | Détail d'un produit |
| `POST` | `/api/products` | Créer un produit (avec upload photos via Multer) |
| `PUT` | `/api/products/:id` | Modifier un produit |
| `DELETE` | `/api/products/:id` | Supprimer un produit |
| `POST` | `/api/products/:id/photos` | Ajouter des photos à un produit |
| `DELETE` | `/api/products/:id/photos/:photoIndex` | Supprimer une photo |
| `PUT` | `/api/products/:id/main-photo` | Définir la photo principale |

### 2.3 Ventes (`/api/sales/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/sales` | Liste toutes les ventes |
| `POST` | `/api/sales` | Enregistrer une vente (met à jour le stock du produit) |
| `DELETE` | `/api/sales/:id` | Supprimer une vente |
| `GET` | `/api/sales/monthly/:year/:month` | Ventes d'un mois spécifique |

### 2.4 Clients (`/api/clients/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/clients` | Liste tous les clients |
| `POST` | `/api/clients` | Créer un client (avec upload photo) |
| `PUT` | `/api/clients/:id` | Modifier un client |
| `DELETE` | `/api/clients/:id` | Supprimer un client |

### 2.5 Commandes (`/api/commandes/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/commandes` | Liste toutes les commandes |
| `POST` | `/api/commandes` | Créer une commande/réservation |
| `PUT` | `/api/commandes/:id` | Modifier une commande |
| `DELETE` | `/api/commandes/:id` | Supprimer une commande |

### 2.6 Rendez-vous (`/api/rdv/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/rdv` | Liste tous les RDV |
| `POST` | `/api/rdv` | Créer un RDV |
| `PUT` | `/api/rdv/:id` | Modifier un RDV |
| `DELETE` | `/api/rdv/:id` | Supprimer un RDV |

### 2.7 Notifications RDV (`/api/rdv-notifications/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/rdv-notifications` | Notifications de RDV |
| `PUT` | `/api/rdv-notifications/:id/read` | Marquer comme lu |

### 2.8 Pointage (`/api/pointage/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/pointage` | Liste tous les pointages |
| `POST` | `/api/pointage` | Créer un pointage |
| `PUT` | `/api/pointage/:id` | Modifier un pointage |
| `DELETE` | `/api/pointage/:id` | Supprimer un pointage |

### 2.9 Entreprises (`/api/entreprises/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/entreprises` | Liste toutes les entreprises |
| `POST` | `/api/entreprises` | Créer une entreprise |
| `PUT` | `/api/entreprises/:id` | Modifier |
| `DELETE` | `/api/entreprises/:id` | Supprimer |

### 2.10 Travailleurs (`/api/travailleurs/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/travailleurs` | Liste tous les travailleurs |
| `POST` | `/api/travailleurs` | Créer un travailleur |
| `PUT` | `/api/travailleurs/:id` | Modifier |
| `DELETE` | `/api/travailleurs/:id` | Supprimer |

### 2.11 Notes (`/api/notes/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/notes` | Liste toutes les notes |
| `POST` | `/api/notes` | Créer une note |
| `PUT` | `/api/notes/:id` | Modifier une note |
| `DELETE` | `/api/notes/:id` | Supprimer une note |
| `PUT` | `/api/notes/:id/move` | Déplacer une note vers une autre colonne |
| `PUT` | `/api/notes/batch/reorder` | Réordonner plusieurs notes (⚠️ doit être avant `/:id` dans les routes) |

### 2.12 Colonnes de notes (`/api/notes/columns/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/notes/columns` | Liste toutes les colonnes |
| `POST` | `/api/notes/columns` | Créer une colonne |
| `PUT` | `/api/notes/columns/:id` | Modifier une colonne |
| `DELETE` | `/api/notes/columns/:id` | Supprimer une colonne (et ses notes) |
| `PUT` | `/api/notes/columns/batch/reorder` | Réordonner les colonnes |

### 2.13 Tâches (`/api/taches/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/taches` | Liste toutes les tâches |
| `POST` | `/api/taches` | Créer une tâche |
| `PUT` | `/api/taches/:id` | Modifier une tâche |
| `DELETE` | `/api/taches/:id` | Supprimer une tâche |

### 2.14 Comptabilité — Achats (`/api/compta/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/compta` | Liste tous les achats |
| `POST` | `/api/compta` | Enregistrer un achat |
| `PUT` | `/api/compta/:id` | Modifier un achat |
| `DELETE` | `/api/compta/:id` | Supprimer un achat |

### 2.15 Dépenses (`/api/depenses/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/depenses` | Liste toutes les dépenses |
| `POST` | `/api/depenses` | Créer une dépense |
| `PUT` | `/api/depenses/:id` | Modifier |
| `DELETE` | `/api/depenses/:id` | Supprimer |

### 2.16 Objectifs (`/api/objectifs/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/objectifs` | Liste les objectifs |
| `POST` | `/api/objectifs` | Créer un objectif |
| `PUT` | `/api/objectifs/:id` | Modifier |
| `DELETE` | `/api/objectifs/:id` | Supprimer |

### 2.17 Bénéfices (`/api/benefices/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/benefices` | Liste les bénéfices |
| `POST` | `/api/benefices` | Enregistrer un bénéfice |

### 2.18 Avances (`/api/avances/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/avances` | Liste les avances sur salaire |
| `POST` | `/api/avances` | Créer une avance |
| `PUT` | `/api/avances/:id` | Modifier |
| `DELETE` | `/api/avances/:id` | Supprimer |

### 2.19 Prêts Familles (`/api/pretfamilles/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/pretfamilles` | Liste des prêts familles |
| `POST` | `/api/pretfamilles` | Créer un prêt |
| `PUT` | `/api/pretfamilles/:id` | Modifier |
| `DELETE` | `/api/pretfamilles/:id` | Supprimer |

### 2.20 Prêts Produits (`/api/pretproduits/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/pretproduits` | Liste des prêts produits |
| `POST` | `/api/pretproduits` | Créer un prêt |
| `PUT` | `/api/pretproduits/:id` | Modifier |
| `DELETE` | `/api/pretproduits/:id` | Supprimer |

### 2.21 Remboursements (`/api/remboursements/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/remboursements` | Liste des remboursements |
| `POST` | `/api/remboursements` | Créer un remboursement |
| `DELETE` | `/api/remboursements/:id` | Supprimer |

### 2.22 Messages (`/api/messages/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/messages` | Liste des messages |
| `POST` | `/api/messages` | Envoyer un message |
| `DELETE` | `/api/messages/:id` | Supprimer |

### 2.23 Messagerie (`/api/messagerie/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/messagerie` | Conversations |
| `POST` | `/api/messagerie` | Envoyer dans une conversation |

### 2.24 Liens de partage (`/api/share-links/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/share-links` | Créer un lien de partage (pointage, tâches ou notes) |
| `GET` | `/api/share-links/token/:token` | Récupérer les données d'un lien via son token |
| `GET` | `/api/share-links/my-links` | Mes liens créés |

### 2.25 Commentaires partagés (`/api/share-comments/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/share-comments/link/:linkId` | Commentaires d'un lien |
| `POST` | `/api/share-comments` | Ajouter un commentaire (stocké en JSON + snapshot HTML) |
| `PUT` | `/api/share-comments/:id/read` | Marquer comme lu |
| `DELETE` | `/api/share-comments/delete/:id` | Supprimer un commentaire (seulement si déjà lu). Supprime aussi le fichier HTML |

### 2.26 Partage de notes (`/api/notes-share/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/notes-share` | Partager des notes |
| `GET` | `/api/notes-share/token/:token` | Récupérer les notes partagées |

### 2.27 Commentaires produits (`/api/product-comments/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/product-comments/:productId` | Commentaires d'un produit |
| `POST` | `/api/product-comments` | Ajouter un commentaire |
| `DELETE` | `/api/product-comments/:id` | Supprimer |

### 2.28 Fournisseurs (`/api/fournisseurs/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/fournisseurs` | Liste des fournisseurs |
| `POST` | `/api/fournisseurs` | Créer un fournisseur |

### 2.29 Nouveaux achats (`/api/nouvelle-achat/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/nouvelle-achat` | Liste |
| `POST` | `/api/nouvelle-achat` | Créer |

### 2.30 Profil (`/api/profile/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/profile` | Récupérer le profil |
| `PUT` | `/api/profile` | Modifier le profil |
| `POST` | `/api/profile/avatar` | Upload avatar |

### 2.31 Paramètres (`/api/settings/`, `/api/parametres/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/settings` | Paramètres généraux |
| `PUT` | `/api/settings` | Modifier paramètres |
| `GET` | `/api/parametres` | Paramètres avancés |
| `PUT` | `/api/parametres` | Modifier |

### 2.32 Modules (`/api/module-settings/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/module-settings` | Modules activés/désactivés |
| `PUT` | `/api/module-settings` | Modifier |

### 2.33 Indisponibilités (`/api/indisponible/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/indisponible` | Liste des indisponibilités |
| `POST` | `/api/indisponible` | Créer |
| `DELETE` | `/api/indisponible/:id` | Supprimer |

### 2.34 Synchronisation SSE (`/api/sync/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/sync/events` | Connexion SSE (Server-Sent Events) pour recevoir les mises à jour en temps réel |

### 2.35 Chiffrement (`/api/encryption/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/encryption/setup` | Configurer la clé de chiffrement |
| `GET` | `/api/encryption/status` | État du chiffrement |

---

## 3. Contrôleurs

Les contrôleurs contiennent la **logique métier** des routes. Ils sont dans `server/controllers/`.

| Contrôleur | Fichier | Description |
|------------|---------|-------------|
| `authController` | `authController.js` | Login, register, verify token, reset password, check email. Gère le verrouillage du compte (failedAttempts, lockedUntil) |
| `productController` | `productController.js` | CRUD produits, gestion des photos, génération de codes produit |
| `saleController` | `saleController.js` | CRUD ventes, mise à jour du stock lors d'une vente |
| `clientController` | `clientController.js` | CRUD clients, upload photo |
| `commandeController` | `commandeController.js` | CRUD commandes, report, gestion des réservations |
| `rdvController` | `rdvController.js` | CRUD rendez-vous |
| `pointageController` | `pointageController.js` | CRUD pointages |
| `tacheController` | `tacheController.js` | CRUD tâches |
| `comptaController` | `comptaController.js` | CRUD achats comptabilité |
| `depenseController` | `depenseController.js` | CRUD dépenses |
| `objectifController` | `objectifController.js` | CRUD objectifs |
| `beneficeController` | `beneficeController.js` | CRUD bénéfices |
| `messageController` | `messageController.js` | CRUD messages |
| `pretFamilleController` | `pretFamilleController.js` | CRUD prêts familles |
| `pretProduitController` | `pretProduitController.js` | CRUD prêts produits |
| `remboursementController` | `remboursementController.js` | CRUD remboursements |
| `crudControllers` | `crudControllers.js` | Contrôleurs CRUD génériques réutilisables |

---

## 4. Modèles

Les modèles gèrent la **lecture et écriture** dans les fichiers JSON. Chaque modèle offre des méthodes CRUD.

| Modèle | Fichier | Base de données | Méthodes |
|--------|---------|----------------|----------|
| `User` | `User.js` | `users.json` | getAll, getById, getByEmail, create, update, comparePassword, updatePassword |
| `Product` | `Product.js` | `products.json` | getAll, getById, create, update, delete, updateQuantity |
| `Sale` | `Sale.js` | `sales.json` | getAll, create, delete, getByMonth |
| `Client` | `Client.js` | `clients.json` | getAll, getById, create, update, delete |
| `Commande` | `Commande.js` | `commandes.json` | getAll, getById, create, update, delete |
| `Rdv` | `Rdv.js` | `rdv.json` | getAll, getById, create, update, delete |
| `RdvNotification` | `RdvNotification.js` | `rdvNotifications.json` | getAll, create, markAsRead |
| `Pointage` | `Pointage.js` | `pointage.json` | getAll, create, update, delete |
| `Note` | `Note.js` | `notes.json` + `noteColumns.json` | getAll, create, update, delete, moveToColumn, reorder, getAllColumns, createColumn, updateColumn, deleteColumn, reorderColumns |
| `Tache` | `Tache.js` | `taches.json` | getAll, create, update, delete |
| `Compta` | `Compta.js` | `achats.json` | getAll, create, update, delete |
| `DepenseDuMois` | `DepenseDuMois.js` | `depenses.json` | getAll, create, update, delete |
| `Objectif` | `Objectif.js` | `objectifs.json` | getAll, create, update, delete |
| `Benefice` | `Benefice.js` | `benefices.json` | getAll, create |
| `Message` | `Message.js` | `messages.json` | getAll, create, delete |
| `Avance` | `Avance.js` | `avances.json` | getAll, create, update, delete |
| `PretFamille` | `PretFamille.js` | `pretfamilles.json` | getAll, create, update, delete |
| `PretProduit` | `PretProduit.js` | `pretproduits.json` | getAll, create, update, delete |
| `Remboursement` | `Remboursement.js` | `remboursements.json` | getAll, create, delete |
| `Fournisseur` | `Fournisseur.js` | `fournisseurs.json` | getAll, create |
| `NouvelleAchat` | `NouvelleAchat.js` | `nouvelleAchats.json` | getAll, create |
| `Entreprise` | `Entreprise.js` | `entreprises.json` | getAll, create, update, delete |
| `Travailleur` | `Travailleur.js` | `travailleurs.json` | getAll, create, update, delete |
| `ProductComment` | `ProductComment.js` | `productComments.json` | getAll, getByProduct, create, delete |

---

## 5. Middlewares

Les middlewares s'exécutent **avant** les routes pour valider, sécuriser et transformer les requêtes.

| Middleware | Fichier | Description |
|-----------|---------|-------------|
| `auth.js` | `middleware/auth.js` | Vérifie le token JWT dans le header `Authorization: Bearer <token>`. Bloque l'accès si absent ou invalide. Ajoute `req.user` à la requête |
| `security.js` | `middleware/security.js` | Rate limiting (max requêtes/minute), sanitization des entrées (XSS, injection), headers sécurisés, log activité suspecte |
| `encryption.js` | `middleware/encryption.js` | Fonctions `readJsonDecrypted()` et `writeJsonEncrypted()` pour lire/écrire les fichiers JSON chiffrés |
| `patchDbIO.js` | `middleware/patchDbIO.js` | **Patch transparent** : remplace `fs.readFileSync` et `fs.writeFileSync` pour que TOUTE lecture/écriture de fichier JSON dans `db/` soit automatiquement chiffrée/déchiffrée. **Doit être chargé en premier** |
| `upload.js` | `middleware/upload.js` | Configuration Multer pour l'upload de fichiers (photos produits, avatars, photos clients) |
| `validation.js` | `middleware/validation.js` | Validation des données entrantes |
| `sync.js` | `middleware/sync.js` | Gestion des événements SSE pour la synchronisation temps réel |
| `dbHelper.js` | `middleware/dbHelper.js` | Utilitaires pour la base de données JSON |

---

## 6. Services

| Service | Fichier | Description |
|---------|---------|-------------|
| `availabilityService.js` | `services/availabilityService.js` | Vérifie la disponibilité pour les RDV (conflits, indisponibilités) |
| `fileService.js` | `services/fileService.js` | Opérations sur les fichiers (création dossiers, suppression, etc.) |
