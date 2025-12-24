# GUIDE DE DÉVELOPPEMENT COMPLET

## Système de Gestion Commerciale

**Version**: 2.0.0  
**Dernière mise à jour**: 24 décembre 2025

---

## 📋 Table des Matières

1. [Configuration de l'environnement](#configuration-de-lenvironnement)
2. [Architecture Frontend](#architecture-frontend)
3. [Architecture Backend](#architecture-backend)
4. [Modules Métier](#modules-métier)
5. [Notifications](#notifications)
6. [Rendez-vous](#rendez-vous)
7. [Objectifs](#objectifs)
8. [Tests](#tests)
9. [Bonnes Pratiques](#bonnes-pratiques)

---

## Configuration de l'Environnement

### Prérequis

- Node.js 18+
- npm 9+
- Git

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd gestion-commerciale

# Installation des dépendances frontend
npm install

# Installation des dépendances backend
cd server && npm install && cd ..
```

### Démarrage

```bash
# Terminal 1 - Frontend (port 5173)
npm run dev

# Terminal 2 - Backend (port 10000)
cd server && npm start
```

### Variables d'Environnement

```env
# .env (Frontend)
VITE_API_BASE_URL=http://localhost:10000

# server/.env (Backend)
PORT=10000
JWT_SECRET=votre-secret-jwt-super-securise
NODE_ENV=development
```

---

## Architecture Frontend

### Structure des Fichiers

```
src/
├── components/
│   ├── ui/               # Composants Shadcn/UI
│   ├── dashboard/        # Composants tableau de bord
│   ├── navbar/           # Navigation et objectifs
│   │   ├── ObjectifIndicator.tsx
│   │   └── ObjectifStatsModal.tsx
│   ├── rdv/              # Gestion des rendez-vous
│   │   ├── RdvCalendar.tsx
│   │   ├── RdvCard.tsx
│   │   ├── RdvForm.tsx
│   │   └── RdvNotifications.tsx
│   ├── forms/            # Formulaires
│   └── shared/           # Composants partagés
├── contexts/
│   ├── AuthContext.tsx   # Authentification
│   ├── AppContext.tsx    # État global
│   └── ThemeContext.tsx  # Thème dark/light
├── hooks/
│   ├── useObjectif.ts    # Hook objectifs
│   ├── useRdv.ts         # Hook rendez-vous
│   ├── useSales.ts       # Hook ventes
│   └── ...
├── services/
│   └── api/
│       ├── objectifApi.ts
│       ├── rdvApi.ts
│       ├── saleApi.ts
│       └── ...
├── pages/
│   ├── DashboardPage.tsx
│   ├── RdvPage.tsx
│   └── ...
└── types/
    ├── rdv.ts
    └── ...
```

### Contextes React

#### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

// Utilisation
const { user, login, logout } = useAuth();
```

#### AppContext

```typescript
interface AppContextType {
  products: readonly Product[];
  sales: readonly Sale[];
  clients: readonly Client[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Utilisation
const { products, sales, addSale } = useApp();
```

### Hooks Personnalisés

#### useBusinessCalculations

```typescript
const useBusinessCalculations = (sales: readonly Sale[]) => {
  return useMemo(() => ({
    totalRevenue: sales.reduce((sum, s) => sum + s.sellingPrice * s.quantitySold, 0),
    totalProfit: sales.reduce((sum, s) => sum + s.profit, 0),
    averageMargin: calculateAverageMargin(sales)
  }), [sales]);
};
```

### Services API

```typescript
// services/api/objectifApi.ts
export const objectifApi = {
  get: () => api.get('/objectif'),
  updateObjectif: (objectif: number) => api.put('/objectif', { objectif }),
  recalculate: () => api.post('/objectif/recalculate'),
  getHistorique: () => api.get('/objectif/historique')
};
```

---

## Architecture Backend

### Structure des Fichiers

```
server/
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── sales.js
│   ├── rdv.js
│   ├── rdvNotifications.js
│   ├── objectif.js
│   └── sync.js
├── models/
│   ├── Objectif.js
│   ├── Rdv.js
│   ├── RdvNotification.js
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── security.js
├── db/
│   ├── products.json
│   ├── sales.json
│   ├── rdv.json
│   ├── rdvNotifications.json
│   └── objectif.json
└── server.js
```

### Configuration Express

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/rdv', require('./routes/rdv'));
app.use('/api/rdv-notifications', require('./routes/rdvNotifications'));
app.use('/api/objectif', require('./routes/objectif'));
app.use('/api/sync', require('./routes/sync'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Middleware d'Authentification

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};
```

---

## Modules Métier

### Gestion des Produits

```typescript
// Types
interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  imageUrl?: string;
}

// Hook
const { products, addProduct, updateProduct, deleteProduct } = useProducts();

// Filtrage (stock > 0 uniquement)
const availableProducts = products.filter(p => p.quantity > 0);
```

### Gestion des Ventes

```typescript
// Types
interface Sale {
  id: string;
  date: string;
  productId: string;
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  quantitySold: number;
  profit: number;
  clientName?: string;
}

// Création de vente avec mise à jour stock
const createSale = async (saleData) => {
  // Le backend diminue automatiquement la quantité du produit
  const sale = await saleApi.create(saleData);
  await refreshProducts();
  return sale;
};
```

---

## Notifications

### Structure

```typescript
interface Notification {
  id: string;
  type: 'rdv_reminder' | 'rdv_today' | 'payment_due' | 'stock_low';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}
```

### Composant RdvNotifications

```tsx
// components/rdv/RdvNotifications.tsx
export const RdvNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // SSE pour temps réel
    const eventSource = new EventSource('/api/sync/events');
    eventSource.addEventListener('notification', (e) => {
      const notif = JSON.parse(e.data);
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    return () => eventSource.close();
  }, []);

  const markAsRead = async (id: string) => {
    await rdvNotificationsApi.markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  return (
    <div className="notifications-panel">
      <Badge count={unreadCount} />
      {notifications.map(notif => (
        <NotificationCard 
          key={notif.id} 
          notification={notif}
          onMarkAsRead={markAsRead}
        />
      ))}
    </div>
  );
};
```

### Service de Notifications

```typescript
// services/api/rdvNotificationsApi.ts
export const rdvNotificationsApi = {
  getAll: (params?: { unreadOnly?: boolean }) => 
    api.get('/rdv-notifications', { params }),
  
  create: (notification: Omit<Notification, 'id' | 'createdAt'>) =>
    api.post('/rdv-notifications', notification),
  
  markAsRead: (id: string) =>
    api.patch(`/rdv-notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/rdv-notifications/read-all'),
  
  delete: (id: string) =>
    api.delete(`/rdv-notifications/${id}`)
};
```

---

## Rendez-vous

### Types

```typescript
interface Rdv {
  id: string;
  titre: string;
  date: string;
  heure?: string;
  clientId?: string;
  clientNom?: string;
  description?: string;
  statut: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}
```

### Hook useRdv

```typescript
// hooks/useRdv.ts
export const useRdv = () => {
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRdvs = useCallback(async () => {
    setIsLoading(true);
    const data = await rdvApi.getAll();
    setRdvs(data);
    setIsLoading(false);
  }, []);

  const createRdv = async (data: Omit<Rdv, 'id' | 'createdAt'>) => {
    const newRdv = await rdvApi.create(data);
    setRdvs(prev => [...prev, newRdv]);
    return newRdv;
  };

  const updateRdv = async (id: string, updates: Partial<Rdv>) => {
    const updated = await rdvApi.update(id, updates);
    setRdvs(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const deleteRdv = async (id: string) => {
    await rdvApi.delete(id);
    setRdvs(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => { fetchRdvs(); }, [fetchRdvs]);

  return { rdvs, isLoading, createRdv, updateRdv, deleteRdv, refetch: fetchRdvs };
};
```

### Composant Calendrier

```tsx
// components/rdv/RdvCalendar.tsx
export const RdvCalendar: React.FC<{
  rdvs: Rdv[];
  onRdvClick: (rdv: Rdv) => void;
  onDateSelect: (date: Date) => void;
  onRdvDrop: (rdv: Rdv, newDate: Date) => void;
}> = ({ rdvs, onRdvClick, onDateSelect, onRdvDrop }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = getDaysInMonth(currentMonth);
  const rdvsByDay = groupRdvsByDay(rdvs, currentMonth);

  return (
    <div className="calendar-grid">
      {daysInMonth.map(day => (
        <div 
          key={day.toISOString()}
          className="calendar-day"
          onClick={() => onDateSelect(day)}
          onDrop={(e) => handleDrop(e, day)}
          onDragOver={(e) => e.preventDefault()}
        >
          <span className="day-number">{day.getDate()}</span>
          {rdvsByDay[day.toDateString()]?.map(rdv => (
            <RdvCard
              key={rdv.id}
              rdv={rdv}
              onClick={() => onRdvClick(rdv)}
              draggable
            />
          ))}
        </div>
      ))}
    </div>
  );
};
```

---

## Objectifs

### Modèle Backend

```javascript
// server/models/Objectif.js
const DEFAULT_OBJECTIF = 2000;

const Objectif = {
  get: () => {
    const data = readData();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Reset si changement de mois
    if (data.mois !== currentMonth || data.annee !== currentYear) {
      // Sauvegarder le mois précédent dans l'historique
      if (data.totalVentesMois > 0) {
        data.historique.push({
          mois: data.mois,
          annee: data.annee,
          totalVentesMois: data.totalVentesMois,
          objectif: data.objectif,
          pourcentage: Math.round((data.totalVentesMois / data.objectif) * 100)
        });
      }
      
      // Reset pour le nouveau mois
      data.totalVentesMois = 0;
      data.mois = currentMonth;
      data.annee = currentYear;
      data.objectif = DEFAULT_OBJECTIF;
      writeData(data);
    }
    
    return data;
  },
  
  updateObjectif: (newObjectif, targetMonth, targetYear) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Vérification: mois passés verrouillés
    if (targetYear < currentYear || 
        (targetYear === currentYear && targetMonth < currentMonth)) {
      throw new Error('Cannot modify objectif for past months');
    }
    
    const data = readData();
    data.objectif = Number(newObjectif);
    writeData(data);
    return data;
  },
  
  recalculateFromSales: (sales) => {
    // Calcul des totaux mensuels depuis les ventes
    const monthlyTotals = {};
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + sale.totalSellingPrice;
    });
    
    // Mise à jour de l'historique en préservant les objectifs personnalisés
    // ...
  }
};
```

### Hook useObjectif

```typescript
// hooks/useObjectif.ts
export const useObjectif = () => {
  const [data, setData] = useState<ObjectifData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchObjectif = useCallback(async () => {
    setLoading(true);
    const result = await objectifApi.get();
    setData(result);
    setLoading(false);
  }, []);

  const updateObjectif = useCallback(async (newObjectif: number) => {
    const result = await objectifApi.updateObjectif(newObjectif);
    setData(result);
    // NE PAS recalculer après modification pour préserver la valeur
    return result;
  }, []);

  useEffect(() => {
    fetchObjectif();
    
    // Recalcul périodique pour synchro avec les ventes
    const interval = setInterval(() => {
      objectifApi.recalculate().then(setData);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchObjectif]);

  return { data, loading, updateObjectif, recalculate };
};
```

### Composant ObjectifStatsModal

```tsx
// components/navbar/ObjectifStatsModal.tsx
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const ObjectifStatsModal: React.FC = () => {
  const [data, setData] = useState<ObjectifHistorique | null>(null);

  const chartData = data?.historique?.map((item) => ({
    name: MOIS_NOMS[item.mois - 1], // Affichage correct des mois
    ventes: item.totalVentesMois,
    objectif: item.objectif,
    pourcentage: item.pourcentage,
  })) || [];

  return (
    <Dialog>
      <DialogContent>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
            />
            <Area dataKey="ventes" />
          </AreaChart>
        </ResponsiveContainer>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Tests

### Configuration Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

### Tests de Composants

```typescript
// tests/ObjectifStatsModal.test.tsx
describe('ObjectifStatsModal', () => {
  it('affiche les mois correctement', async () => {
    render(<ObjectifStatsModal />);
    
    await waitFor(() => {
      expect(screen.getByText('Août')).toBeInTheDocument();
      expect(screen.getByText('Novembre')).toBeInTheDocument();
    });
  });
});
```

### Tests de Hooks

```typescript
// tests/useObjectif.test.tsx
describe('useObjectif', () => {
  it('met à jour l\'objectif', async () => {
    const { result } = renderHook(() => useObjectif());
    
    await act(async () => {
      await result.current.updateObjectif(3000);
    });
    
    expect(result.current.data?.objectif).toBe(3000);
  });
});
```

---

## Bonnes Pratiques

### 1. Composants Purs

```typescript
// Utiliser React.memo pour les composants sans side effects
const StatCard: React.FC<Props> = React.memo(({ title, value }) => (
  <Card>{title}: {value}</Card>
));
```

### 2. Immutabilité

```typescript
// Toujours créer de nouvelles références
setItems(prev => [...prev, newItem]);
setItem(prev => ({ ...prev, ...updates }));
```

### 3. Mémoïsation

```typescript
// useMemo pour les calculs coûteux
const totalVentes = useMemo(() => 
  sales.reduce((sum, s) => sum + s.sellingPrice, 0), 
  [sales]
);

// useCallback pour les fonctions
const handleSubmit = useCallback(async (data) => {
  await saveData(data);
}, [saveData]);
```

### 4. Gestion des Erreurs

```typescript
try {
  await api.post('/data', payload);
  toast.success('Enregistré');
} catch (error) {
  console.error(error);
  toast.error('Erreur lors de l\'enregistrement');
}
```

### 5. TypeScript Strict

```typescript
// Types explicites
interface Props {
  readonly items: ReadonlyArray<Item>;
  onSelect: (id: string) => void;
}
```

---

*Guide de développement mis à jour le 24 décembre 2025*
