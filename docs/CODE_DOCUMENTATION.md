
# DOCUMENTATION DU CODE

## Table des matières
1. [Structure du projet](#structure-du-projet)
2. [Frontend React](#frontend-react)
3. [Backend Node.js](#backend-nodejs)
4. [Base de données](#base-de-données)
5. [API Documentation](#api-documentation)
6. [Hooks personnalisés](#hooks-personnalisés)
7. [Services](#services)
8. [Composants UI](#composants-ui)

## Structure du projet

### Arborescence générale
```
projet/
├── src/                    # Code source frontend
├── server/                 # Code source backend
├── docs/                   # Documentation
└── public/                 # Assets statiques
```

## Frontend React

### Contextes (Context API)

#### AuthContext
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<boolean>;
}
```

**Fonctionnalités:**
- Gestion de l'état d'authentification
- Persistance du token JWT
- Fonctions de connexion/déconnexion
- Gestion des erreurs d'authentification

#### AppContext
```typescript
// src/contexts/AppContext.tsx
interface AppContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Product) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  addSale: (sale: Sale) => Promise<Sale | null>;
  refreshData: () => Promise<void>;
}
```

**Fonctionnalités:**
- État global de l'application
- Gestion des produits et ventes
- Synchronisation automatique des données
- Mise à jour temps réel

### Pages principales

#### DashboardPage
- **Fichier**: `src/pages/DashboardPage.tsx`
- **Description**: Page principale du tableau de bord
- **Composants intégrés**:
  - `Inventaire`: Gestion des produits
  - `VentesProduits`: Enregistrement des ventes
  - `ProfitCalculator`: Calculateur de bénéfices
  - `PretFamilles`: Gestion des prêts familiaux
  - `DepenseDuMois`: Suivi des dépenses

#### TendancesPage
- **Fichier**: `src/pages/TendancesPage.tsx`
- **Description**: Analyse des tendances et statistiques
- **Fonctionnalités**:
  - Graphiques de ventes
  - Évolution des bénéfices
  - Comparaisons mensuelles

### Composants dashboard

#### Inventaire
```typescript
// src/components/dashboard/Inventaire.tsx
const Inventaire: React.FC = () => {
  const { products, addProduct, updateProduct } = useApp();
  // Logique de gestion des produits
};
```

**Fonctionnalités:**
- Affichage des produits en tableau
- Formulaire d'ajout/modification
- Recherche et filtrage
- Upload d'images

#### VentesProduits
```typescript
// src/components/dashboard/VentesProduits.tsx
const VentesProduits: React.FC = () => {
  const { sales, addSale } = useApp();
  // Logique de gestion des ventes
};
```

**Fonctionnalités:**
- Enregistrement des ventes
- Sélection de produits
- Calcul automatique des bénéfices
- Gestion des quantités

### Hooks personnalisés

#### useAutoLogout
```typescript
// src/hooks/use-auto-logout.tsx
export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<number | null>(null);
  
  const resetTimer = () => {
    // Réinitialise le timer d'inactivité
  };
}
```

**Fonctionnalités:**
- Déconnexion automatique après 10 minutes d'inactivité
- Écoute des événements utilisateur
- Nettoyage automatique des timers

#### useRealtimeSync
```typescript
// src/hooks/use-realtime-sync.ts
export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const { refreshData } = useApp();
  // Logique de synchronisation
};
```

**Fonctionnalités:**
- Synchronisation périodique des données
- Détection de l'activité de l'onglet
- Debouncing des appels
- Gestion des erreurs

## Backend Node.js

### Structure des routes

#### Routes d'authentification
```javascript
// server/routes/auth.js
router.post('/login', (req, res) => {
  // Logique de connexion
});

router.post('/register', (req, res) => {
  // Logique d'inscription
});
```

#### Routes produits
```javascript
// server/routes/products.js
router.get('/', async (req, res) => {
  // Récupération des produits
});

router.post('/', authMiddleware, async (req, res) => {
  // Création d'un produit
});
```

### Modèles de données

#### Product Model
```javascript
// server/models/Product.js
class Product {
  static getAll() {
    // Récupère tous les produits
  }
  
  static create(productData) {
    // Crée un nouveau produit
  }
  
  static update(id, productData) {
    // Met à jour un produit
  }
}
```

#### Sale Model
```javascript
// server/models/Sale.js
class Sale {
  static getByMonthYear(month, year) {
    // Récupère les ventes par mois/année
  }
  
  static create(saleData) {
    // Crée une nouvelle vente
    // Mise à jour automatique du stock
  }
}
```

### Middleware

#### Authentification
```javascript
// server/middleware/auth.js
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### Synchronisation
```javascript
// server/middleware/sync.js
class SyncManager {
  static clients = new Map();
  
  static addClient(clientId, sendEvent) {
    this.clients.set(clientId, sendEvent);
  }
  
  static notifyClients(event, data) {
    this.clients.forEach(sendEvent => {
      sendEvent(event, data);
    });
  }
}
```

## Base de données

### Fichiers JSON
- `products.json`: Stockage des produits
- `sales.json`: Stockage des ventes
- `users.json`: Stockage des utilisateurs
- `pretfamilles.json`: Prêts familiaux
- `pretproduits.json`: Prêts produits
- `depensedumois.json`: Dépenses mensuelles

### Structure des données

#### Produit
```json
{
  "id": "1",
  "description": "Laptop",
  "purchasePrice": 500,
  "quantity": 10,
  "imageUrl": "/uploads/laptop.jpg"
}
```

#### Vente
```json
{
  "id": "1",
  "date": "2024-04-15",
  "productId": "1",
  "description": "Laptop",
  "sellingPrice": 800,
  "quantitySold": 1,
  "purchasePrice": 500,
  "profit": 300
}
```

## API Documentation

### Endpoints Produits

#### GET /api/products
- **Description**: Récupère tous les produits
- **Authentification**: Non requise
- **Réponse**: Array de produits

#### POST /api/products
- **Description**: Crée un nouveau produit
- **Authentification**: Requise
- **Body**:
```json
{
  "description": "string",
  "purchasePrice": "number",
  "quantity": "number"
}
```

### Endpoints Ventes

#### GET /api/sales/by-month
- **Description**: Récupère les ventes par mois
- **Authentification**: Requise
- **Paramètres**: `month`, `year`

#### POST /api/sales
- **Description**: Crée une nouvelle vente
- **Authentification**: Requise
- **Body**:
```json
{
  "date": "string",
  "productId": "string",
  "sellingPrice": "number",
  "quantitySold": "number"
}
```

## Services

### authService
```typescript
// src/service/api.ts
export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Logique de connexion
  },
  
  register: async (data: RegistrationData) => {
    // Logique d'inscription
  }
};
```

### productService
```typescript
export const productService = {
  getProducts: async () => {
    // Récupération des produits
  },
  
  addProduct: async (product: Omit<Product, 'id'>) => {
    // Ajout d'un produit
  }
};
```

## Composants UI

### Composants Shadcn/UI
- **Button**: Boutons stylisés
- **Card**: Cartes de contenu
- **Dialog**: Modales
- **Form**: Formulaires
- **Table**: Tableaux de données
- **Toast**: Notifications

### Composants personnalisés
- **StatCard**: Carte de statistiques
- **ModernButton**: Bouton moderne avec animations
- **RealtimeStatus**: Indicateur de statut temps réel

## Tests et Validation

### Validation des données
- Validation côté client avec React Hook Form
- Validation côté serveur pour tous les endpoints
- Sanitisation des entrées utilisateur

### Gestion d'erreurs
- Composant ErrorBoundary pour les erreurs React
- Middleware de gestion d'erreurs Express
- Logging structuré des erreurs

## Optimisations

### Performance
- Lazy loading des composants
- Mémorisation avec React.memo
- Debouncing des recherches
- Pagination des données

### Sécurité
- Hashage des mots de passe avec bcrypt
- Tokens JWT avec expiration
- Validation stricte des données
- Protection CORS configurée
