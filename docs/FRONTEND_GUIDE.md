
# Guide Frontend

## Structure des composants

### Hiérarchie des composants
```
src/components/
├── ui/                     # Composants UI de base (Shadcn/UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── dashboard/              # Composants du tableau de bord
│   ├── StatCard.tsx
│   ├── VentesProduits.tsx
│   ├── Inventaire.tsx
│   └── sections/
│       ├── SalesOverviewSection.tsx
│       └── SalesManagementSection.tsx
├── forms/                  # Composants de formulaires
│   ├── AddSaleForm.tsx
│   └── ProductForm.tsx
└── layout/                 # Composants de mise en page
    ├── Header.tsx
    └── Sidebar.tsx
```

## Contextes React

### AuthContext
Gère l'authentification utilisateur :
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}
```

### AppContext
Gère les données de l'application :
```typescript
interface AppContextType {
  products: readonly Product[];
  sales: readonly Sale[];
  clients: readonly Client[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => Promise<void>;
  refreshData: () => Promise<void>;
}
```

## Hooks personnalisés

### useBusinessCalculations
Hook pour les calculs commerciaux :
```typescript
const useBusinessCalculations = (sales: readonly Sale[]) => {
  return useMemo(() => ({
    totalRevenue: sales.reduce((sum, sale) => sum + (sale.sellingPrice * sale.quantitySold), 0),
    totalProfit: sales.reduce((sum, sale) => sum + sale.profit, 0),
    totalQuantity: sales.reduce((sum, sale) => sum + sale.quantitySold, 0),
    averageProfit: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.profit, 0) / sales.length : 0,
    averageMargin: // calcul de la marge
  }), [sales]);
};
```

### useRealtimeSync
Hook pour la synchronisation temps réel :
```typescript
const useRealtimeSync = (options?: { enabled?: boolean; interval?: number }) => {
  // Connexion SSE
  // Synchronisation périodique
  // Gestion de la visibilité de l'onglet
};
```

## Services

### FormatService
Service de formatage des données :
```typescript
export const FormatService = Object.freeze({
  formatCurrency: (amount: number, currency = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount);
  },
  
  formatDate: (date: Date | string, format: 'short' | 'long' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: format === 'long' ? 'long' : '2-digit',
      day: '2-digit'
    });
  }
});
```

## Patterns de développement

### Composants purs
```typescript
interface StatCardProps {
  readonly title: string;
  readonly description: string;
  readonly value: React.ReactNode;
  readonly valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ 
  title, 
  description, 
  value, 
  valueClassName = "text-gray-700" 
}) => {
  return (
    <Card className='card-3d'>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueClassName}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
});
```

### Gestion d'état immuable
```typescript
const [state, dispatch] = useImmerReducer(appReducer, initialState);

const appReducer = (draft: AppState, action: AppAction) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      draft.products = action.payload;
      break;
    case 'ADD_PRODUCT':
      draft.products.push(action.payload);
      break;
    case 'UPDATE_PRODUCT':
      const index = draft.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        Object.assign(draft.products[index], action.payload.updates);
      }
      break;
  }
};
```

## Optimisations de performance

### Mémoïsation
- Utilisation de `React.memo` pour les composants
- `useMemo` pour les calculs coûteux
- `useCallback` pour les fonctions

### Lazy Loading
```typescript
const AdvancedDashboard = React.lazy(() => import('./AdvancedDashboard'));

<React.Suspense fallback={<Loading />}>
  <AdvancedDashboard />
</React.Suspense>
```

## Styling avec Tailwind CSS

### Classes utilitaires
- Utilisation des tokens sémantiques du design system
- Classes responsives : `md:`, `lg:`, `xl:`
- États : `hover:`, `focus:`, `active:`

### Composants Shadcn/UI
- Composants pré-stylés et accessibles
- Personnalisables via CSS variables
- Intégration parfaite avec Tailwind

## Tests des composants

### Tests unitaires avec Vitest
```typescript
describe('StatCard', () => {
  it('affiche le titre et la valeur correctement', () => {
    render(<StatCard title="Test" description="Desc" value={123} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
```

### Tests d'intégration
```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};
```
