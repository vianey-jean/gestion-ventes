# Documentation Complète du Projet - Gestion des Ventes

## 📋 Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Structure Frontend (React)](#structure-frontend)
3. [Structure Backend (Express/Node.js)](#structure-backend)
4. [Composants Décomposés](#composants-décomposés)
5. [Hooks Personnalisés](#hooks-personnalisés)
6. [Services API](#services-api)
7. [Types TypeScript](#types-typescript)
8. [Contextes React](#contextes-react)
9. [Pages de l'Application](#pages)

---

## Architecture Générale

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Vite + TypeScript + Tailwind CSS + Framer Motion    │
├─────────────────────────────────────────────────────┤
│  Pages → Composants → Hooks → Services API           │
│  Contextes (Auth, App, Theme, Accessibility)         │
└────────────────────┬────────────────────────────────┘
                     │ HTTP (Axios)
┌────────────────────▼────────────────────────────────┐
│                  Backend (Express.js)                 │
│  Node.js + JSON file storage + JWT Auth              │
├─────────────────────────────────────────────────────┤
│  Routes → Middleware → Models → DB (JSON files)      │
└─────────────────────────────────────────────────────┘
```

## Structure Frontend

### Pages (`src/pages/`)
| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `HomePage.tsx` | Landing page premium avec hero, features, CTA |
| Dashboard | `DashboardPage.tsx` | Tableau de bord principal avec 6 onglets |
| Clients | `ClientsPage.tsx` | Gestion CRUD des clients VIP |
| Commandes | `CommandesPage.tsx` | Commandes et réservations avec sync RDV |
| Tendances | `TendancesPage.tsx` | Analytics, graphiques et recommandations IA |
| RDV | `RdvPage.tsx` | Gestion des rendez-vous avec calendrier |
| Messages | `MessagesPage.tsx` | Messagerie interne |
| Login | `LoginPage.tsx` | Authentification |
| Register | `RegisterPage.tsx` | Inscription |

### Composants Décomposés (Nouveau)

#### Dashboard (`src/pages/dashboard/`)
- **DashboardHero.tsx** - Section titre animé avec icônes premium
- **DashboardTabNavigation.tsx** - 6 onglets configurés via tableau de données
- **DashboardTabContent.tsx** - Contenu de chaque onglet avec header visuel

#### Clients (`src/pages/clients/`)
- **ClientHero.tsx** - Header héroïque avec compteur et bouton d'ajout
- **ClientSearchSection.tsx** - Barre de recherche avec indicateur de résultats

#### Tendances (`src/pages/tendances/`)
- **TendancesHero.tsx** - Section titre animée
- **useTendancesData.ts** - Hook centralisant toute la logique de calcul

### Hooks (`src/hooks/`)
| Hook | Description |
|------|-------------|
| `useClients` | Gestion des clients avec CRUD |
| `useCommandes` | Gestion des commandes |
| `useComptabilite` | Données comptables |
| `useProducts` | Gestion des produits |
| `useSales` | Gestion des ventes |
| `useRdv` | Gestion des rendez-vous |
| `useObjectif` | Objectifs mensuels |
| `use-mobile` | Détection mobile |
| `use-currency-formatter` | Formatage monétaire |
| `use-messages` | Messages internes |
| `use-auto-logout` | Déconnexion automatique |

### Services API (`src/services/api/`)
| Service | Endpoint | Description |
|---------|----------|-------------|
| `authApi` | `/api/auth/*` | Authentification JWT |
| `clientApi` | `/api/clients/*` | CRUD clients |
| `productApi` | `/api/products/*` | CRUD produits |
| `saleApi` | `/api/sales/*` | CRUD ventes |
| `commandeApi` | `/api/commandes/*` | CRUD commandes |
| `rdvApi` | `/api/rdv/*` | CRUD rendez-vous |
| `comptaApi` | `/api/compta/*` | Comptabilité |
| `depenseApi` | `/api/depenses/*` | Dépenses |
| `beneficeApi` | `/api/benefices/*` | Bénéfices |
| `objectifApi` | `/api/objectif/*` | Objectifs |

### Contextes (`src/contexts/`)
| Contexte | Description |
|----------|-------------|
| `AuthContext` | Gestion JWT, login/logout, état utilisateur |
| `AppContext` | Données globales (ventes, produits, clients) |
| `ThemeContext` | Thème clair/sombre |
| `FormProtectionContext` | Protection contre perte de formulaire |

---

## Structure Backend

### Routes (`server/routes/`)
| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/auth` | POST login/register | Authentification |
| `/api/clients` | GET, POST, PUT, DELETE | Clients |
| `/api/products` | GET, POST, PUT, DELETE | Produits |
| `/api/sales` | GET, POST, PUT, DELETE | Ventes |
| `/api/commandes` | GET, POST, PUT, DELETE | Commandes |
| `/api/rdv` | GET, POST, PUT, DELETE | Rendez-vous |
| `/api/compta` | GET, POST, PUT, DELETE | Comptabilité |
| `/api/depenses` | GET, POST, PUT, DELETE | Dépenses |
| `/api/benefices` | GET, POST, PUT, DELETE | Bénéfices |
| `/api/objectif` | GET, PUT | Objectifs mensuels |
| `/api/messages` | GET, POST, PUT, DELETE | Messages |

### Middleware (`server/middleware/`)
| Middleware | Description |
|-----------|-------------|
| `auth.js` | Vérification JWT token |
| `security.js` | Rate limiting, CORS, headers sécurité |
| `validation.js` | Validation des entrées |
| `upload.js` | Upload de fichiers |
| `sync.js` | Synchronisation temps réel |

### Modèles (`server/models/`)
Chaque modèle gère la lecture/écriture vers un fichier JSON dans `server/db/`.

### Base de données (`server/db/`)
Stockage JSON avec les fichiers : `clients.json`, `products.json`, `sales.json`, `commandes.json`, `rdv.json`, `compta.json`, etc.

---

## Types TypeScript (`src/types/`)
| Type | Description |
|------|-------------|
| `Client` | id, nom, phone, adresse, dateCreation |
| `Product` | id, description, purchasePrice, quantity, code |
| `Sale` | id, date, products[], clientName, profit |
| `Commande` | id, clientNom, produits[], type, statut |
| `RDV` | id, titre, date, heureDebut, heureFin, statut |
| `Depense` | id, description, montant, date, categorie |

---

## Fonctionnalités Clés

### 🔐 Authentification
- JWT avec refresh token
- Auto-logout après inactivité
- Route protégée via `ProtectedRoute`

### 📊 Tableau de Bord
- 6 onglets : Ventes, Prêts Familles, Prêts Produits, Dépenses, Inventaire, Calcul Bénéfice
- Données temps réel via SSE (Server-Sent Events)
- Graphiques Recharts interactifs

### 🛒 Gestion des Ventes
- Vente mono-produit et multi-produits
- Export PDF (jsPDF + autoTable)
- Facture par client
- Classement ventes par clients

### 📅 Rendez-vous
- Calendrier interactif avec drag & drop
- Synchronisation avec réservations
- Notifications et rappels

### 📈 Tendances & Analytics
- Graphiques par produit, catégorie, période
- Recommandations d'achat par ROI
- Alertes stock critique
- Intelligence artificielle de suggestions

### 💰 Comptabilité
- Module complet achats/dépenses
- Bilan mensuel automatique
- Export PDF comptable
