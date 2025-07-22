
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBusinessCalculations } from '@/hooks/useBusinessCalculations';
import { Sale } from '@/types';

describe('useBusinessCalculations', () => {
  const mockSales: readonly Sale[] = Object.freeze([
    Object.freeze({
      id: '1',
      date: '2024-01-15',
      productId: 'p1',
      description: 'Produit 1',
      sellingPrice: 100,
      quantitySold: 2,
      purchasePrice: 60,
      profit: 80
    }),
    Object.freeze({
      id: '2',
      date: '2024-01-16',
      productId: 'p2',
      description: 'Produit 2',
      sellingPrice: 200,
      quantitySold: 1,
      purchasePrice: 120,
      profit: 80
    })
  ] as const);

  it('calcule les statistiques de vente correctement', () => {
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    expect(result.current.totalRevenue).toBe(400); // (100*2) + (200*1)
    expect(result.current.totalProfit).toBe(160); // 80 + 80
    expect(result.current.totalQuantity).toBe(3); // 2 + 1
    expect(result.current.averageProfit).toBe(80); // 160 / 2
  });

  it('calcule la marge moyenne correctement', () => {
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    // Marge = (profit / revenue) * 100 = (160 / 400) * 100 = 40%
    expect(result.current.averageMargin).toBe(40);
  });

  it('recalcule uniquement quand les données changent (mémoïsation)', () => {
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    const firstCalculation = result.current;
    rerender({ sales: mockSales }); // Même référence
    
    expect(result.current).toBe(firstCalculation); // Même objet
  });

  it('recalcule quand les données changent réellement', () => {
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    const firstCalculation = result.current;
    
    const newSales = [...mockSales, Object.freeze({
      id: '3',
      date: '2024-01-17',
      productId: 'p3',
      description: 'Produit 3',
      sellingPrice: 150,
      quantitySold: 1,
      purchasePrice: 100,
      profit: 50
    } as const)];
    
    rerender({ sales: newSales });
    
    expect(result.current).not.toBe(firstCalculation); // Objet différent
    expect(result.current.totalRevenue).toBe(550); // 400 + 150
  });

  it('gère les tableaux vides', () => {
    const { result } = renderHook(() => useBusinessCalculations([]));

    expect(result.current.totalRevenue).toBe(0);
    expect(result.current.totalProfit).toBe(0);
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.averageProfit).toBe(0);
    expect(result.current.averageMargin).toBe(0);
  });

  it('gère les cas avec un seul élément', () => {
    const singleSale = [mockSales[0]];
    const { result } = renderHook(() => useBusinessCalculations(singleSale));

    expect(result.current.totalRevenue).toBe(200); // 100 * 2
    expect(result.current.totalProfit).toBe(80);
    expect(result.current.averageProfit).toBe(80);
    expect(result.current.averageMargin).toBe(40); // (80 / 200) * 100
  });

  it('produit des résultats immuables', () => {
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    // Tentative de modification (ne devrait pas affecter le résultat)
    expect(() => {
      (result.current as any).totalRevenue = 999;
    }).toThrow(); // Objet frozen
  });
});
