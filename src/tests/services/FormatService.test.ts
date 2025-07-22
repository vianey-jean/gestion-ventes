
import { describe, it, expect } from 'vitest';
import { FormatService } from '@/services/FormatService';

describe('FormatService', () => {
  describe('formatCurrency', () => {
    it('formate les montants en euros par défaut', () => {
      expect(FormatService.formatCurrency(1234.56)).toBe('1 234,56 €');
      expect(FormatService.formatCurrency(0)).toBe('0,00 €');
      expect(FormatService.formatCurrency(999.9)).toBe('999,90 €');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatCurrency(NaN)).toBe('0,00 €');
      expect(FormatService.formatCurrency(Infinity)).toBe('0,00 €');
      expect(FormatService.formatCurrency(-Infinity)).toBe('0,00 €');
    });

    it('formate avec différentes devises', () => {
      const result = FormatService.formatCurrency(100, 'USD');
      expect(result).toContain('100');
      expect(result).toContain('USD');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');

    it('formate les dates au format court par défaut', () => {
      const result = FormatService.formatDate(testDate);
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('formate les dates string', () => {
      const result = FormatService.formatDate('2024-01-15');
      expect(result).toContain('15');
    });

    it('gère les dates invalides', () => {
      expect(FormatService.formatDate('invalid-date')).toBe('Date invalide');
      expect(FormatService.formatDate(new Date('invalid'))).toBe('Date invalide');
    });

    it('formate avec différents formats', () => {
      const short = FormatService.formatDate(testDate, 'short');
      const long = FormatService.formatDate(testDate, 'long');
      
      expect(short).not.toBe(long);
      expect(long.length).toBeGreaterThan(short.length);
    });
  });

  describe('formatNumber', () => {
    it('formate les nombres avec séparateurs', () => {
      expect(FormatService.formatNumber(1234)).toBe('1 234');
      expect(FormatService.formatNumber(1234567)).toBe('1 234 567');
      expect(FormatService.formatNumber(0)).toBe('0');
    });

    it('formate avec décimales', () => {
      expect(FormatService.formatNumber(1234.5678, 2)).toBe('1 234,57');
      expect(FormatService.formatNumber(1000, 3)).toBe('1 000,000');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatNumber(NaN)).toBe('0');
      expect(FormatService.formatNumber(Infinity)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('formate les ratios en pourcentages', () => {
      expect(FormatService.formatPercentage(0.5)).toBe('50,0 %');
      expect(FormatService.formatPercentage(0.123)).toBe('12,3 %');
      expect(FormatService.formatPercentage(1)).toBe('100,0 %');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatPercentage(NaN)).toBe('0%');
      expect(FormatService.formatPercentage(Infinity)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    it('formate les tailles de fichier', () => {
      expect(FormatService.formatFileSize(0)).toBe('0 B');
      expect(FormatService.formatFileSize(1024)).toBe('1 KB');
      expect(FormatService.formatFileSize(1048576)).toBe('1 MB');
      expect(FormatService.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('formate avec décimales', () => {
      expect(FormatService.formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(FormatService.formatFileSize(2560, 2)).toBe('2.50 KB');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatFileSize(-100)).toBe('0 B');
      expect(FormatService.formatFileSize(NaN)).toBe('0 B');
    });
  });

  describe('formatDuration', () => {
    it('formate les durées simples', () => {
      expect(FormatService.formatDuration(0)).toBe('0s');
      expect(FormatService.formatDuration(30)).toBe('30s');
      expect(FormatService.formatDuration(60)).toBe('1m');
      expect(FormatService.formatDuration(3600)).toBe('1h');
    });

    it('formate les durées composées', () => {
      expect(FormatService.formatDuration(3661)).toBe('1h 1m 1s');
      expect(FormatService.formatDuration(7890)).toBe('2h 11m 30s');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatDuration(-100)).toBe('0s');
      expect(FormatService.formatDuration(NaN)).toBe('0s');
    });
  });

  describe('truncateText', () => {
    it('tronque le texte correctement', () => {
      expect(FormatService.truncateText('Hello World', 5)).toBe('He...');
      expect(FormatService.truncateText('Short', 10)).toBe('Short');
      expect(FormatService.truncateText('', 5)).toBe('');
    });

    it('utilise un suffixe personnalisé', () => {
      expect(FormatService.truncateText('Hello World', 5, ' (suite)')).toBe('H (suite)');
    });

    it('gère les valeurs non-string', () => {
      expect(FormatService.truncateText(null as any, 5)).toBe('');
      expect(FormatService.truncateText(undefined as any, 5)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('capitalise correctement', () => {
      expect(FormatService.capitalize('hello')).toBe('Hello');
      expect(FormatService.capitalize('WORLD')).toBe('World');
      expect(FormatService.capitalize('hELLo WoRLD')).toBe('Hello world');
    });

    it('gère les cas limites', () => {
      expect(FormatService.capitalize('')).toBe('');
      expect(FormatService.capitalize('a')).toBe('A');
      expect(FormatService.capitalize(null as any)).toBe('');
    });
  });

  describe('formatFullName', () => {
    it('formate les noms complets', () => {
      expect(FormatService.formatFullName('john', 'DOE')).toBe('John Doe');
      expect(FormatService.formatFullName('  marie  ', '  MARTIN  ')).toBe('Marie Martin');
    });

    it('gère les noms partiels', () => {
      expect(FormatService.formatFullName('John', '')).toBe('John');
      expect(FormatService.formatFullName('', 'Doe')).toBe('Doe');
      expect(FormatService.formatFullName('', '')).toBe('Nom non renseigné');
    });

    it('gère les valeurs nulles', () => {
      expect(FormatService.formatFullName(null as any, 'Doe')).toBe('Doe');
      expect(FormatService.formatFullName('John', undefined as any)).toBe('John');
    });
  });

  describe('immutabilité du service', () => {
    it('le service est immuable', () => {
      expect(Object.isFrozen(FormatService)).toBe(true);
    });

    it('ne peut pas être modifié', () => {
      expect(() => {
        (FormatService as any).newMethod = () => {};
      }).toThrow();
    });
  });
});
