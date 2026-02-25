# 📋 RÉSUMÉ COMPLET DU PROJET — Gestion Ventes & Agendas

> **Version** : 4.0.0  
> **Type** : Application web de gestion commerciale complète  
> **Activité** : Vente de perruques, tissages et extensions capillaires  
> **Date** : Février 2026

---

## 📌 1. VUE D'ENSEMBLE

**Gestion Ventes & Agendas** est une application web professionnelle qui centralise la gestion complète d'une activité commerciale : ventes (mono et multi-produits), stocks, clients, remboursements, comptabilité, rendez-vous, commandes/réservations, prêts, dépenses et analyses de tendances.

### Architecture globale

```
┌──────────────────────────┐     ┌───────────────────────────┐     ┌─────────────────────┐
│     FRONTEND (React)     │◄───►│   BACKEND (Express.js)    │◄───►│  BASE DE DONNÉES    │
│  React 19 + TypeScript   │     │   Node.js + JWT + SSE     │     │  Fichiers JSON      │
│  Tailwind CSS + shadcn   │     │   Multer (uploads)        │     │  (server/db/)       │
│  Framer Motion           │     │   bcrypt (auth)           │     │                     │
│  Recharts (graphiques)   │     │   CORS + Rate Limiting    │     │                     │
│  Axios + SSE             │     │                           │     │                     │
└──────────────────────────┘     └───────────────────────────┘     └─────────────────────┘
```

---

## 📌 2. STACK TECHNOLOGIQUE

### Frontend
| Technologie | Rôle |
|---|---|
| React 19 + TypeScript | Framework UI avec typage strict |
| Vite | Build tool ultra-rapide |
| Tailwind CSS + shadcn/ui | Styling et composants UI accessibles |
| Framer Motion | Animations fluides |
| Recharts | Graphiques interactifs |
| Axios + axios-retry | Appels HTTP avec retry automatique |
| React Router DOM v7 | Routage SPA |
| jsPDF + jspdf-autotable | Export PDF (factures, comptabilité) |
| date-fns | Manipulation de dates |
| Zod | Validation de schémas |

### Backend
| Technologie | Rôle |
|---|---|
| Node.js + Express.js | Serveur API REST |
| JWT (jsonwebtoken) | Authentification sécurisée |
| bcryptjs | Hashage de mots de passe |
| Multer | Upload de fichiers (photos produits) |
| SSE (Server-Sent Events) | Synchronisation temps réel |
| CORS + compression | Sécurité et performance |

### Base de données
**Fichiers JSON exclusivement** — aucune base de données externe. Tous les fichiers sont dans `server/db/`.

---

## 📌 3. STRUCTURE DES FICHIERS

### Frontend (`src/`)
```
src/
├── App.tsx                    # Point d'entrée, routes, providers
├── main.tsx                   # Bootstrap React
├── index.css                  # Tokens CSS / Design system
│
├── pages/                     # Pages principales (lazy-loaded)
│   ├── HomePage.tsx           # Page d'accueil publique
│   ├── LoginPage.tsx          # Connexion (email vérifié puis mot de passe)
│   ├── RegisterPage.tsx       # Inscription complète
│   ├── ResetPasswordPage.tsx  # Réinitialisation mot de passe
│   ├── DashboardPage.tsx      # Tableau de bord principal (6 onglets)
│   ├── TendancesPage.tsx      # Analytics et tendances (6 sous-onglets)
│   ├── ClientsPage.tsx        # Gestion des clients (CRUD)
│   ├── CommandesPage.tsx      # Commandes et réservations
│   ├── RdvPage.tsx            # Rendez-vous (calendrier + liste)
│   ├── ProduitsPage.tsx       # Gestion des produits (CRUD + photos)
│   ├── MessagesPage.tsx       # Messagerie interne
│   ├── AboutPage.tsx          # À propos
│   ├── ContactPage.tsx        # Contact
│   └── NotFound.tsx           # Page 404
│
├── components/
│   ├── Layout.tsx             # Layout global (Navbar + Footer + RealtimeWrapper)
│   ├── Navbar.tsx             # Navigation premium (desktop + mobile)
│   ├── Footer.tsx             # Pied de page
│   ├── ScrollToTop.tsx        # Bouton retour en haut
│   ├── PasswordInput.tsx      # Input mot de passe avec toggle visibilité
│   ├── PasswordStrengthChecker.tsx # Indicateur force mot de passe
│   │
│   ├── auth/
│   │   └── ProtectedRoute.tsx # Garde de route authentifiée
│   │
│   ├── ui/                    # Composants shadcn/ui (button, card, dialog, etc.)
│   │
│   ├── dashboard/             # Composants du tableau de bord
│   │   ├── VentesProduits.tsx  # Onglet principal ventes (sous-onglets: gestion + avancé)
│   │   ├── SalesTable.tsx     # Tableau des ventes du mois (temps réel)
│   │   ├── AddSaleForm.tsx    # Formulaire vente mono-produit
│   │   ├── RefundForm.tsx     # Formulaire de remboursement
│   │   ├── PretFamilles.tsx   # Gestion prêts familles
│   │   ├── PretProduits.tsx   # Gestion prêts produits (groupés par client)
│   │   ├── DepenseDuMois.tsx  # Dépenses mensuelles (mouvements + fixes)
│   │   ├── Inventaire.tsx     # Inventaire complet des produits
│   │   ├── ProfitCalculator.tsx # Calculateur de bénéfices
│   │   ├── InvoiceGenerator.tsx # Générateur de factures PDF
│   │   ├── StatCard.tsx       # Carte de statistique
│   │   ├── PhotoUploadSection.tsx # Upload de photos produit
│   │   ├── ProductPhotoSlideshow.tsx # Diaporama photos
│   │   │
│   │   ├── forms/             # Formulaires spécialisés
│   │   │   ├── MultiProductSaleForm.tsx  # Vente multi-produits
│   │   │   ├── AdvancePaymentModal.tsx   # Modal avance produit spécial
│   │   │   ├── PretProduitFromSaleModal.tsx # Créer prêt depuis vente
│   │   │   ├── ConfirmDeleteDialog.tsx   # Dialog suppression
│   │   │   ├── ModernTable.tsx           # Table modernisée
│   │   │   ├── ModernButton.tsx          # Bouton premium
│   │   │   └── ...
│   │   │
│   │   ├── comptabilite/      # Module comptabilité complet
│   │   │   ├── ComptabiliteModule.tsx    # Orchestrateur principal
│   │   │   ├── ComptabiliteHeader.tsx    # En-tête avec sélection mois/année
│   │   │   ├── ComptabiliteStatsCards.tsx # Stats principales (Crédit, Débit, etc.)
│   │   │   ├── SecondaryStatsCards.tsx   # Stats secondaires
│   │   │   ├── ComptabiliteTabs.tsx      # Onglets (Évolution, Répartition, Historique)
│   │   │   ├── AchatFormDialog.tsx       # Formulaire ajout achat
│   │   │   ├── DepenseFormDialog.tsx     # Formulaire ajout dépense
│   │   │   ├── StableCharts.tsx          # Graphiques stabilisés
│   │   │   ├── modals/                   # 8 modales de détails
│   │   │   ├── shared/                   # Composants réutilisables
│   │   │   └── details/                  # Composants de détails
│   │   │
│   │   ├── sections/          # Sections du dashboard
│   │   │   ├── SalesOverviewSection.tsx  # Vue d'ensemble ventes
│   │   │   ├── SalesManagementSection.tsx # Gestion ventes (formulaires + table)
│   │   │   └── AdvancedDashboardSection.tsx # Dashboard avancé (comptabilité)
│   │   │
│   │   └── reports/           # Rapports
│   │       ├── SalesReport.tsx
│   │       ├── ProfitEvolution.tsx
│   │       ├── StockRotation.tsx
│   │       └── YearlyComparison.tsx
│   │
│   ├── clients/               # Composants page clients
│   ├── commandes/             # Composants page commandes
│   ├── rdv/                   # Composants rendez-vous
│   ├── tendances/             # Modales stats tendances
│   ├── navbar/                # Objectif + modales navbar
│   ├── shared/                # Composants partagés réutilisables
│   ├── common/                # ErrorBoundary, RealtimeWrapper
│   └── accessibility/         # Provider accessibilité WCAG
│
├── contexts/
│   ├── AuthContext.tsx         # Authentification (login, register, logout, JWT)
│   ├── AppContext.tsx          # Données globales (products, sales, allSales)
│   ├── ThemeContext.tsx        # Thème sombre/clair
│   └── FormProtectionContext.tsx # Protection formulaires contre refresh SSE
│
├── hooks/                     # Hooks personnalisés
│   ├── useClients.ts          # CRUD clients
│   ├── useProducts.ts         # CRUD produits
│   ├── useSales.ts            # CRUD ventes
│   ├── useCommandes.ts        # Logique commandes
│   ├── useCommandesLogic.ts   # Logique métier complète commandes
│   ├── useRdv.ts              # CRUD rendez-vous
│   ├── useComptabilite.ts     # Logique comptabilité (511 lignes)
│   ├── useObjectif.ts         # Objectif mensuel
│   ├── useBusinessCalculations.ts # Calculs CA, bénéfice, marge
│   ├── useClientSync.ts       # Synchronisation clients
│   ├── usePhoneActions.ts     # Appel/SMS/Navigation
│   ├── use-messages.ts        # Messagerie
│   ├── use-mobile.tsx         # Détection mobile
│   ├── use-currency-formatter.ts # Formatage devises
│   ├── use-realtime-sync.ts   # Sync temps réel SSE
│   ├── use-auto-logout.tsx    # Déconnexion automatique
│   └── useYearlyData.ts       # Données annuelles
│
├── services/
│   ├── api.ts (src/service/)  # Service API principal (auth, products, sales, etc.)
│   ├── api/                   # Services API modulaires
│   │   ├── api.ts             # Instance Axios de base
│   │   ├── authApi.ts         # Authentification
│   │   ├── clientApi.ts       # Clients
│   │   ├── productApi.ts      # Produits
│   │   ├── saleApi.ts         # Ventes
│   │   ├── commandeApi.ts     # Commandes
│   │   ├── comptaApi.ts       # Comptabilité
│   │   ├── depenseApi.ts      # Dépenses
│   │   ├── nouvelleAchatApi.ts # Achats (comptabilité)
│   │   ├── rdvApi.ts          # Rendez-vous
│   │   ├── remboursementApi.ts # Remboursements
│   │   ├── pretFamilleApi.ts  # Prêts familles
│   │   ├── pretProduitApi.ts  # Prêts produits
│   │   ├── beneficeApi.ts     # Bénéfices
│   │   ├── objectifApi.ts     # Objectifs
│   │   └── rdvNotificationsApi.ts # Notifications RDV
│   │
│   ├── realtime/              # Service temps réel modulaire
│   │   ├── RealtimeService.ts # Service principal SSE
│   │   ├── EventSourceManager.ts # Gestion connexion SSE
│   │   ├── DataCacheManager.ts # Cache des données
│   │   └── types.ts           # Types sync
│   │
│   ├── BusinessCalculationService.ts # Calculs métier centralisés
│   ├── FormatService.ts       # Formatage (devises, dates)
│   └── syncService.ts         # Service de synchronisation
│
├── types/                     # Types TypeScript centralisés
│   ├── index.ts               # Export centralisé
│   ├── auth.ts                # User, LoginCredentials, etc.
│   ├── client.ts              # Client, ClientFormData
│   ├── product.ts             # Product, ProductFormData
│   ├── sale.ts                # Sale, SaleProduct
│   ├── commande.ts            # Commande, CommandeProduit
│   ├── rdv.ts                 # RDV, RDVFormData
│   ├── pret.ts                # PretFamille, PretProduit
│   ├── depense.ts             # DepenseFixe, DepenseDuMois
│   └── comptabilite.ts        # NouvelleAchat, ComptabiliteData
│
└── styles/                    # Styles additionnels
    ├── accessibility.css
    ├── base/                  # Contraste, motion, typographie
    ├── components/            # Formulaires, navigation
    └── utilities/             # Screen reader
```

### Backend (`server/`)
```
server/
├── server.js                  # Point d'entrée Express (328 lignes)
├── package.json
├── .env                       # Variables d'environnement
│
├── config/
│   └── passport.js            # Configuration Passport
│
├── middleware/
│   ├── auth.js                # Vérification JWT
│   ├── security.js            # Rate limiting, sanitization, headers
│   ├── validation.js          # Validation des entrées
│   ├── sync.js                # SyncManager (SSE, watchers fichiers)
│   └── upload.js              # Configuration Multer (photos)
│
├── models/                    # Modèles CRUD (lecture/écriture JSON)
│   ├── User.js
│   ├── Product.js
│   ├── Sale.js                # Ventes (avec gestion stock)
│   ├── Client.js
│   ├── Commande.js
│   ├── Rdv.js
│   ├── RdvNotification.js
│   ├── Message.js
│   ├── Benefice.js
│   ├── Compta.js
│   ├── NouvelleAchat.js
│   ├── DepenseDuMois.js
│   ├── Objectif.js
│   ├── PretFamille.js
│   ├── PretProduit.js
│   └── Remboursement.js
│
├── routes/                    # Routes API
│   ├── auth.js                # POST /api/auth/login, /register, /check-email, /verify, /reset-password
│   ├── products.js            # CRUD /api/products + /photos (upload)
│   ├── sales.js               # CRUD /api/sales + /by-month + /by-year + /yearly-stats
│   ├── clients.js             # CRUD /api/clients
│   ├── commandes.js           # CRUD /api/commandes
│   ├── rdv.js                 # CRUD /api/rdv
│   ├── rdvNotifications.js    # CRUD /api/rdv-notifications
│   ├── messages.js            # CRUD /api/messages
│   ├── benefices.js           # CRUD /api/benefices
│   ├── compta.js              # /api/compta (données comptables)
│   ├── nouvelleAchat.js       # CRUD /api/nouvelle-achat
│   ├── depenses.js            # /api/depenses (mouvements + fixe)
│   ├── objectif.js            # CRUD /api/objectif
│   ├── pretfamilles.js        # CRUD /api/pretfamilles
│   ├── pretproduits.js        # CRUD /api/pretproduits + /transfer
│   ├── remboursements.js      # CRUD /api/remboursements
│   └── sync.js                # GET /api/sync/events (SSE)
│
├── db/                        # Fichiers JSON de données
│   ├── users.json
│   ├── products.json
│   ├── sales.json
│   ├── clients.json
│   ├── commandes.json
│   ├── rdv.json
│   ├── rdvNotifications.json
│   ├── messages.json
│   ├── benefice.json
│   ├── compta.json
│   ├── nouvelle_achat.json
│   ├── depensedumois.json
│   ├── depensefixe.json
│   ├── objectif.json
│   ├── pretfamilles.json
│   ├── pretproduits.json
│   └── remboursement.json
│
└── uploads/                   # Photos produits uploadées
```

---

## 📌 4. PAGES ET FONCTIONNALITÉS DÉTAILLÉES

### 4.1 🏠 HomePage (`/`)
- Page d'accueil publique avec design luxueux (fond sombre, effets glow)
- Section Hero avec titre animé (Framer Motion)
- Section Fonctionnalités (4 cartes : Suivi temps réel, Gestion intelligente, Rapports avancés, Analyse profits)
- Section CTA pour inscription
- Si connecté : les boutons "Commencer" et "Se connecter" sont masqués

### 4.2 🔐 LoginPage (`/login`)
- **Étape 1** : Saisie email → vérification en base de données via `POST /api/auth/check-email`
- Si l'email existe → affiche le nom de l'utilisateur ("Bienvenue Jean Martin")
- Si l'email n'existe pas → erreur "Ce profil n'existe pas"
- **Étape 2** : Saisie mot de passe + vérificateur de force (PasswordStrengthChecker)
- Le bouton "Se connecter" est désactivé tant que le mot de passe ne remplit pas les critères
- Lien "Mot de passe oublié" → `/reset-password`
- Bouton "Créer un compte" → `/register`
- Design glassmorphism premium avec fond animé

### 4.3 📝 RegisterPage (`/register`)
- Formulaire complet : Prénom, Nom, Email, Genre, Adresse, Téléphone, Mot de passe × 2
- Vérification email en temps réel (debounce 500ms) → empêche les doublons
- Validation mot de passe (minuscule, majuscule, chiffre, caractère spécial, 6+ caractères)
- Checkbox "Accepter les conditions"
- Après inscription → redirection vers `/login` (pas de connexion auto)
- Design similaire à LoginPage

### 4.4 🔑 ResetPasswordPage (`/reset-password`)
- Saisie email → vérification existence
- Si existe → saisie nouveau mot de passe + confirmation
- Le nouveau mot de passe doit être différent de l'ancien

### 4.5 📊 DashboardPage (`/dashboard`) — PAGE PRINCIPALE
Route protégée. Contient 6 onglets :

#### Onglet 1 : 🛒 Ventes Produits (`VentesProduits.tsx`)
C'est le composant le plus riche. Il contient 2 sous-onglets :

**Sous-onglet "Gestion des Ventes" (`SalesManagementSection.tsx`)**
- **4 boutons d'action** :
  1. **Nouvelle Vente** → ouvre `AddSaleForm` (vente mono-produit)
  2. **Vente Multi-Produits** → ouvre `MultiProductSaleForm` (plusieurs produits dans une vente)
  3. **Remboursement** → ouvre `RefundForm` (formulaire de remboursement)
  4. **Voir Remboursements** → ouvre `ViewRefundsModal` (liste des remboursements)

- **Statistiques cliquables** (4 cartes) :
  - Total des ventes (CA) → modale détails
  - Bénéfice du mois → modale détails
  - Nombre de ventes → modale détails
  - Produits vendus → redirige vers `/produits`

- **SalesTable** : Tableau des ventes du mois en cours
  - Synchronisation temps réel via SSE
  - Colonnes : N°, Date, Description, Prix achat, Prix vente, Qté, Bénéfice, Client
  - Clic sur une ligne → ouvre `MultiProductSaleForm` en mode édition
  - Remboursements affichés en rouge avec valeurs négatives
  - Tri par prix de vente (ascendant/descendant)
  - Footer avec totaux

**Sous-onglet "Dashboard Avancé" (`AdvancedDashboardSection.tsx`)**
- Module Comptabilité complet (voir section 4.11)

#### Onglet 2 : 👨‍👩‍👧 Prêts Familles (`PretFamilles.tsx`)
- CRUD complet des prêts familles
- Chaque prêt contient : nom, montant total, solde restant
- Historique des remboursements avec dates
- Boutons : Nouveau prêt, Rembourser, Voir détails
- Stats : Total prêté, Total remboursé, Reste à rembourser
- Modale détail avec historique complet

#### Onglet 3 : 📦 Prêts Produits (`PretProduitsGrouped.tsx`)
- Groupés par nom de client
- Chaque prêt : produit, prix vente, avance reçue, reste
- Boutons par prêt : Rembourser, Modifier, Supprimer
- Création de prêt depuis une vente avec avance
- Transfert de prêts d'un client à un autre
- Stats : Total prêts en cours, Total avances, Reste total
- Notification si retard de paiement

#### Onglet 4 : 💳 Dépenses du Mois (`DepenseDuMois.tsx`)
- **Dépenses fixes** : Free Mobile, Internet Zeop, Assurance voiture, Autre, Assurance vie
- **Mouvements du mois** : tableau avec Date, Description, Catégorie, Débit, Crédit, Solde
- CRUD complet des mouvements
- Catégories : salaire, courses, restaurant, free, internet, essence, autre
- Reset mensuel automatique
- Stats : Total revenus, Total dépenses, Solde

#### Onglet 5 : 📋 Inventaire (`Inventaire.tsx`)
- Liste complète des produits avec photos
- Recherche par description ou code produit
- Filtres : Tous, Perruques, Tissages, Autres
- Tri par nom ou quantité (asc/desc)
- CRUD complet avec upload photos (jusqu'à 6 photos par produit)
- Photo principale sélectionnable
- Diaporama photos en modal
- Export PDF de l'inventaire
- Pagination (10 items/page)
- Badges stock (En stock, Rupture, Critique)

#### Onglet 6 : 🧮 Calcul Bénéfice (`ProfitCalculator.tsx`)
- Recherche de produit existant
- Saisie : Prix d'achat, Prix de vente souhaité
- Calcul automatique : Bénéfice unitaire, Marge (%), ROI
- Historique des calculs sauvegardé en base
- CRUD sur les calculs (modifier, supprimer)
- Tableau récapitulatif

### 4.6 📈 TendancesPage (`/tendances`)
Route protégée. 6 sous-onglets d'analytics basés sur **toutes les ventes historiques** (allSales) :

1. **Vue d'ensemble** : Graphique évolution ventes/bénéfices dans le temps + Top produits rentables
2. **Produits** : Classement par produit (CA, quantité, bénéfice, marge)
3. **Catégories** : Répartition par catégorie (Perruque, Tissage, Extension, Autre)
4. **Recommandations** : Suggestions d'achat basées sur ROI et volume de vente
5. **Clients** : Classement clients par CA, avec historique détaillé par client
6. **Intelligence Stock** : Analyse stock critique, rotation, alertes

**Stats cliquables** en haut :
- Ventes totales → modale détails
- Bénéfices totaux → modale détails
- Produits vendus → modale détails
- Meilleur ROI → modale détails

### 4.7 👥 ClientsPage (`/clients`)
Route protégée.
- Hero avec compteur de clients + bouton "Nouveau client"
- Recherche par nom, téléphone ou adresse (minimum 3 caractères)
- Grille de cartes clients (responsive : 1→4 colonnes)
- Chaque carte :
  - Nom du client + date de création
  - Téléphone cliquable → modale (Appeler / Envoyer SMS)
  - Adresse cliquable → ouvre Google Maps (desktop) ou modale choix GPS (mobile : Google Maps, Waze, Apple Maps)
  - Boutons Modifier / Supprimer (au hover)
- Modale CRUD (ajout/modification) avec confirmation
- Pagination (20 clients/page)

### 4.8 📦 CommandesPage (`/commandes`)
Route protégée. Gestion des commandes et réservations.
- **Formulaire commande** : Client (recherche auto-complete), Type (commande/réservation), Produits (multi), Dates, Horaire
- **Table** : Tri par date, statuts (En attente, Validé, Annulé), actions
- **Workflow statuts** :
  - En attente → Validé (avec confirmation modale)
  - En attente → Annulé (avec confirmation)
  - Reporter (nouvelle date + horaire)
  - Supprimer
- **Sync RDV** : Quand une réservation est validée → proposition de créer un RDV automatiquement
- Export PDF des commandes

### 4.9 📅 RdvPage (`/rdv`)
Route protégée. Gestion des rendez-vous.
- **Hero** avec bouton "Nouveau RDV"
- **Stats** : Aujourd'hui, Confirmés, En attente, Total du mois (cliquables → modale détails)
- **Recherche** avec suggestions instantanées
- **2 vues** (onglets) :
  1. **Calendrier** : Vue calendrier interactive, drag & drop pour déplacer un RDV
  2. **Liste** : Vue liste paginée (20/page) avec actions
- **Formulaire RDV** : Titre, Client, Lieu, Date, Heure début/fin, Description, Statut
- Détection de conflits horaires
- **Statuts** : Planifié, Confirmé, Annulé, Terminé
- **Notifications** : Badge dans la navbar pour les RDV à venir
- Highlight d'un RDV depuis une notification (via URL params)

### 4.10 📦 ProduitsPage (`/produits`)
Route protégée. Gestion complète des produits.
- Recherche par description ou code (min 3 caractères)
- Filtres : Tous, Perruques, Tissages, Extensions, Autres
- **2 boutons** : Ajouter Produit, Modifier Produit
- **Table** avec photos miniatures, code, description, prix achat, quantité, badges stock
- **Ajout** : Description, Prix achat, Quantité + Upload photos (jusqu'à 6)
- **Modification** : Tous les champs + ajout quantité supplémentaire + gestion photos
- **Suppression** avec confirmation
- **Vue détail** : Diaporama photos plein écran
- Code produit auto-généré : `P-XX-XXXXXX` (Perruque), `T-XX-XXXXXX` (Tissage), `E-XX-XXXXXX` (Extension), `X-XX-XXXXXX` (Autre)
- Pagination (10/page)

### 4.11 📧 MessagesPage (`/messages`)
Route protégée.
- Interface split : Liste à gauche + Lecture à droite
- Recherche par nom, sujet ou contenu
- Badge "Nouveau" sur messages non lus
- Actions : Marquer lu/non-lu, Supprimer
- Compteur de messages non lus dans la navbar

### 4.12 📊 Module Comptabilité (dans Dashboard Avancé)
Composant `ComptabiliteModule` avec hook `useComptabilite`.

- **Sélection période** : Mois + Année
- **Stats principales** (cliquables) :
  - Crédit total (ventes du mois)
  - Débit total (achats + dépenses)
  - Bénéfice des ventes
  - Bénéfice réel (ventes - achats - dépenses)
  - Achats produits total
  - Autres dépenses
  - Solde net

- **3 onglets** :
  1. **Évolution mensuelle** : Graphique barres (bénéfice ventes vs dépenses vs bénéfice réel)
  2. **Répartition dépenses** : Camembert (achats produits vs autres dépenses)
  3. **Historique achats** : Liste détaillée des achats du mois

- **Formulaires** :
  - Ajouter un achat (produit recherché, quantité, prix unitaire)
  - Ajouter une dépense (description, montant, catégorie)

- **Export PDF** comptable mensuel

---

## 📌 5. SYSTÈME DE REMBOURSEMENT (Logique critique)

### Flux complet :
1. **Ouverture** : Via bouton "Remboursement" ou bouton "Rembourser" sur une vente
2. **Recherche** : Saisie nom client (min 3 caractères) → recherche dans les ventes positives
3. **Sélection** : Choix de la vente spécifique
4. **Configuration** :
   - Sélection des produits à rembourser (retrait possible, minimum 1 obligatoire)
   - Modification de la quantité (max = quantité vendue originale)
   - **Le prix remboursement unitaire est verrouillé** (= prix vente original, non modifiable)
5. **Validation** :
   - Confirmation modale "Remettre en stock ?" pour chaque produit
   - Enregistrement dans `sales.json` : vente négative (`isRefund: true`, quantités et prix négatifs)
   - Enregistrement dans `remboursement.json` : détails du remboursement
   - Mise à jour du stock (quantité restaurée)

### Règles métier :
- `effectiveQuantity` = `-Math.abs(quantité)` → toujours négatif
- `purchasePrice` = prix d'achat réel (jamais 0)
- `sellingPrice` = montant total remboursé (négatif dans sales)
- Les remboursements apparaissent en **rouge** dans la SalesTable
- Si on supprime un remboursement → le stock est redécrémenté

### Affichage dans MultiProductSaleForm (édition) :
- Utilise `Math.abs(quantitySold) || 1` pour éviter division par zéro
- Calcule `purchasePriceUnit` et `sellingPriceUnit` à partir des totaux

---

## 📌 6. SYSTÈME D'AUTHENTIFICATION

### Flux :
1. **Inscription** (`/register`) → `POST /api/auth/register` → compte créé → redirection `/login`
2. **Connexion** (`/login`) → `POST /api/auth/check-email` → `POST /api/auth/login` → JWT stocké dans localStorage
3. **Vérification session** → `GET /api/auth/verify` → vérifie le token contre la base de données à chaque chargement
4. **Déconnexion** → suppression token + redirection `/login`

### JWT :
- Token stocké dans `localStorage` sous la clé `token`
- Durée : 8 heures
- Ajouté automatiquement à chaque requête via interceptor Axios
- Si 401 → suppression auto + redirection `/login`

### Protection des routes :
- `ProtectedRoute` vérifie `isAuthenticated` dans `AuthContext`
- `Layout` avec `requireAuth` redirige vers `/login` si non connecté

---

## 📌 7. SYNCHRONISATION TEMPS RÉEL (SSE)

### Comment ça fonctionne :
1. **Backend** (`server/middleware/sync.js`) :
   - `SyncManager` surveille les fichiers JSON avec `fs.watch`
   - Quand un fichier change → notifie tous les clients connectés
   - Heartbeat toutes les 30 secondes

2. **Frontend** (`src/services/realtime/`) :
   - `EventSourceManager` gère la connexion SSE vers `GET /api/sync/events`
   - `DataCacheManager` cache les données reçues
   - `RealtimeService` orchestre le tout
   - `RealtimeWrapper` enveloppe les pages authentifiées

3. **Protection formulaires** :
   - `isFormProtected()` empêche le refresh automatique quand un formulaire est ouvert
   - Évite la perte de données en cours de saisie

---

## 📌 8. NAVBAR ET NAVIGATION

### Desktop :
- Logo + Indicateur Objectif mensuel
- Liens : Dashboard, Commandes, Rendez-vous
- Toggle thème sombre/clair
- Menu utilisateur (dropdown) : Messages (badge non lus), Tendances, Clients, Produits
- Bouton Déconnexion

### Mobile :
- Logo + Notifications RDV + Menu hamburger
- Menu mobile en grille 2 colonnes : Dashboard, Commandes, Clients, Produits, Rendez-vous, Tendances, Messages
- Toggle thème + Déconnexion

### Indicateur Objectif (`ObjectifIndicator`) :
- Affiche la progression vers l'objectif mensuel de CA
- Barre de progression circulaire dans la navbar
- Clic → modale avec stats détaillées, historique objectifs, historique ventes

---

## 📌 9. API ENDPOINTS COMPLETS

### Authentification (`/api/auth`)
| Méthode | Route | Description |
|---|---|---|
| POST | `/login` | Connexion (email + password) |
| POST | `/register` | Inscription complète |
| POST | `/check-email` | Vérifie si un email existe |
| GET | `/verify` | Vérifie le token JWT |
| POST | `/reset-password-request` | Demande reset mot de passe |
| POST | `/reset-password` | Réinitialise le mot de passe |

### Produits (`/api/products`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste tous les produits |
| POST | `/` | Ajouter un produit |
| PUT | `/:id` | Modifier un produit |
| DELETE | `/:id` | Supprimer un produit |
| POST | `/:id/photos` | Upload photos (Multer, max 6) |
| PUT | `/:id/photos` | Remplacer les photos |
| POST | `/generate-codes` | Générer codes pour produits existants |

### Ventes (`/api/sales`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Toutes les ventes |
| GET | `/by-month?month=X&year=Y` | Ventes d'un mois |
| GET | `/by-year?year=Y` | Ventes d'une année |
| GET | `/yearly-stats` | Stats annuelles agrégées |
| POST | `/` | Créer une vente |
| PUT | `/:id` | Modifier une vente |
| DELETE | `/:id` | Supprimer une vente |
| POST | `/export-month` | Exporter/effacer un mois |

### Clients (`/api/clients`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste tous les clients |
| POST | `/` | Ajouter un client |
| PUT | `/:id` | Modifier un client |
| DELETE | `/:id` | Supprimer un client |

### Commandes (`/api/commandes`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste toutes les commandes |
| POST | `/` | Créer une commande |
| PUT | `/:id` | Modifier une commande |
| DELETE | `/:id` | Supprimer une commande |

### Rendez-vous (`/api/rdv`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste tous les RDV |
| POST | `/` | Créer un RDV |
| PUT | `/:id` | Modifier un RDV |
| DELETE | `/:id` | Supprimer un RDV |

### Notifications RDV (`/api/rdv-notifications`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les notifications |
| POST | `/` | Créer une notification |
| PUT | `/:id` | Marquer comme lue |

### Comptabilité (`/api/compta`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Données comptables |
| POST | `/` | Ajouter une entrée |

### Achats (`/api/nouvelle-achat`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les achats |
| POST | `/` | Ajouter un achat |
| PUT | `/:id` | Modifier un achat |
| DELETE | `/:id` | Supprimer un achat |

### Dépenses (`/api/depenses`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/mouvements` | Mouvements du mois |
| POST | `/mouvements` | Ajouter un mouvement |
| PUT | `/mouvements/:id` | Modifier un mouvement |
| DELETE | `/mouvements/:id` | Supprimer un mouvement |
| GET | `/fixe` | Dépenses fixes |
| PUT | `/fixe` | Modifier dépenses fixes |
| POST | `/reset` | Reset mensuel |

### Prêts Familles (`/api/pretfamilles`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les prêts |
| POST | `/` | Ajouter un prêt |
| PUT | `/:id` | Modifier (rembourser) |
| DELETE | `/:id` | Supprimer |
| GET | `/search/nom?q=X` | Recherche par nom |

### Prêts Produits (`/api/pretproduits`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les prêts |
| POST | `/` | Ajouter un prêt |
| PUT | `/:id` | Modifier |
| DELETE | `/:id` | Supprimer |
| POST | `/transfer` | Transférer prêts entre clients |

### Remboursements (`/api/remboursements`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les remboursements |
| POST | `/` | Enregistrer un remboursement |
| DELETE | `/:id` | Supprimer un remboursement |

### Bénéfices (`/api/benefices`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les bénéfices |
| POST | `/` | Ajouter |
| PUT | `/:id` | Modifier |
| DELETE | `/:id` | Supprimer |
| GET | `/product/:id` | Bénéfice par produit |

### Objectifs (`/api/objectif`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Objectif actuel |
| POST | `/` | Définir/modifier objectif |

### Messages (`/api/messages`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste les messages |
| PUT | `/:id/read` | Marquer comme lu |
| PUT | `/:id/unread` | Marquer comme non lu |
| DELETE | `/:id` | Supprimer |

### Synchronisation (`/api/sync`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/events` | Flux SSE temps réel |

---

## 📌 10. SÉCURITÉ

| Mesure | Détail |
|---|---|
| JWT | Tokens sécurisés, expiration 8h |
| bcrypt | Hashage mots de passe (salt 10) |
| Rate Limiting | Général + Auth + Strict |
| CORS | Origins autorisées (Vercel, Lovable, localhost) |
| Sanitization | Nettoyage des entrées utilisateur |
| Headers sécurisés | CSP, X-Frame-Options, etc. |
| Validation | Côté client (Zod) + côté serveur |
| Auto-déconnexion | Après inactivité prolongée |

---

## 📌 11. DESIGN ET UX

- **Thème sombre/clair** via `ThemeContext` + `next-themes`
- **Design premium** : gradients, glassmorphism, effets miroir
- **Responsive** : Mobile-first avec breakpoints Tailwind
- **Accessibilité WCAG** : `AccessibilityProvider`, ARIA labels, navigation clavier, annonces screen reader
- **Animations** : Framer Motion sur toutes les pages
- **Loading states** : `PremiumLoading` avec variants (default, ventes, tendances, dashboard)
- **Toasts** : Notifications vertes (succès) et rouges (erreur) via shadcn/ui

---

## 📌 12. GUIDE D'UTILISATION RAPIDE

### Démarrage
1. Ouvrir l'application → Page d'accueil
2. Cliquer "Créer un compte" → Remplir le formulaire → Connexion
3. Se connecter → Redirection vers Dashboard

### Flux quotidien typique
1. **Dashboard** → Onglet Ventes → "Nouvelle Vente" → Sélectionner produit → Valider
2. Voir les ventes du mois dans la SalesTable
3. Si erreur → "Remboursement" → Chercher client → Sélectionner vente → Rembourser
4. **Commandes** → Créer commande → Quand livrée → Valider → Créer RDV automatique
5. **RDV** → Voir calendrier → Créer/modifier/supprimer des rendez-vous
6. **Tendances** → Analyser les performances, recommandations d'achat
7. **Comptabilité** (Dashboard Avancé) → Enregistrer achats/dépenses → Export PDF

### Fonctions spéciales
- **Vente multi-produits** : Ajouter plusieurs produits dans une seule vente
- **Prêt produit** : Quand un client paie une avance, un prêt est créé automatiquement
- **Objectif mensuel** : Définir un objectif de CA → suivi en temps réel dans la navbar
- **Export PDF** : Factures, inventaire, comptabilité
- **Photos produits** : Jusqu'à 6 photos, photo principale sélectionnable, diaporama

---

## 📌 13. VARIABLES D'ENVIRONNEMENT

### Frontend (`.env`)
```
VITE_API_BASE_URL=https://server-gestion-ventes.onrender.com
```

### Backend (`server/.env`)
```
JWT_SECRET=votre_secret_jwt
PORT=10000
NODE_ENV=production
```

---

## 📌 14. DÉPLOIEMENT

| Service | Plateforme | URL |
|---|---|---|
| Frontend | Vercel / Lovable | https://id-preview--xxx.lovable.app |
| Backend | Render | https://server-gestion-ventes.onrender.com |
| Uploads | Render (statique) | /uploads/ |

---

## 📌 15. TESTS

```bash
# Lancer tous les tests
npm run test

# Tests avec couverture
npx vitest run --coverage
```

Fichiers de tests dans `src/tests/` :
- `components/` : Tests unitaires composants
- `hooks/` : Tests hooks personnalisés
- `services/` : Tests services
- `integration/` : Tests d'intégration (workflow complet)
- `e2e/` : Tests end-to-end
- `performance/` : Tests de performance

---

> **Ce document couvre 100% du code source du projet. Il peut servir de référence complète pour comprendre, utiliser et maintenir l'application.**
