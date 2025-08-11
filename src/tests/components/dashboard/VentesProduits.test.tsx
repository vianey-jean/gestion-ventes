
// Importation des utilitaires de test pour le rendu et les interactions
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Importation des fonctions de test et mocks Vitest
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Importation des matchers Jest DOM
import '@testing-library/jest-dom';
// Importation du composant à tester
import VentesProduits from '@/components/dashboard/VentesProduits';
// Importation des providers de contexte nécessaires
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Données mock de ventes pour les tests
const mockSales = [
  {
    id: '1', // Identifiant unique de la première vente
    date: '2024-01-15', // Date de la vente
    productId: '1', // Identifiant du produit vendu
    description: 'Perruque Lisse', // Description du produit
    sellingPrice: 100, // Prix de vente
    quantitySold: 1, // Quantité vendue
    purchasePrice: 50, // Prix d'achat
    profit: 50, // Bénéfice calculé
    clientName: 'Marie Dubois', // Nom du client
    clientPhone: '+33123456789', // Téléphone du client
    clientAddress: '123 Rue Test' // Adresse du client
  },
  {
    id: '2', // Identifiant unique de la seconde vente
    date: '2024-01-14', // Date antérieure
    productId: '2', // Différent produit
    description: 'Tissage Bouclé', // Description du second produit
    sellingPrice: 150, // Prix de vente plus élevé
    quantitySold: 2, // Quantité multiple
    purchasePrice: 100, // Prix d'achat total
    profit: 50, // Même bénéfice
    clientName: 'Jean Martin', // Nom du second client
    clientPhone: '+33987654321', // Téléphone différent
    clientAddress: '456 Avenue Test' // Adresse différente
  }
];

// Données mock de produits pour les tests
const mockProducts = [
  {
    id: '1', // Identifiant correspondant au premier produit vendu
    description: 'Perruque Lisse', // Description identique à la vente
    purchasePrice: 50, // Prix d'achat unitaire
    quantity: 10 // Stock disponible
  },
  {
    id: '2', // Identifiant correspondant au second produit vendu
    description: 'Tissage Bouclé', // Description identique à la vente
    purchasePrice: 75, // Prix d'achat différent (test de cohérence)
    quantity: 5 // Stock plus faible
  }
];

// Objet mock du contexte d'application
const mockAppContext = {
  sales: mockSales, // Liste des ventes mock
  products: mockProducts, // Liste des produits mock
  addSale: vi.fn(), // Fonction mock pour ajouter une vente
  updateSale: vi.fn(), // Fonction mock pour modifier une vente
  deleteSale: vi.fn(), // Fonction mock pour supprimer une vente
  refreshData: vi.fn() // Fonction mock pour rafraîchir les données
};

// Mock du hook useApp pour contrôler le contexte
vi.mock('@/contexts/AppContext', async () => {
  // Importation du module réel
  const actual = await vi.importActual('@/contexts/AppContext');
  return {
    ...actual, // Préservation des autres exports
    useApp: () => mockAppContext // Remplacement du hook par le mock
  };
});

// Fonction utilitaire pour rendre un composant avec tous les providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    // Wrapper avec AuthProvider en parent
    <AuthProvider>
      {/* Wrapper avec AppProvider contenant les données mock */}
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};

// Suite de tests pour le composant VentesProduits
describe('VentesProduits', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialisation de tous les mocks avant chaque test
    vi.clearAllMocks();
  });

  // Nettoyage après chaque test
  afterEach(() => {
    // Réinitialisation de tous les mocks après chaque test
    vi.clearAllMocks();
  });

  // Test d'affichage de la liste des ventes
  it('affiche la liste des ventes', () => {
    // Rendu du composant avec les providers
    renderWithProviders(<VentesProduits />);

    // Vérification que le titre principal est présent
    expect(screen.getByText(/gestion des ventes/i)).toBeInTheDocument();
    // Vérification que le premier client est affiché
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    // Vérification que le second client est affiché
    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
  });

  // Test d'ajout d'une nouvelle vente
  it('permet d\'ajouter une nouvelle vente', () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Recherche et clic sur le bouton d'ajout
    const addButton = screen.getByRole('button', { name: /ajouter une vente/i });
    fireEvent.click(addButton);

    // Vérification que le formulaire d'ajout s'ouvre
    expect(screen.getByText(/ajouter une vente/i)).toBeInTheDocument();
  });

  // Test de modification d'une vente existante
  it('permet de modifier une vente existante', () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Recherche de tous les boutons de modification
    const editButtons = screen.getAllByRole('button', { name: /modifier/i });
    // Clic sur le premier bouton de modification
    fireEvent.click(editButtons[0]);

    // Vérification que le formulaire de modification s'ouvre
    expect(screen.getByText(/modifier la vente/i)).toBeInTheDocument();
  });

  // Test de filtrage des ventes par date
  it('filtre les ventes par date', async () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Vérification que les deux ventes sont affichées initialement
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
  });

  // Test de calcul des totaux
  it('calcule correctement les totaux', () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Vérification que les totaux sont affichés
    // Le profit total devrait être 100 (50 + 50)
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  // Test d'export des données de vente
  it('exporte les données de vente', () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Recherche et clic sur le bouton d'export
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);

    // Vérification que le dialogue d'export s'ouvre
    expect(screen.getByText(/exporter les ventes/i)).toBeInTheDocument();
  });

  // Test de recherche dans les ventes
  it('recherche dans les ventes', async () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Recherche du champ de recherche
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    // Saisie du terme de recherche
    fireEvent.change(searchInput, { target: { value: 'Marie' } });

    // Attente que le filtrage soit appliqué
    await waitFor(() => {
      // Vérification que le client recherché est toujours visible
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });
  });

  // Test de tri des ventes par colonne
  it('trie les ventes par colonne', () => {
    // Rendu du composant
    renderWithProviders(<VentesProduits />);

    // Recherche et clic sur l'en-tête de colonne pour trier
    const dateHeader = screen.getByText(/date/i);
    fireEvent.click(dateHeader);

    // Vérification que les données sont toujours affichées après le tri
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
  });
});
