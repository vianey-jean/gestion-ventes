
# GUIDE DE DÉVELOPPEMENT

## Standards de Code

### 1. Composants React

#### Composants Purs
```typescript
/**
 * Composant pur pour afficher les statistiques de produit
 * @param stats - Statistiques calculées (immuable)
 */
const ProductStats: React.FC<{ readonly stats: ProductStatsData }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total" value={stats.total} />
      <StatCard title="Stock" value={stats.inStock} />
      <StatCard title="Valeur" value={stats.totalValue} />
    </div>
  );
};

// Mémoïsation pour éviter les re-renders inutiles
export default React.memo(ProductStats);
```

#### Hooks Personnalisés
```typescript
/**
 * Hook pour les calculs de produits (fonction pure)
 * @param products - Liste des produits (immuable)
 * @returns Statistiques calculées
 */
export const useProductStats = (products: readonly Product[]): ProductStatsData => {
  return useMemo(() => {
    // Calculs purs sans effets de bord
    return {
      total: products.length,
      inStock: products.filter(p => p.quantity > 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
    };
  }, [products]);
};
```

### 2. Services Métier

#### Services Purs
```typescript
/**
 * Service de calculs commerciaux (fonctions pures)
 */
export const businessCalculations = {
  /**
   * Calcule le bénéfice d'une vente
   * @param salePrice - Prix de vente
   * @param purchasePrice - Prix d'achat
   * @param quantity - Quantité vendue
   * @returns Bénéfice calculé
   */
  calculateProfit(salePrice: number, purchasePrice: number, quantity: number): number {
    return (salePrice - purchasePrice) * quantity;
  },

  /**
   * Calcule la marge bénéficiaire
   * @param profit - Bénéfice
   * @param cost - Coût total
   * @returns Marge en pourcentage
   */
  calculateMargin(profit: number, cost: number): number {
    return cost > 0 ? (profit / cost) * 100 : 0;
  }
};
```

### 3. Gestion d'État Immuable

#### Reducer avec Immer
```typescript
/**
 * Reducer pour la gestion des produits (immuable)
 */
const productReducer = (draft: ProductState, action: ProductAction) => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      draft.products.push(action.payload);
      break;
    
    case 'UPDATE_PRODUCT':
      const index = draft.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        draft.products[index] = { ...draft.products[index], ...action.payload.updates };
      }
      break;
    
    case 'DELETE_PRODUCT':
      const deleteIndex = draft.products.findIndex(p => p.id === action.payload.id);
      if (deleteIndex !== -1) {
        draft.products.splice(deleteIndex, 1);
      }
      break;
  }
};
```

## Tests

### Tests de Composants
```typescript
describe('ProductStats', () => {
  const mockStats: ProductStatsData = {
    total: 10,
    inStock: 8,
    totalValue: 1500
  };

  it('affiche les statistiques correctement', () => {
    render(<ProductStats stats={mockStats} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('est un composant pur (même props = même rendu)', () => {
    const { rerender } = render(<ProductStats stats={mockStats} />);
    const firstRender = screen.getByRole('grid');
    
    rerender(<ProductStats stats={mockStats} />);
    const secondRender = screen.getByRole('grid');
    
    expect(firstRender).toEqual(secondRender);
  });
});
```

### Tests de Hooks
```typescript
describe('useProductStats', () => {
  it('calcule les statistiques correctement', () => {
    const products: Product[] = [
      { id: '1', description: 'Produit 1', purchasePrice: 100, quantity: 5 },
      { id: '2', description: 'Produit 2', purchasePrice: 200, quantity: 0 }
    ];

    const { result } = renderHook(() => useProductStats(products));

    expect(result.current).toEqual({
      total: 2,
      inStock: 1,
      totalValue: 500
    });
  });

  it('recalcule uniquement quand les produits changent', () => {
    const products: Product[] = [];
    const { result, rerender } = renderHook(
      ({ products }) => useProductStats(products),
      { initialProps: { products } }
    );

    const firstResult = result.current;
    rerender({ products }); // Même référence
    
    expect(result.current).toBe(firstResult); // Même objet (mémoïsé)
  });
});
```

### Tests de Services
```typescript
describe('businessCalculations', () => {
  describe('calculateProfit', () => {
    it('calcule le bénéfice correctement', () => {
      const profit = businessCalculations.calculateProfit(150, 100, 2);
      expect(profit).toBe(100); // (150 - 100) * 2
    });

    it('gère les valeurs négatives', () => {
      const profit = businessCalculations.calculateProfit(50, 100, 1);
      expect(profit).toBe(-50); // Perte
    });
  });

  describe('calculateMargin', () => {
    it('calcule la marge correctement', () => {
      const margin = businessCalculations.calculateMargin(50, 100);
      expect(margin).toBe(50); // 50%
    });

    it('gère la division par zéro', () => {
      const margin = businessCalculations.calculateMargin(50, 0);
      expect(margin).toBe(0);
    });
  });
});
```

## Bonnes Pratiques

### 1. Immutabilité
- ✅ Utilisez `readonly` pour les props
- ✅ Utilisez Immer pour les mises à jour d'état
- ✅ Évitez les mutations directes
- ❌ Ne modifiez jamais les props ou l'état directement

### 2. Fonctions Pures
- ✅ Pas d'effets de bord dans les composants
- ✅ Résultats prévisibles pour les mêmes entrées
- ✅ Facilite les tests et le débogage
- ❌ Évitez les appels API dans les composants

### 3. Séparation des Responsabilités
- ✅ Composants UI uniquement pour l'affichage
- ✅ Hooks pour la logique métier
- ✅ Services pour les calculs
- ❌ Ne mélangez pas logique et présentation

### 4. Tests
- ✅ Testez tous les composants publics
- ✅ Testez la logique métier séparément
- ✅ Utilisez des données de test réalistes
- ❌ Ne testez pas les détails d'implémentation

