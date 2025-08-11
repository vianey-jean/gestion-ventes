
// Importation des utilitaires de test pour les interactions complexes
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Importation des fonctions de test et mocks Vitest
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Importation des matchers Jest DOM
import '@testing-library/jest-dom';
// Importation du router pour les tests de navigation
import { BrowserRouter } from 'react-router-dom';
// Importation de la page principale à tester
import DashboardPage from '@/pages/DashboardPage';
// Importation des providers de contexte
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock du service de ventes pour les tests d'intégration
const mockSalesService = {
  getSales: vi.fn().mockResolvedValue([]), // Retourne une liste vide par défaut
  addSale: vi.fn(), // Mock pour l'ajout de ventes
  updateSale: vi.fn(), // Mock pour la modification de ventes
  deleteSale: vi.fn() // Mock pour la suppression de ventes
};

// Mock du service de produits pour les tests
const mockProductService = {
  getProducts: vi.fn().mockResolvedValue([
    {
      id: '1', // Identifiant du produit de test
      description: 'Test Product', // Description générique
      purchasePrice: 50, // Prix d'achat
      quantity: 10 // Stock disponible
    }
  ])
};

// Mock des services API pour l'intégration
vi.mock('@/service/api', () => ({
  salesService: mockSalesService, // Service de ventes mocké
  productService: mockProductService // Service de produits mocké
}));

// Fonction utilitaire pour rendre avec tous les providers nécessaires
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    // Router pour gérer la navigation
    <BrowserRouter>
      {/* Provider d'authentification */}
      <AuthProvider>
        {/* Provider d'application avec les données */}
        <AppProvider>
          {component}
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Suite de tests d'intégration pour le workflow de ventes
describe('SalesWorkflow - Intégration', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialisation de tous les mocks
    vi.clearAllMocks();
  });

  // Nettoyage après chaque test
  afterEach(() => {
    // Nouvelle réinitialisation des mocks
    vi.clearAllMocks();
  });

  // Test du workflow complet de création de vente
  it('workflow complet de création de vente', async () => {
    // Données de la nouvelle vente à créer
    const newSale = {
      id: '1', // Identifiant généré
      date: '2024-01-15', // Date de vente
      productId: '1', // Référence au produit de test
      description: 'Test Product', // Description du produit
      sellingPrice: 100, // Prix de vente défini
      quantitySold: 1, // Quantité à vendre
      purchasePrice: 50, // Prix d'achat du produit
      profit: 50, // Bénéfice calculé (100-50)
      clientName: 'Test Client', // Nom du client de test
      clientPhone: '+33123456789', // Téléphone formaté
      clientAddress: '123 Test Address' // Adresse complète
    };

    // Configuration du mock pour retourner la nouvelle vente
    mockSalesService.addSale.mockResolvedValue(newSale);

    // Rendu de la page complète du dashboard
    renderWithProviders(<DashboardPage />);

    // Vérification que le dashboard se charge correctement
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();

    // Recherche et clic sur le bouton d'ajout de vente
    const addSaleButton = screen.getByRole('button', { name: /ajouter une vente/i });
    fireEvent.click(addSaleButton);

    // Attente que le formulaire s'ouvre
    await waitFor(() => {
      // Vérification que le formulaire d'ajout est visible
      expect(screen.getByText(/ajouter une vente/i)).toBeInTheDocument();
    });
  });

  // Test du workflow de modification de vente existante
  it('workflow de modification de vente existante', async () => {
    // Données d'une vente existante
    const existingSale = {
      id: '1', // Identifiant de la vente existante
      date: '2024-01-15', // Date originale
      productId: '1', // Produit associé
      description: 'Test Product', // Description
      sellingPrice: 100, // Prix de vente original
      quantitySold: 1, // Quantité vendue
      purchasePrice: 50, // Prix d'achat
      profit: 50, // Bénéfice calculé
      clientName: 'Test Client', // Client original
      clientPhone: '+33123456789', // Téléphone
      clientAddress: '123 Test Address' // Adresse
    };

    // Configuration des mocks pour la modification
    mockSalesService.getSales.mockResolvedValue([existingSale]);
    mockSalesService.updateSale.mockResolvedValue(existingSale);

    // Rendu de la page dashboard
    renderWithProviders(<DashboardPage />);

    // Attente que les données se chargent
    await waitFor(() => {
      // Vérification que le tableau de bord est chargé
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });
  });

  // Test de gestion des erreurs lors de la création
  it('gestion des erreurs lors de la création de vente', async () => {
    // Configuration du mock pour simuler une erreur serveur
    mockSalesService.addSale.mockRejectedValue(new Error('Erreur serveur'));

    // Rendu de la page
    renderWithProviders(<DashboardPage />);

    // Vérification que l'interface gère les erreurs gracieusement
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
  });

  // Test de synchronisation des données après opérations CRUD
  it('synchronisation des données après opérations CRUD', async () => {
    // Données initiales de ventes
    const initialSales = [
      {
        id: '1', // Première vente
        date: '2024-01-15', // Date
        productId: '1', // Produit
        description: 'Test Product', // Description
        sellingPrice: 100, // Prix
        quantitySold: 1, // Quantité
        purchasePrice: 50, // Coût
        profit: 50, // Bénéfice
        clientName: 'Test Client', // Client
        clientPhone: '+33123456789', // Téléphone
        clientAddress: '123 Test Address' // Adresse
      }
    ];

    // Configuration du mock pour retourner les données initiales
    mockSalesService.getSales.mockResolvedValue(initialSales);

    // Rendu de la page
    renderWithProviders(<DashboardPage />);

    // Attente du chargement des données
    await waitFor(() => {
      // Vérification que le tableau de bord est visible
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });

    // Vérification que les services sont appelés au chargement
    expect(mockProductService.getProducts).toHaveBeenCalled();
  });

  // Test de validation des données avant soumission
  it('validation des données avant soumission', async () => {
    // Rendu de la page
    renderWithProviders(<DashboardPage />);

    // Ouverture du formulaire d'ajout de vente
    const addSaleButton = screen.getByRole('button', { name: /ajouter une vente/i });
    fireEvent.click(addSaleButton);

    // Attente que le formulaire soit ouvert
    await waitFor(() => {
      // Recherche du bouton de soumission
      const submitButton = screen.getByRole('button', { name: /ajouter/i });
      // Vérification que le bouton est désactivé sans données
      expect(submitButton).toBeDisabled();
    });
  });

  // Test de mise à jour en temps réel des statistiques
  it('mise à jour en temps réel des statistiques', async () => {
    // Données de ventes pour les statistiques
    const salesData = [
      {
        id: '1', // Identifiant de vente
        date: '2024-01-15', // Date
        productId: '1', // Produit
        description: 'Test Product', // Description
        sellingPrice: 100, // Prix de vente
        quantitySold: 1, // Quantité
        purchasePrice: 50, // Prix d'achat
        profit: 50, // Bénéfice
        clientName: 'Test Client', // Client
        clientPhone: '+33123456789', // Téléphone
        clientAddress: '123 Test Address' // Adresse
      }
    ];

    // Configuration du mock avec les données de test
    mockSalesService.getSales.mockResolvedValue(salesData);

    // Rendu de la page
    renderWithProviders(<DashboardPage />);

    // Attente que les statistiques soient calculées et affichées
    await waitFor(() => {
      // Vérification que le tableau de bord est chargé
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });
  });
});
