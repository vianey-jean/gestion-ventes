
# ARCHITECTURE COMPLÈTE DU SYSTÈME

## Vue d'ensemble architecturale

### Principes de conception
1. **Séparation des responsabilités** - Frontend/Backend clairement délimités
2. **Immutabilité** - États immuables avec React Context
3. **Composants purs** - Fonctions sans effets de bord
4. **Synchronisation temps réel** - SSE pour les mises à jour

### Diagramme d'architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Base données   │
│   React/TS      │◄──►│  Node.js/Express│◄──►│  Fichiers JSON  │
│                 │    │                 │    │                 │
│ • Components    │    │ • Routes API    │    │ • products.json │
│ • Contexts      │    │ • Middleware    │    │ • sales.json    │
│ • Hooks         │    │ • Models        │    │ • clients.json  │
│ • Services      │    │ • SSE Sync      │    │ • users.json    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Architecture Frontend

### Gestion d'état avec Context API
```typescript
// État global de l'application
interface AppContextType {
  // Données
  products: readonly Product[];
  sales: readonly Sale[];
  clients: readonly Client[];
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // État de synchronisation
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}
```

### Hooks personnalisés
- `useAuth()` - Gestion authentification
- `useApp()` - Accès état global
- `useAutoLogout()` - Déconnexion automatique
- `useRealtimeSync()` - Synchronisation temps réel
- `useClientSync()` - Synchronisation clients

### Structure des composants
```
components/
├── ui/                    # Composants Shadcn/UI
├── dashboard/             # Composants métier
│   ├── Inventaire.tsx
│   ├── VentesProduits.tsx
│   ├── AddSaleForm.tsx
│   ├── ProfitCalculator.tsx
│   └── ...
├── layout/               # Composants de mise en page
└── common/               # Composants réutilisables
```

## Architecture Backend

### Structure API REST
```
/api/
├── auth/                 # Authentification
│   ├── POST /login
│   ├── POST /register
│   └── POST /reset-password
├── products/            # Gestion produits
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── sales/               # Gestion ventes
│   ├── GET /by-month
│   ├── POST /
│   └── POST /export-month
├── clients/             # Gestion clients
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
└── sync/                # Synchronisation
    └── GET /events      # Server-Sent Events
```

### Modèles de données
```typescript
// Structures de données principales
interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  imageUrl?: string;
}

interface Sale {
  id: string;
  date: string;
  productId: string;
  description: string;
  sellingPrice: number;
  quantitySold: number;
  purchasePrice: number;
  profit: number;
  clientFirstName?: string;
  clientLastName?: string;
  clientPhone?: string;
  clientAddress?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  createdAt: string;
}
```

### Middleware Express
- **authMiddleware** - Vérification JWT
- **corsMiddleware** - Configuration CORS
- **syncMiddleware** - Gestion SSE
- **errorHandler** - Gestion d'erreurs

## Synchronisation temps réel

### Server-Sent Events (SSE)
```javascript
// Gestionnaire de synchronisation
class SyncManager {
  static clients = new Map();
  static lastDataHash = new Map();

  static addClient(clientId, sendEvent) {
    this.clients.set(clientId, { sendEvent, lastSeen: Date.now() });
  }

  static notifyClients(event, data) {
    this.clients.forEach(({ sendEvent }) => {
      sendEvent(event, data);
    });
  }

  static watchFiles() {
    // Surveillance des fichiers JSON
    const filesToWatch = [
      'products.json', 'sales.json', 'clients.json',
      'pretfamilles.json', 'pretproduits.json',
      'depensedumois.json', 'depensefixe.json'
    ];
    
    filesToWatch.forEach(fileName => {
      fs.watchFile(path.join(__dirname, '../db', fileName), {
        interval: 1000
      }, () => this.handleFileChange(fileName));
    });
  }
}
```

### Gestion des connexions
- Authentification par token JWT
- Nettoyage automatique des connexions (5min timeout)
- Support multi-onglets
- Reconnexion automatique

## Base de données JSON

### Structure des fichiers
```
server/db/
├── products.json        # Produits
├── sales.json          # Ventes
├── clients.json        # Clients
├── users.json          # Utilisateurs
├── pretfamilles.json   # Prêts familiaux
├── pretproduits.json   # Prêts produits
├── depensedumois.json  # Dépenses mensuelles
├── depensefixe.json    # Dépenses fixes
└── benefices.json      # Calculs bénéfices
```

### Modèles de gestion
```javascript
// Exemple modèle Product
class Product {
  static async getAll() {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  }

  static async create(productData) {
    const products = await this.getAll();
    const newProduct = {
      id: generateId(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    return newProduct;
  }
}
```

## Sécurité

### Authentification JWT
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
```

### Validation des données
- Validation côté client avec Zod
- Validation côté serveur
- Sanitisation des entrées
- Protection contre les injections

## Performance

### Optimisations Frontend
- React.memo pour les composants
- useMemo/useCallback pour les calculs
- Lazy loading des pages
- Debouncing des recherches

### Optimisations Backend
- Mise en cache des données
- Compression des réponses
- Limitation du débit (rate limiting)
- Nettoyage automatique des ressources

## Monitoring et logging

### Logs structurés
```javascript
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data)
};
```

### Métriques
- Temps de réponse API
- Nombre de connexions SSE
- Taux d'erreur
- Utilisation mémoire

## Déploiement

### Variables d'environnement
```bash
# Authentification
JWT_SECRET=your_super_secret_key

# Serveur
PORT=10000
NODE_ENV=production

# CORS
FRONTEND_URL=http://localhost:5173
```

### Configuration production
- Minification des assets
- Compression gzip
- Headers de sécurité
- Logs centralisés

Cette architecture modulaire et évolutive permet une maintenance aisée et des extensions futures du système.
