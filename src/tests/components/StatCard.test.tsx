
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { Package } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Statistic',
    description: 'Test description',
    value: 1234
  };

  it('affiche le titre et la valeur correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('affiche la description correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('formate les nombres avec des séparateurs', () => {
    render(<StatCard {...defaultProps} value={1234567} />);
    
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('affiche les valeurs string sans formatage', () => {
    render(<StatCard {...defaultProps} value="Test Value" />);
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('applique les classes CSS personnalisées à la valeur', () => {
    render(<StatCard {...defaultProps} valueClassName="text-red-500" />);
    
    const valueElement = screen.getByText('1234');
    expect(valueElement).toHaveClass('text-red-500');
  });

  it('utilise la classe par défaut quand aucune classe n\'est fournie', () => {
    render(<StatCard {...defaultProps} />);
    
    const valueElement = screen.getByText('1234');
    expect(valueElement).toHaveClass('text-gray-700');
  });

  it('est un composant pur (même rendu pour mêmes props)', () => {
    const { rerender } = render(<StatCard {...defaultProps} />);
    const firstRender = screen.getByRole('article').innerHTML;
    
    rerender(<StatCard {...defaultProps} />);
    const secondRender = screen.getByRole('article').innerHTML;
    
    expect(firstRender).toBe(secondRender);
  });
});
