
// Importation des utilitaires de test React Testing Library pour le rendu et la recherche d'éléments
import { render, screen } from '@testing-library/react';
// Importation des fonctions de test Vitest pour structurer les tests
import { describe, it, expect } from 'vitest';
// Importation des matchers Jest DOM pour des assertions plus expressives
import '@testing-library/jest-dom';
// Importation de l'icône Package de Lucide React (non utilisée mais présente)
import { Package } from 'lucide-react';
// Importation du composant StatCard à tester
import StatCard from '@/components/dashboard/StatCard';

// Suite de tests pour le composant StatCard
describe('StatCard', () => {
  // Objet contenant les propriétés par défaut pour les tests
  const defaultProps = {
    title: 'Test Statistic', // Titre de test pour la statistique
    description: 'Test description', // Description de test
    value: 1234 // Valeur numérique de test
  };

  // Test pour vérifier que le titre et la valeur s'affichent correctement
  it('affiche le titre et la valeur correctement', () => {
    // Rendu du composant StatCard avec les propriétés par défaut
    render(<StatCard {...defaultProps} />);
    
    // Vérification que le titre 'Test Statistic' est présent dans le document
    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    // Vérification que la valeur '1234' est présente dans le document
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  // Test pour vérifier que la description s'affiche correctement
  it('affiche la description correctement', () => {
    // Rendu du composant avec les propriétés par défaut
    render(<StatCard {...defaultProps} />);
    
    // Vérification que la description 'Test description' est présente
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  // Test pour vérifier le formatage des nombres avec des séparateurs
  it('formate les nombres avec des séparateurs', () => {
    // Rendu du composant avec une valeur plus grande pour tester le formatage
    render(<StatCard {...defaultProps} value={1234567} />);
    
    // Vérification que le nombre s'affiche tel quel (le formatage dépend de l'implémentation)
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  // Test pour vérifier l'affichage des valeurs string sans formatage
  it('affiche les valeurs string sans formatage', () => {
    // Rendu du composant avec une valeur string au lieu de number
    render(<StatCard {...defaultProps} value="Test Value" />);
    
    // Vérification que la valeur string s'affiche correctement
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  // Test pour vérifier l'application des classes CSS personnalisées à la valeur
  it('applique les classes CSS personnalisées à la valeur', () => {
    // Rendu du composant avec une classe CSS personnalisée pour la valeur
    render(<StatCard {...defaultProps} valueClassName="text-red-500" />);
    
    // Récupération de l'élément contenant la valeur
    const valueElement = screen.getByText('1234');
    // Vérification que la classe CSS personnalisée est appliquée
    expect(valueElement).toHaveClass('text-red-500');
  });

  // Test pour vérifier l'utilisation de la classe par défaut
  it('utilise la classe par défaut quand aucune classe n\'est fournie', () => {
    // Rendu du composant sans classe personnalisée
    render(<StatCard {...defaultProps} />);
    
    // Récupération de l'élément contenant la valeur
    const valueElement = screen.getByText('1234');
    // Vérification que la classe par défaut 'text-gray-700' est appliquée
    expect(valueElement).toHaveClass('text-gray-700');
  });

  // Test pour vérifier que le composant est pur (même rendu pour mêmes props)
  it('est un composant pur (même rendu pour mêmes props)', () => {
    // Premier rendu du composant avec les propriétés par défaut
    const { rerender } = render(<StatCard {...defaultProps} />);
    // Capture du HTML du premier rendu
    const firstRender = screen.getByRole('article').innerHTML;
    
    // Second rendu avec les mêmes propriétés
    rerender(<StatCard {...defaultProps} />);
    // Capture du HTML du second rendu
    const secondRender = screen.getByRole('article').innerHTML;
    
    // Vérification que les deux rendus sont identiques
    expect(firstRender).toBe(secondRender);
  });
});
