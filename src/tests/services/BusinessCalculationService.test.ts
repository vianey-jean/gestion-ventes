
import { describe, it, expect } from 'vitest';
import { BusinessCalculationService } from '@/services/BusinessCalculationService';

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

    it('gère les prix à zéro', () => {
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 0,
        purchasePrice: 0,
        quantity: 5
      });

      expect(result).toBe(0);
    });
  });

  describe('calculateMargin', () => {
    it('calcule la marge correctement', () => {
      const result = BusinessCalculationService.calculateMargin({
        profit: 50,
        cost: 100
      });

      expect(result).toBe(50); // 50%
    });

    it('gère la division par zéro', () => {
      const result = BusinessCalculationService.calculateMargin({
        profit: 50,
        cost: 0
      });

      expect(result).toBe(0);
    });

    it('gère les marges négatives', () => {
      const result = BusinessCalculationService.calculateMargin({
        profit: -25,
        cost: 100
      });

      expect(result).toBe(-25);
    });
  });

  describe('calculateTotalCost', () => {
    it('calcule le coût total avec tous les frais', () => {
      const result = BusinessCalculationService.calculateTotalCost({
        purchasePrice: 100,
        customsTax: 10,
        vat: 20, // 20%
        otherFees: 5
      });

      expect(result).toBe(135); // 100 + 10 + (100*0.2) + 5
    });

    it('gère les taxes à zéro', () => {
      const result = BusinessCalculationService.calculateTotalCost({
        purchasePrice: 100,
        customsTax: 0,
        vat: 0,
        otherFees: 0
      });

      expect(result).toBe(100);
    });
  });

  describe('calculateRecommendedPrice', () => {
    it('calcule le prix recommandé avec marge', () => {
      const result = BusinessCalculationService.calculateRecommendedPrice(100, 50);

      expect(result).toBe(150); // 100 * (1 + 50/100)
    });

    it('gère une marge de 0%', () => {
      const result = BusinessCalculationService.calculateRecommendedPrice(100, 0);

      expect(result).toBe(100);
    });
  });

  describe('calculateSalesStatistics', () => {
    const mockSales = [
      { sellingPrice: 100, purchasePrice: 60, quantity: 2 },
      { sellingPrice: 200, purchasePrice: 120, quantity: 1 }
    ];

    it('calcule les statistiques globales', () => {
      const result = BusinessCalculationService.calculateSalesStatistics(mockSales);

      expect(result.totalProfit).toBe(160); // (100-60)*2 + (200-120)*1
      expect(result.averageProfit).toBe(80); // 160 / 2
      expect(result.totalRevenue).toBe(400); // 100*2 + 200*1
      expect(result.averageRevenue).toBe(200); // 400 / 2
    });

    it('gère les tableaux vides', () => {
      const result = BusinessCalculationService.calculateSalesStatistics([]);

      expect(result.totalProfit).toBe(0);
      expect(result.averageProfit).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageRevenue).toBe(0);
    });

    it('retourne des résultats immuables', () => {
      const result = BusinessCalculationService.calculateSalesStatistics(mockSales);

      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  describe('validateCalculationInput', () => {
    it('valide des données correctes', () => {
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: 100,
        purchasePrice: 60,
        quantity: 1
      });

      expect(result).toBe(true);
    });

    it('rejette les prix négatifs', () => {
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: -100,
        purchasePrice: 60,
        quantity: 1
      });

      expect(result).toBe(false);
    });

    it('rejette les quantités nulles ou négatives', () => {
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: 100,
        purchasePrice: 60,
        quantity: 0
      });

      expect(result).toBe(false);
    });

    it('rejette les valeurs non numériques', () => {
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: NaN,
        purchasePrice: 60,
        quantity: 1
      });

      expect(result).toBe(false);
    });

    it('rejette les valeurs infinies', () => {
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: Infinity,
        purchasePrice: 60,
        quantity: 1
      });

      expect(result).toBe(false);
    });
  });

  describe('immutabilité du service', () => {
    it('le service est immuable', () => {
      expect(Object.isFrozen(BusinessCalculationService)).toBe(true);
    });

    it('ne peut pas être modifié', () => {
      expect(() => {
        (BusinessCalculationService as any).newMethod = () => {};
      }).toThrow();
    });
  });
});
