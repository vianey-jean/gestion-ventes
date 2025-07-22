
# DOCUMENTATION DES TESTS

## Stratégie de Tests

### Pyramide de Tests
1. **Tests Unitaires** (70%) - Fonctions pures, hooks, services
2. **Tests d'Intégration** (20%) - Composants avec contexte
3. **Tests E2E** (10%) - Parcours utilisateur complets

## Configuration des Tests

### Frontend (Vitest + React Testing Library)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Backend (Jest + Supertest)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Types de Tests

### 1. Tests de Composants Purs

```typescript
/**
 * Test d'un composant pur StatCard
 */
describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: 100,
    icon: TestIcon,
    className: 'test-class'
  };

  it('affiche le titre et la valeur correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('applique les classes CSS correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('test-class');
  });

  it('est mémoïsé correctement', () => {
    const { rerender } = render(<StatCard {...defaultProps} />);
    const firstRender = screen.getByRole('article');
    
    rerender(<StatCard {...defaultProps} />);
    expect(screen.getByRole('article')).toBe(firstRender);
  });
});
```

### 2. Tests de Hooks Métier

```typescript
/**
 * Test d'un hook de calculs métier
 */
describe('useBusinessCalculations', () => {
  it('calcule les statistiques de vente correctement', () => {
    const sales: Sale[] = [
      { id: '1', sellingPrice: 100, purchasePrice: 60, quantitySold: 2, profit: 80 },
      { id: '2', sellingPrice: 200, purchasePrice: 120, quantitySold: 1, profit: 80 }
    ];

    const { result } = renderHook(() => useBusinessCalculations(sales));

    expect(result.current.totalRevenue).toBe(400); // (100*2) + (200*1)
    expect(result.current.totalProfit).toBe(160);
    expect(result.current.averageMargin).toBeCloseTo(40); // 160/400 * 100
  });

  it('recalcule uniquement quand les données changent', () => {
    const sales: Sale[] = [];
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales } }
    );

    const firstCalculation = result.current;
    rerender({ sales }); // Même référence
    
    expect(result.current).toBe(firstCalculation);
  });

  it('gère les tableaux vides', () => {
    const { result } = renderHook(() => useBusinessCalculations([]));

    expect(result.current.totalRevenue).toBe(0);
    expect(result.current.totalProfit).toBe(0);
    expect(result.current.averageMargin).toBe(0);
  });
});
```

### 3. Tests de Services

```typescript
/**
 * Test d'un service de calculs purs
 */
describe('BusinessCalculationService', () => {
  describe('calculateProfit', () => {
    it('calcule le bénéfice simple correctement', () => {
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 150,
        purchasePrice: 100,
        quantity: 1
      });

      expect(result).toBe(50);
    });

    it('calcule le bénéfice avec quantité multiple', () => {
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 150,
        purchasePrice: 100,
        quantity: 3
      });

      expect(result).toBe(150); // (150 - 100) * 3
    });

    it('gère les pertes (bénéfice négatif)', () => {
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 80,
        purchasePrice: 100,
        quantity: 1
      });

      expect(result).toBe(-20);
    });
  });

  describe('calculateMargin', () => {
    it('calcule la marge correctement', () => {
      const result = BusinessCalculationService.calculateMargin(50, 100);
      expect(result).toBe(50); // 50%
    });

    it('gère la division par zéro', () => {
      const result = BusinessCalculationService.calculateMargin(50, 0);
      expect(result).toBe(0);
    });
  });
});
```

### 4. Tests d'Intégration

```typescript
/**
 * Test d'intégration avec contexte
 */
describe('ProductManagement Integration', () => {
  const mockProducts: Product[] = [
    { id: '1', description: 'Produit 1', purchasePrice: 100, quantity: 5 },
    { id: '2', description: 'Produit 2', purchasePrice: 200, quantity: 0 }
  ];

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <ProductProvider initialProducts={mockProducts}>
        {component}
      </ProductProvider>
    );
  };

  it('affiche la liste des produits et permet l\'ajout', async () => {
    renderWithContext(<ProductManagement />);

    // Vérifier l'affichage initial
    expect(screen.getByText('Produit 1')).toBeInTheDocument();
    expect(screen.getByText('Produit 2')).toBeInTheDocument();

    // Simuler l'ajout d'un produit
    const addButton = screen.getByRole('button', { name: /ajouter produit/i });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/prix/i);
    const quantityInput = screen.getByLabelText(/quantité/i);

    fireEvent.change(descriptionInput, { target: { value: 'Nouveau Produit' } });
    fireEvent.change(priceInput, { target: { value: '150' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });

    const submitButton = screen.getByRole('button', { name: /confirmer/i });
    fireEvent.click(submitButton);

    // Vérifier que le produit a été ajouté
    await waitFor(() => {
      expect(screen.getByText('Nouveau Produit')).toBeInTheDocument();
    });
  });
});
```

### 5. Tests d'API (Backend)

```javascript
/**
 * Tests d'API avec Supertest
 */
describe('Products API', () => {
  let authToken;

  beforeEach(async () => {
    // Authentification pour les tests
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/products', () => {
    it('retourne la liste des produits', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/products', () => {
    it('crée un nouveau produit avec authentification', async () => {
      const newProduct = {
        description: 'Test Product',
        purchasePrice: 100,
        quantity: 5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.description).toBe('Test Product');
    });

    it('rejette les requêtes non authentifiées', async () => {
      const newProduct = {
        description: 'Test Product',
        purchasePrice: 100,
        quantity: 5
      };

      await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(401);
    });

    it('valide les données d\'entrée', async () => {
      const invalidProduct = {
        description: '', // Description vide
        purchasePrice: -10, // Prix négatif
        quantity: 'invalid' // Type invalide
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400);
    });
  });
});
```

## Utilitaires de Test

### Mocks et Fixtures

```typescript
/**
 * Fixtures pour les tests
 */
export const mockProducts: Product[] = [
  {
    id: '1',
    description: 'Perruque Lisse',
    purchasePrice: 50,
    quantity: 10,
    imageUrl: '/images/product1.jpg'
  },
  {
    id: '2',
    description: 'Tissage Bouclé',
    purchasePrice: 80,
    quantity: 5,
    imageUrl: '/images/product2.jpg'
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-01-15',
    productId: '1',
    description: 'Perruque Lisse',
    sellingPrice: 100,
    quantitySold: 1,
    purchasePrice: 50,
    profit: 50
  }
];

/**
 * Mock du service API
 */
export const mockApiService = {
  getProducts: vi.fn().mockResolvedValue(mockProducts),
  addProduct: vi.fn().mockResolvedValue(mockProducts[0]),
  updateProduct: vi.fn().mockResolvedValue(mockProducts[0]),
  deleteProduct: vi.fn().mockResolvedValue(true)
};
```

### Helper de Tests

```typescript
/**
 * Helpers pour simplifier les tests
 */
export const testUtils = {
  /**
   * Render un composant avec tous les providers nécessaires
   */
  renderWithProviders: (component: React.ReactElement, options = {}) => {
    const AllProviders = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <ProductProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ProductProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    return render(component, { wrapper: AllProviders, ...options });
  },

  /**
   * Attendre qu'un élément apparaisse
   */
  waitForElement: async (selector: string) => {
    return await waitFor(() => {
      const element = screen.getByTestId(selector);
      expect(element).toBeInTheDocument();
      return element;
    });
  }
};
```

## Scripts de Test

### package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

### Commandes Utiles
```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Génération du rapport de couverture
npm run test:coverage

# Interface graphique des tests
npm run test:ui

# Tests spécifiques
npm run test ProductStats
npm run test -- --grep "calcul"
```

