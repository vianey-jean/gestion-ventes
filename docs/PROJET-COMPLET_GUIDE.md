# 📘 Guide Complet du Projet - Gestion des Ventes

> Documentation exhaustive de toutes les pages, composants, formulaires, CRUD, notifications et fonctionnalités de l'application.

---

## Table des matières

1. [Architecture Générale](#1-architecture-générale)
2. [Authentification](#2-authentification)
3. [Dashboard](#3-dashboard)
4. [Ventes](#4-ventes)
5. [Produits / Inventaire](#5-produits--inventaire)
6. [Clients](#6-clients)
7. [Commandes / Réservations](#7-commandes--réservations)
8. [Rendez-vous (RDV)](#8-rendez-vous-rdv)
9. [Tendances & Analytiques](#9-tendances--analytiques)
10. [Comptabilité](#10-comptabilité)
11. [Prêt Produits](#11-prêt-produits)
12. [Prêt Familles](#12-prêt-familles)
13. [Dépenses du Mois](#13-dépenses-du-mois)
14. [Remboursements](#14-remboursements)
15. [Messages](#15-messages)
16. [Objectifs & Statistiques](#16-objectifs--statistiques)
17. [Notifications RDV](#17-notifications-rdv)
18. [Fournisseurs](#18-fournisseurs)
19. [Finance Pro & Analytics Pro](#19-finance-pro--analytics-pro)
20. [Graphiques](#20-graphiques)
21. [Pages Publiques](#21-pages-publiques)

---

## 1. Architecture Générale

### Stack technique
- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS
- **Backend** : Express.js (Node.js) avec base de données JSON (fichiers dans `server/db/`)
- **Temps réel** : SSE (Server-Sent Events) via `/api/sync/events`
- **Auth** : JWT (8h expiration) + bcrypt

### Structure des fichiers

```
src/
├── App.tsx                    → Routes principales + Providers
├── pages/                     → Pages de l'application
├── components/
│   ├── dashboard/             → Composants du tableau de bord
│   ├── clients/               → Composants clients
│   ├── commandes/             → Composants commandes
│   ├── rdv/                   → Composants rendez-vous
│   ├── shared/                → Composants réutilisables
│   └── ui/                    → Composants UI (shadcn)
├── hooks/                     → Hooks personnalisés
├── services/api/              → Services API (axios)
├── contexts/                  → Contextes React
└── types/                     → Types TypeScript

server/
├── server.js                  → Point d'entrée Express
├── routes/                    → Routes API REST
├── models/                    → Modèles CRUD (lecture/écriture JSON)
├── middleware/                → Auth, sécurité, validation
├── db/                        → Fichiers JSON (base de données)
└── uploads/                   → Photos produits uploadées
```

### Routes de l'application

| Route | Page | Protection |
|-------|------|-----------|
| `/` | HomePage | Public |
| `/about` | AboutPage | Public |
| `/contact` | ContactPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/dashboard` | DashboardPage | Protégée |
| `/tendances` | TendancesPage | Protégée |
| `/clients` | ClientsPage | Protégée |
| `/messages` | MessagesPage | Protégée |
| `/commandes` | CommandesPage | Protégée |
| `/rdv` | RdvPage | Protégée |
| `/produits` | ProduitsPage | Protégée |

### Base de données (fichiers JSON)

| Fichier | Contenu |
|---------|---------|
| `users.json` | Utilisateurs (auth) |
| `products.json` | Produits (inventaire) |
| `sales.json` | Ventes + remboursements |
| `clients.json` | Clients |
| `commandes.json` | Commandes/réservations |
| `rdv.json` | Rendez-vous |
| `rdvNotifications.json` | Notifications de RDV |
| `pretproduits.json` | Prêts produits (crédit client) |
| `pretfamilles.json` | Prêts familles |
| `depensedumois.json` | Dépenses mensuelles personnelles |
| `depensefixe.json` | Dépenses fixes (abonnements) |
| `nouvelle_achat.json` | Achats produits + dépenses pro |
| `compta.json` | Données comptabilité calculées |
| `benefice.json` | Historique des bénéfices |
| `objectif.json` | Objectifs mensuels |
| `messages.json` | Messages |
| `remboursement.json` | Remboursements |
| `fournisseurs.json` | Fournisseurs |

---

## 2. Authentification

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/LoginPage.tsx` | Page de connexion |
| `src/pages/RegisterPage.tsx` | Page d'inscription |
| `src/pages/ResetPasswordPage.tsx` | Réinitialisation du mot de passe |
| `src/contexts/AuthContext.tsx` | Contexte d'authentification global |
| `src/components/auth/ProtectedRoute.tsx` | Garde de route pour pages protégées |
| `src/components/PasswordInput.tsx` | Champ mot de passe avec toggle visibilité |
| `src/components/PasswordStrengthChecker.tsx` | Indicateur de force du mot de passe |
| `server/routes/auth.js` | Routes API : login, register, reset |
| `server/models/User.js` | Modèle utilisateur |
| `server/middleware/auth.js` | Middleware JWT |

### Flux de connexion
1. L'utilisateur saisit email + mot de passe sur `/login`
2. `POST /api/auth/login` → vérifie les identifiants avec bcrypt
3. Si valide → retourne un token JWT (8h) + données utilisateur
4. Le token est stocké dans `localStorage` et envoyé dans chaque requête via l'intercepteur axios
5. `ProtectedRoute` vérifie la présence du token avant d'afficher les pages protégées

### Flux d'inscription
1. L'utilisateur remplit le formulaire sur `/register`
2. `PasswordStrengthChecker` valide la force du mot de passe en temps réel
3. `POST /api/auth/register` → hash bcrypt + création dans `users.json`
4. Redirection vers `/login`

### Déconnexion automatique
- Le hook `use-auto-logout.tsx` déconnecte l'utilisateur après une période d'inactivité
- Le token expiré (401) déclenche aussi une déconnexion via l'intercepteur axios

---

## 3. Dashboard

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/DashboardPage.tsx` | Page container avec onglets |
| `src/pages/dashboard/DashboardHero.tsx` | En-tête héroïque animé |
| `src/pages/dashboard/DashboardTabNavigation.tsx` | Navigation par onglets |
| `src/pages/dashboard/DashboardTabContent.tsx` | Contenu de chaque onglet |
| `src/components/dashboard/sections/SalesOverviewSection.tsx` | Section vue d'ensemble des ventes |
| `src/components/dashboard/sections/SalesManagementSection.tsx` | Section gestion des ventes |
| `src/components/dashboard/sections/AdvancedDashboardSection.tsx` | Section avancée |

### Onglets du Dashboard

1. **Ventes** → Vue d'ensemble + gestion des ventes
2. **Prêt Produit** → Gestion des crédits clients
3. **Prêt Famille** → Gestion des prêts familiaux
4. **Dépenses** → Suivi des dépenses mensuelles
5. **Inventaire** → Gestion des stocks
6. **Bénéfice** → Calcul des bénéfices
7. **Finance Pro** → Comptabilité avancée
8. **Analytics Pro** → Rapports et analyses

---

## 4. Ventes

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/AddSaleForm.tsx` | Formulaire d'ajout d'une vente simple |
| `src/components/dashboard/forms/MultiProductSaleForm.tsx` | Formulaire multi-produits |
| `src/components/dashboard/SalesTable.tsx` | Tableau des ventes du mois |
| `src/components/dashboard/VentesProduits.tsx` | Ventes groupées par produit |
| `src/components/dashboard/VentesParClientsModal.tsx` | Ventes par client |
| `src/components/dashboard/ExportSalesDialog.tsx` | Export des ventes en PDF |
| `src/components/dashboard/StatCard.tsx` | Carte de statistique |
| `src/hooks/useSales.ts` | Hook de gestion des ventes |
| `src/services/api/saleApi.ts` | Service API ventes |
| `server/routes/sales.js` | Routes API ventes |
| `server/models/Sale.js` | Modèle vente |
| `server/db/sales.json` | Base de données ventes |

### CRUD Ventes

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `SalesTable` | `GET /api/sales` | `Sale.getAll()` |
| Créer | `AddSaleForm` / `MultiProductSaleForm` | `POST /api/sales` | `Sale.create()` |
| Modifier | `AddSaleForm` (mode édition) | `PUT /api/sales/:id` | `Sale.update()` |
| Supprimer | Bouton supprimer dans `AddSaleForm` | `DELETE /api/sales/:id` | `Sale.delete()` |

### Formulaire MultiProductSaleForm
- Permet d'ajouter plusieurs produits dans une seule vente
- Recherche de produit par description (min 3 caractères)
- Calcul automatique du prix total, coût d'achat et bénéfice
- Sélection du client (existant ou nouveau)
- Gestion des avances (acompte partiel → crée un prêt produit automatiquement)
- Option de réservation (crée une commande + RDV)
- Détection de conflit si le stock est insuffisant à cause de réservations existantes → modale de suppression de réservation

### Logique de calcul
```
profit = totalSellingPrice - totalPurchasePrice
totalSellingPrice = Σ(quantitySold × sellingPrice) pour chaque produit
totalPurchasePrice = Σ(quantitySold × purchasePrice) pour chaque produit
```

### Export PDF
- `ExportSalesDialog` permet d'exporter les ventes d'un mois donné en PDF
- Utilise `jspdf` + `jspdf-autotable`

---

## 5. Produits / Inventaire

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/Inventaire.tsx` | Composant principal d'inventaire |
| `src/components/dashboard/AddProductForm.tsx` | Formulaire d'ajout de produit |
| `src/components/dashboard/EditProductForm.tsx` | Formulaire d'édition |
| `src/components/dashboard/ProductPhotoSlideshow.tsx` | Diaporama photos |
| `src/components/dashboard/PhotoUploadSection.tsx` | Upload de photos |
| `src/components/dashboard/ProductSearchInput.tsx` | Recherche de produit |
| `src/components/dashboard/inventory/InventoryAnalyzer.tsx` | Analyse d'inventaire |
| `src/hooks/useProducts.ts` | Hook de gestion des produits |
| `src/services/api/productApi.ts` | Service API produits |
| `server/routes/products.js` | Routes API produits |
| `server/models/Product.js` | Modèle produit |
| `server/db/products.json` | Base de données produits |

### CRUD Produits

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `Inventaire` | `GET /api/products` | `Product.getAll()` |
| Créer | `AddProductForm` | `POST /api/products` | `Product.create()` |
| Modifier | `EditProductForm` | `PUT /api/products/:id` | `Product.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/products/:id` | `Product.delete()` |

### Structure d'un produit
```json
{
  "id": "string",
  "code": "string (auto-généré)",
  "description": "string",
  "purchasePrice": "number",
  "sellingPrice": "number (optionnel)",
  "quantity": "number",
  "photos": ["string (URL)"],
  "dateCreation": "string (ISO)"
}
```

### Fonctionnalités Inventaire
- **Recherche** par description ou code unique
- **Filtrage** par catégorie (perruque, tissage, autre)
- **Tri** par quantité (croissant/décroissant)
- **Pagination** (10 produits par page)
- **Indicateurs de stock** : priorité haute (< 3), moyenne (< 5), basse (≥ 5)
- **Upload de photos** multiples avec prévisualisation
- **Téléchargement PDF** d'étiquette produit avec code et QR
- **Statistiques** : total produits, valeur du stock, alertes de rupture

---

## 6. Clients

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/ClientsPage.tsx` | Page principale des clients |
| `src/pages/clients/ClientHero.tsx` | En-tête héroïque |
| `src/pages/clients/ClientSearchSection.tsx` | Barre de recherche |
| `src/components/clients/ClientCard.tsx` | Carte individuelle client |
| `src/components/clients/ClientSearchBar.tsx` | Composant de recherche |
| `src/components/clients/ClientsGrid.tsx` | Grille de clients |
| `src/components/clients/ClientsHero.tsx` | Héro des clients |
| `src/components/forms/ClientForm.tsx` | Formulaire client |
| `src/hooks/useClients.ts` | Hook de gestion des clients |
| `src/hooks/useClientSync.ts` | Sync temps réel |
| `src/services/api/clientApi.ts` | Service API clients |
| `server/routes/clients.js` | Routes API clients |
| `server/models/Client.js` | Modèle client |
| `server/db/clients.json` | Base de données clients |

### CRUD Clients

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `ClientsGrid` | `GET /api/clients` | `Client.getAll()` |
| Créer | `ClientForm` | `POST /api/clients` | `Client.create()` |
| Modifier | `ClientForm` (mode édition) | `PUT /api/clients/:id` | `Client.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/clients/:id` | `Client.delete()` |

### Structure d'un client
```json
{
  "id": "string",
  "nom": "string",
  "phone": "string",
  "adresse": "string",
  "dateCreation": "string (ISO)"
}
```

### Fonctionnalités
- **Recherche** par nom, téléphone ou adresse
- **Actions téléphone** : appel direct ou WhatsApp via `PhoneActionModal`
- **Actions adresse** : ouverture dans Google Maps via `AddressActionModal`
- **Statistiques** : nombre total, nouveaux ce mois, clients actifs

---

## 7. Commandes / Réservations

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/CommandesPage.tsx` | Page principale des commandes |
| `src/components/commandes/CommandeFormDialog.tsx` | Formulaire de commande |
| `src/components/commandes/CommandesTable.tsx` | Tableau des commandes |
| `src/components/commandes/CommandesSearchBar.tsx` | Barre de recherche |
| `src/components/commandes/CommandesHero.tsx` | En-tête héroïque |
| `src/components/commandes/CommandesStatsButtons.tsx` | Boutons de stats |
| `src/components/commandes/CommandesDialogs.tsx` | Dialogues de gestion |
| `src/components/commandes/ConfirmationDialogs.tsx` | Dialogues de confirmation |
| `src/components/commandes/ReporterModal.tsx` | Modal reporter une commande |
| `src/components/commandes/RdvCreationModal.tsx` | Création de RDV depuis commande |
| `src/components/commandes/RdvConfirmationModal.tsx` | Confirmation de RDV |
| `src/hooks/useCommandes.ts` | Hook de base |
| `src/hooks/useCommandesLogic.ts` | Logique métier complète |
| `src/services/api/commandeApi.ts` | Service API commandes |
| `server/routes/commandes.js` | Routes API |
| `server/models/Commande.js` | Modèle commande |
| `server/db/commandes.json` | Base de données |

### CRUD Commandes

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `CommandesTable` | `GET /api/commandes` | `Commande.getAll()` |
| Créer | `CommandeFormDialog` | `POST /api/commandes` | `Commande.create()` |
| Modifier | `CommandeFormDialog` (édition) | `PUT /api/commandes/:id` | `Commande.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/commandes/:id` | `Commande.delete()` |
| Valider | Bouton valider | `PUT /api/commandes/:id` (statut=validé) | `Commande.update()` |
| Reporter | `ReporterModal` | `PUT /api/commandes/:id` | `Commande.update()` |

### Logique de réservation
- **Recherche produit** : min 3 caractères, affiche les produits avec stock disponible (quantité totale - quantité réservée > 0)
- **Quantité disponible** : calculée en soustrayant les réservations actives du stock total
- **Prévention doublon** : impossible de réserver le même produit pour le même client à la même date
- **Création RDV** : une commande crée automatiquement un RDV associé (avec `commandeId`)
- **Expiration** : si la date de réservation est expirée sans report, la quantité réservée redevient disponible

### Statuts de commande
- `en_attente` → En attente de traitement
- `valide` → Commande validée/livrée
- `annule` → Commande annulée

---

## 8. Rendez-vous (RDV)

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/RdvPage.tsx` | Page principale |
| `src/pages/rdv/RdvHero.tsx` | En-tête héroïque |
| `src/pages/rdv/RdvSearchBar.tsx` | Barre de recherche |
| `src/pages/rdv/RdvStatsCards.tsx` | Cartes de stats |
| `src/pages/rdv/RdvListView.tsx` | Vue liste des RDV |
| `src/components/rdv/RdvCalendar.tsx` | Calendrier des RDV |
| `src/components/rdv/RdvCard.tsx` | Carte individuelle RDV |
| `src/components/rdv/RdvForm.tsx` | Formulaire de RDV |
| `src/components/rdv/RdvNotifications.tsx` | Composant notifications |
| `src/components/rdv/RdvStatsCards.tsx` | Cartes statistiques |
| `src/components/rdv/RdvStatsDetailsModal.tsx` | Modal détails stats |
| `src/components/rdv/RdvStatsModals.tsx` | Modales de statistiques |
| `src/hooks/useRdv.ts` | Hook de gestion |
| `src/services/api/rdvApi.ts` | Service API RDV |
| `src/services/api/rdvNotificationsApi.ts` | Service API notifications |
| `server/routes/rdv.js` | Routes API RDV |
| `server/routes/rdvNotifications.js` | Routes API notifications |
| `server/models/Rdv.js` | Modèle RDV |
| `server/models/RdvNotification.js` | Modèle notification |
| `server/db/rdv.json` | Base de données RDV |
| `server/db/rdvNotifications.json` | Base de données notifications |

### CRUD RDV

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `RdvCalendar` + `RdvListView` | `GET /api/rdv` | `Rdv.getAll()` |
| Créer | `RdvForm` | `POST /api/rdv` | `Rdv.create()` |
| Modifier | `RdvForm` (édition) | `PUT /api/rdv/:id` | `Rdv.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/rdv/:id` | `Rdv.delete()` |

### Règles spéciales pour les RDV issus de réservations
- Les RDV créés depuis la page commandes portent un `commandeId`
- **Calendrier** : quand on clique sur un RDV avec `commandeId`, les boutons "Modifier" et "Supprimer" sont **masqués**
- **Vue liste** : les boutons "Modifier" et "Supprimer" sont **masqués** pour les RDV avec `commandeId`
- Seuls les RDV créés manuellement depuis la page RDV peuvent être modifiés/supprimés

### Fonctionnalités
- **Calendrier interactif** : vue mensuelle avec indicateurs visuels
- **Vue liste** : liste scrollable avec filtres et recherche
- **Statistiques** : total RDV, aujourd'hui, cette semaine, ce mois
- **Notifications** : alertes pour les RDV à venir (voir section 17)

---

## 9. Tendances & Analytiques

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/TendancesPage.tsx` | Page principale |
| `src/pages/tendances/TendancesHero.tsx` | En-tête héroïque |
| `src/pages/tendances/TendancesStatsCards.tsx` | Cartes de statistiques |
| `src/pages/tendances/TendancesTabNavigation.tsx` | Navigation onglets |
| `src/pages/tendances/TendancesOverviewTab.tsx` | Onglet vue d'ensemble |
| `src/pages/tendances/TendancesProductsTab.tsx` | Onglet produits |
| `src/pages/tendances/TendancesClientsTab.tsx` | Onglet clients |
| `src/pages/tendances/TendancesCategoriesTab.tsx` | Onglet catégories |
| `src/pages/tendances/TendancesStockTab.tsx` | Onglet stock |
| `src/pages/tendances/TendancesRecommendationsTab.tsx` | Onglet recommandations |
| `src/pages/tendances/useTendancesData.ts` | Hook de données |
| `src/components/tendances/TendancesStatsModals.tsx` | Modales de stats |

### Onglets Tendances

1. **Vue d'ensemble** → Graphiques généraux des ventes et bénéfices
2. **Produits** → Classement des produits les plus vendus
3. **Clients** → Analyse des meilleurs clients
4. **Catégories** → Répartition par catégorie de produit
5. **Stock** → Analyse de la rotation des stocks
6. **Recommandations** → Suggestions basées sur les données

### Statistiques affichées
- Chiffre d'affaires mensuel
- Nombre de ventes
- Bénéfice total
- Panier moyen
- Top produits et clients

---

## 10. Comptabilité

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/comptabilite/ComptabiliteModule.tsx` | Module principal |
| `src/components/dashboard/comptabilite/ComptabiliteHeader.tsx` | En-tête avec sélecteurs |
| `src/components/dashboard/comptabilite/ComptabiliteStatsCards.tsx` | Cartes principales |
| `src/components/dashboard/comptabilite/SecondaryStatsCards.tsx` | Cartes secondaires |
| `src/components/dashboard/comptabilite/ComptabiliteTabs.tsx` | Onglets (graphiques + historique) |
| `src/components/dashboard/comptabilite/AchatFormDialog.tsx` | Formulaire d'achat |
| `src/components/dashboard/comptabilite/DepenseFormDialog.tsx` | Formulaire de dépense |
| `src/components/dashboard/comptabilite/AchatsHistoriqueList.tsx` | Historique des achats |
| `src/components/dashboard/comptabilite/ProductSearchInput.tsx` | Recherche produit |
| `src/components/dashboard/comptabilite/EvolutionMensuelleChart.tsx` | Graphique mensuel |
| `src/components/dashboard/comptabilite/DepensesRepartitionChart.tsx` | Graphique répartition |
| `src/components/dashboard/comptabilite/StableCharts.tsx` | Graphiques stables |
| `src/components/dashboard/comptabilite/modals/*.tsx` | Modales de détails |
| `src/components/dashboard/comptabilite/details/*.tsx` | Composants de détails |
| `src/components/dashboard/comptabilite/shared/*.tsx` | Composants partagés |
| `src/hooks/useComptabilite.ts` | Hook centralisé |
| `src/services/api/nouvelleAchatApi.ts` | Service API achats |
| `src/services/api/comptaApi.ts` | Service API compta |
| `server/routes/nouvelleAchat.js` | Routes API achats |
| `server/routes/compta.js` | Routes API compta |
| `server/models/NouvelleAchat.js` | Modèle achat |
| `server/models/Compta.js` | Modèle compta |
| `server/db/nouvelle_achat.json` | Base de données achats |
| `server/db/compta.json` | Base de données compta |

### CRUD Achats

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister par mois | `AchatsHistoriqueList` | `GET /api/nouvelle-achat/monthly/:year/:month` | `NouvelleAchat.getByMonthYear()` |
| Créer achat | `AchatFormDialog` | `POST /api/nouvelle-achat` | `NouvelleAchat.create()` |
| Créer dépense | `DepenseFormDialog` | `POST /api/nouvelle-achat/depense` | `NouvelleAchat.addDepense()` |
| Modifier | Modal édition | `PUT /api/nouvelle-achat/:id` | `NouvelleAchat.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/nouvelle-achat/:id` | `NouvelleAchat.delete()` |

### Logique de création d'achat
1. Si un produit existant est sélectionné → **mise à jour du stock** (quantité ajoutée)
2. Si c'est un nouveau produit → **création dans products.json** + enregistrement dans `nouvelle_achat.json`
3. Le **fournisseur** est automatiquement enregistré dans `fournisseurs.json` s'il n'existe pas (voir section 18)

### Formulaire AchatFormDialog
- **Recherche de produit** : autocomplete dès 3 caractères
- **Description** : modifiable même si produit sélectionné (renomme le produit)
- **Prix d'achat** : optionnel si produit existant (garde le prix actuel)
- **Quantité** : obligatoire, affiche le nouveau stock prévu
- **Fournisseur** : autocomplete avec les fournisseurs existants, auto-enregistrement des nouveaux
- **Caractéristiques** : champ texte libre
- **Date d'achat** : obligatoire, sélecteur de date

### Statistiques comptables
- **Crédit** : total des ventes du mois
- **Débit** : achats produits + autres dépenses
- **Bénéfice ventes** : profit des ventes uniquement
- **Bénéfice réel** : bénéfice ventes - (achats + dépenses)
- **Solde net** : crédit - débit

### Modales de détails
- `CreditDetailsModal` → Détail des ventes (crédit)
- `DebitDetailsModal` → Détail des achats + dépenses (débit)
- `BeneficeVentesModal` → Détail du bénéfice des ventes
- `BeneficeReelModal` → Détail du bénéfice réel
- `AchatsProduitsModal` → Détail des achats de produits
- `AutresDepensesModal` → Détail des autres dépenses
- `SoldeNetModal` → Détail du solde net
- `ExportPdfModal` → Export du rapport en PDF

---

## 11. Prêt Produits

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/PretProduits.tsx` | Composant principal |
| `src/components/dashboard/PretProduitsGrouped.tsx` | Vue groupée par client |
| `src/components/dashboard/prets/PretGroupCard.tsx` | Carte groupe client |
| `src/components/dashboard/prets/PretHero.tsx` | En-tête héroïque |
| `src/components/dashboard/prets/PretStatsCards.tsx` | Cartes statistiques |
| `src/components/dashboard/forms/PretProduitFromSaleModal.tsx` | Modal création depuis vente |
| `src/components/dashboard/forms/AdvancePaymentModal.tsx` | Modal paiement avance |
| `src/components/dashboard/PretRetardNotification.tsx` | Notification de retard |
| `src/services/api/pretProduitApi.ts` | Service API |
| `server/routes/pretproduits.js` | Routes API |
| `server/models/PretProduit.js` | Modèle |
| `server/db/pretproduits.json` | Base de données |

### CRUD Prêt Produits

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `PretProduits` | `GET /api/pretproduits` | `PretProduit.getAll()` |
| Créer | Modal de création | `POST /api/pretproduits` | `PretProduit.create()` |
| Modifier | Modal d'édition | `PUT /api/pretproduits/:id` | `PretProduit.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/pretproduits/:id` | `PretProduit.delete()` |

### Logique métier
- Un prêt produit est créé quand un client paie un **acompte partiel** lors d'une vente
- Structure : `prixVente`, `avanceRecue`, `reste` (= prixVente - avanceRecue)
- Quand le client paie le `reste`, le prêt passe à `estPaye: true`
- **Groupement par client** : les prêts sont regroupés par nom de client
- **Notifications de retard** : alerte si un prêt est non payé depuis longtemps

---

## 12. Prêt Familles

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/PretFamilles.tsx` | Composant principal |
| `src/services/api/pretFamilleApi.ts` | Service API |
| `server/routes/pretfamilles.js` | Routes API |
| `server/models/PretFamille.js` | Modèle |
| `server/db/pretfamilles.json` | Base de données |

### CRUD Prêt Familles

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `PretFamilles` | `GET /api/pretfamilles` | `PretFamille.getAll()` |
| Créer | Dialog demande prêt | `POST /api/pretfamilles` | `PretFamille.create()` |
| Modifier | Dialog édition | `PUT /api/pretfamilles/:id` | `PretFamille.update()` |
| Supprimer | Bouton supprimer | `DELETE /api/pretfamilles/:id` | `PretFamille.delete()` |
| Rembourser | Dialog remboursement | `PUT /api/pretfamilles/:id` | `PretFamille.update()` |

### Logique métier
- Un prêt famille représente un emprunt accordé à un membre de la famille
- Structure : `pretTotal`, `soldeRestant`, `dernierRemboursement`, `dateRemboursement`
- Les remboursements réduisent le `soldeRestant`
- L'historique des remboursements est conservé

---

## 13. Dépenses du Mois

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/DepenseDuMois.tsx` | Composant principal |
| `src/components/dashboard/MonthlyResetHandler.tsx` | Gestionnaire de reset mensuel |
| `src/services/api/depenseApi.ts` | Service API |
| `server/routes/depenses.js` | Routes API |
| `server/db/depensedumois.json` | Base de données mouvements |
| `server/db/depensefixe.json` | Base de données dépenses fixes |

### CRUD Mouvements

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | Tableau mouvements | `GET /api/depenses/mouvements` | Lecture JSON |
| Créer | Dialog ajout | `POST /api/depenses/mouvements` | Écriture JSON |
| Modifier | Dialog édition | `PUT /api/depenses/mouvements/:id` | Mise à jour JSON |
| Supprimer | Bouton supprimer | `DELETE /api/depenses/mouvements/:id` | Suppression JSON |

### Fonctionnalités
- **Suivi crédit/débit** : chaque mouvement est soit un crédit soit un débit
- **Catégories** : salaire, courses, restaurant, free, divers
- **Dépenses fixes** : Free Mobile, Internet Zeop, assurance voiture, assurance vie, autres
- **Solde courant** : calculé en temps réel (crédit total - débit total)
- **Reset mensuel** : `MonthlyResetHandler` peut réinitialiser les données au changement de mois

---

## 14. Remboursements

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/RefundForm.tsx` | Formulaire de remboursement |
| `src/components/dashboard/ViewRefundsModal.tsx` | Modal consultation remboursements |
| `src/services/api/remboursementApi.ts` | Service API |
| `server/routes/remboursements.js` | Routes API |
| `server/models/Remboursement.js` | Modèle |
| `server/db/remboursement.json` | Base de données |

### CRUD Remboursements

| Action | Frontend | API | Backend |
|--------|----------|-----|---------|
| Lister | `ViewRefundsModal` | `GET /api/remboursements` | `Remboursement.getAll()` |
| Créer | `RefundForm` | `POST /api/remboursements` | `Remboursement.create()` |
| Supprimer | Via `AddSaleForm` | `DELETE /api/remboursements/:id` | `Remboursement.delete()` |

### Flux de remboursement
1. L'utilisateur sélectionne une vente à rembourser
2. Il choisit les produits et quantités à rembourser
3. Il peut modifier le prix de remboursement (partiel ou total)
4. Si remboursement total (prix = prix original) → option de remettre en stock
5. Une vente négative (`isRefund: true`) est créée dans `sales.json`
6. Le remboursement est enregistré dans `remboursement.json`

### Règles métier
- La quantité remboursée ≤ quantité vendue
- Le stock n'est restauré QUE si le prix est intégral ET que l'utilisateur confirme
- Les remboursements apparaissent en rouge dans la table des ventes
- Les valeurs sont toujours négatives dans `sales.json` pour un remboursement

---

## 15. Messages

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/pages/MessagesPage.tsx` | Page des messages |
| `src/hooks/use-messages.ts` | Hook de gestion |
| `src/services/api/index.ts` | Service API (messages) |
| `server/routes/messages.js` | Routes API |
| `server/models/Message.js` | Modèle |
| `server/db/messages.json` | Base de données |

### CRUD Messages

| Action | API | Backend |
|--------|-----|---------|
| Lister | `GET /api/messages` | `Message.getAll()` |
| Créer | `POST /api/messages` | `Message.create()` |
| Supprimer | `DELETE /api/messages/:id` | `Message.delete()` |

---

## 16. Objectifs & Statistiques

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/navbar/ObjectifIndicator.tsx` | Indicateur dans la navbar |
| `src/components/navbar/ObjectifStatsModal.tsx` | Modal statistiques objectifs |
| `src/components/navbar/modals/BeneficesHistoriqueModal.tsx` | Historique bénéfices |
| `src/components/navbar/modals/ObjectifChangesModal.tsx` | Historique changements |
| `src/components/navbar/modals/VentesHistoriqueModal.tsx` | Historique ventes |
| `src/hooks/useObjectif.ts` | Hook de gestion |
| `src/services/api/objectifApi.ts` | Service API |
| `server/routes/objectif.js` | Routes API |
| `server/models/Objectif.js` | Modèle |
| `server/db/objectif.json` | Base de données |

### Fonctionnalités
- **Définition d'objectif mensuel** : montant cible de bénéfice à atteindre
- **Indicateur de progression** : barre de progression dans la navbar
- **Statistiques des objectifs** : modal avec détails et historique
- **Historique** : suivi des changements d'objectifs, ventes et bénéfices

---

## 17. Notifications RDV

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/rdv/RdvNotifications.tsx` | Composant de notifications |
| `src/services/api/rdvNotificationsApi.ts` | Service API |
| `server/routes/rdvNotifications.js` | Routes API |
| `server/models/RdvNotification.js` | Modèle |
| `server/db/rdvNotifications.json` | Base de données |

### Fonctionnalités
- **Notifications automatiques** : alertes pour les RDV du jour et à venir
- **Marquage lu/non lu** : les notifications peuvent être marquées comme lues
- **Badge** : nombre de notifications non lues affiché dans la navbar
- **Types** : rappel de RDV, RDV imminent, RDV passé non traité

---

## 18. Fournisseurs

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/services/api/fournisseurApi.ts` | Service API frontend |
| `server/routes/fournisseurs.js` | Routes API |
| `server/models/Fournisseur.js` | Modèle |
| `server/db/fournisseurs.json` | Base de données |

### CRUD Fournisseurs

| Action | API | Backend |
|--------|-----|---------|
| Lister | `GET /api/fournisseurs` | `Fournisseur.getAll()` |
| Rechercher | `GET /api/fournisseurs/search?q=` | `Fournisseur.search()` |
| Créer | `POST /api/fournisseurs` | `Fournisseur.createIfNotExists()` |
| Supprimer | `DELETE /api/fournisseurs/:id` | `Fournisseur.delete()` |

### Logique métier
- Les fournisseurs sont **auto-enregistrés** lors de la création d'un achat dans `AchatFormDialog`
- Le champ fournisseur offre une **autocomplete** : dès la saisie d'un caractère, les fournisseurs existants sont suggérés
- Si le nom saisi ne correspond à aucun fournisseur existant, il est automatiquement créé lors de l'enregistrement de l'achat
- La recherche est insensible à la casse
- Pas de doublon : `createIfNotExists` vérifie l'existence par nom exact (insensible à la casse)

---

## 19. Finance Pro & Analytics Pro

### Finance Pro (onglet Dashboard)

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/AdvancedDashboard.tsx` | Dashboard avancé |
| `src/components/dashboard/accounting/ProfitLossStatement.tsx` | Compte de résultat |
| `src/components/dashboard/comptabilite/ComptabiliteModule.tsx` | Module comptabilité |

### Analytics Pro (onglet Dashboard)

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/reports/SalesReport.tsx` | Rapport des ventes |
| `src/components/dashboard/reports/ProfitEvolution.tsx` | Évolution des profits |
| `src/components/dashboard/reports/StockRotation.tsx` | Rotation des stocks |
| `src/components/dashboard/reports/YearlyComparison.tsx` | Comparaison annuelle |

### Sous-onglets AdvancedDashboard
1. **Inventaire** → `ComptabiliteModule` (achats/dépenses)
2. **Comptabilité** → `ProfitLossStatement` (compte de résultat)
3. **Rapports** → `SalesReport`, `ProfitEvolution`, `StockRotation`
4. **Annuelle** → `YearlyComparison`

---

## 20. Graphiques

### Bibliothèque utilisée : Recharts

| Graphique | Composant | Type |
|-----------|-----------|------|
| Évolution mensuelle | `EvolutionMensuelleChart` | BarChart |
| Répartition dépenses | `DepensesRepartitionChart` | PieChart |
| Évolution des profits | `ProfitEvolution` | LineChart / AreaChart |
| Rotation des stocks | `StockRotation` | BarChart |
| Rapport de ventes | `SalesReport` | BarChart + LineChart |
| Comparaison annuelle | `YearlyComparison` | BarChart groupé |
| Tendances Overview | `TendancesOverviewTab` | LineChart + BarChart |
| Tendances Catégories | `TendancesCategoriesTab` | PieChart |
| Tendances Stock | `TendancesStockTab` | BarChart |

### Données des graphiques
- Calculées côté frontend via les hooks (`useComptabilite`, `useTendancesData`)
- Basées sur les ventes (`allSales`), achats (`achats`) et produits (`products`)
- Formatage monétaire via `useCurrencyFormatter`

---

## 21. Pages Publiques

### HomePage (`/`)
- Page d'accueil de l'application
- Présentation des fonctionnalités
- Call-to-action vers la connexion

### AboutPage (`/about`)
- Page "À propos" de l'application
- Description du projet et de son créateur

### ContactPage (`/contact`)
- Formulaire de contact
- Informations de contact

### NotFound (`/*`)
- Page 404 pour les routes inexistantes
- Lien de retour vers l'accueil

---

## Annexes

### Composants partagés

| Composant | Rôle |
|-----------|------|
| `Layout.tsx` | Layout principal (Navbar + Footer + contenu) |
| `Navbar.tsx` | Barre de navigation avec menu et indicateurs |
| `Footer.tsx` | Pied de page |
| `ScrollToTop.tsx` | Remontée automatique en haut de page |
| `PageHero.tsx` | Composant héroïque réutilisable |
| `UnifiedSearchBar.tsx` | Barre de recherche unifiée |
| `Pagination.tsx` | Composant de pagination |
| `StatBadge.tsx` | Badge de statistique |
| `ConfirmDialog.tsx` | Dialogue de confirmation |
| `LoadingOverlay.tsx` | Overlay de chargement |
| `PhoneActionModal.tsx` | Modal actions téléphone |
| `AddressActionModal.tsx` | Modal actions adresse |

### Contextes React

| Contexte | Rôle |
|----------|------|
| `AuthContext` | Authentification (login, logout, token, user) |
| `AppContext` | Données globales (products, sales, clients, fetch) |
| `ThemeContext` | Thème clair/sombre |
| `FormProtectionContext` | Protection contre la perte de données de formulaire |
| `AccessibilityProvider` | Paramètres d'accessibilité |

### Services API

| Service | Base URL | Fichier |
|---------|----------|---------|
| Auth | `/api/auth` | `authApi.ts` |
| Products | `/api/products` | `productApi.ts` |
| Sales | `/api/sales` | `saleApi.ts` |
| Clients | `/api/clients` | `clientApi.ts` |
| Commandes | `/api/commandes` | `commandeApi.ts` |
| RDV | `/api/rdv` | `rdvApi.ts` |
| RDV Notifications | `/api/rdv-notifications` | `rdvNotificationsApi.ts` |
| Prêt Produits | `/api/pretproduits` | `pretProduitApi.ts` |
| Prêt Familles | `/api/pretfamilles` | `pretFamilleApi.ts` |
| Dépenses | `/api/depenses` | `depenseApi.ts` |
| Achats/Dépenses pro | `/api/nouvelle-achat` | `nouvelleAchatApi.ts` |
| Comptabilité | `/api/compta` | `comptaApi.ts` |
| Bénéfices | `/api/benefices` | `beneficeApi.ts` |
| Objectifs | `/api/objectif` | `objectifApi.ts` |
| Remboursements | `/api/remboursements` | `remboursementApi.ts` |
| Messages | `/api/messages` | via `index.ts` |
| Fournisseurs | `/api/fournisseurs` | `fournisseurApi.ts` |
| Sync (SSE) | `/api/sync/events` | `syncService.ts` |

### Sécurité

| Mécanisme | Fichier |
|-----------|---------|
| Rate limiting | `server/middleware/security.js` |
| Sanitization des inputs | `server/middleware/security.js` |
| Headers sécurisés | `server/middleware/security.js` |
| Détection activité suspecte | `server/middleware/security.js` |
| Validation des données | `server/middleware/validation.js` |
| Auth JWT | `server/middleware/auth.js` |
| CORS configuré | `server/server.js` |
| Déconnexion auto | `src/hooks/use-auto-logout.tsx` |
