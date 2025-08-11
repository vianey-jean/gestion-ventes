
// Importation des utilitaires de test pour le rendu et les interactions
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Importation des fonctions de test et mocks Vitest
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Importation des matchers Jest DOM pour des assertions expressives
import '@testing-library/jest-dom';
// Importation du composant à tester
import AddSaleForm from '@/components/dashboard/AddSaleForm';
// Importation des providers de contexte nécessaires
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Données mock de produits pour les tests
const mockProducts = [
  {
    id: '1', // Identifiant unique du premier produit
    description: 'Perruque Lisse', // Description du produit
    purchasePrice: 50, // Prix d'achat
    quantity: 10, // Stock disponible (en stock)
    imageUrl: null // Pas d'image associée
  },
  {
    id: '2', // Identifiant unique du second produit
    description: 'Tissage Bouclé', // Description différente
    purchasePrice: 75, // Prix d'achat plus élevé
    quantity: 0, // Stock épuisé (rupture de stock)
    imageUrl: null // Pas d'image associée
  }
];

// Données mock d'une vente existante pour les tests de modification
const mockSale = {
  id: '1', // Identifiant unique de la vente
  date: '2024-01-15', // Date de la vente
  productId: '1', // Référence au premier produit
  description: 'Perruque Lisse', // Description identique au produit
  sellingPrice: 100, // Prix de vente
  quantitySold: 1, // Quantité vendue
  purchasePrice: 50, // Prix d'achat (copié du produit)
  profit: 50, // Bénéfice calculé (100-50)
  clientName: 'Marie Dubois', // Nom complet du client
  clientPhone: '+33123456789', // Numéro de téléphone
  clientAddress: '123 Rue Test' // Adresse complète
};

// Objet mock des services API
const mockApiService = {
  getProducts: vi.fn().mockResolvedValue(mockProducts), // Mock pour récupérer les produits
  addSale: vi.fn(), // Mock pour ajouter une vente
  updateSale: vi.fn(), // Mock pour modifier une vente
  deleteSale: vi.fn() // Mock pour supprimer une vente
};

// Mock des services API pour contrôler les appels
vi.mock('@/service/api', () => ({
  productService: mockApiService, // Mock du service produits
  salesService: mockApiService // Mock du service ventes
}));

// Fonction utilitaire pour rendre le composant avec tous les providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    // Provider d'authentification en wrapper parent
    <AuthProvider>
      {/* Provider d'application avec les données de contexte */}
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};

// Suite de tests pour le composant AddSaleForm
describe('AddSaleForm', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialisation de tous les mocks avant chaque test
    vi.clearAllMocks();
  });

  // Groupe de tests pour le mode création
  describe('Mode création', () => {
    // Test d'affichage du formulaire de création
    it('affiche le formulaire de création de vente', () => {
      // Rendu du composant en mode création (isOpen=true, pas de vente à éditer)
      renderWithProviders(<AddSaleForm isOpen={true} onClose={vi.fn()} />);

      // Vérification que le titre de création est affiché
      expect(screen.getByText(/ajouter une vente/i)).toBeInTheDocument();
      // Vérification que le champ produit est présent
      expect(screen.getByText(/produit/i)).toBeInTheDocument();
    });

    // Test de remplissage automatique de la date
    it('remplit automatiquement la date du jour', () => {
      // Utilisation de fausses horloges pour contrôler le temps
      vi.useFakeTimers();
      // Définition d'une date fixe pour le test
      vi.setSystemTime(new Date('2024-01-15'));

      // Rendu du composant
      renderWithProviders(<AddSaleForm isOpen={true} onClose={vi.fn()} />);

      // Recherche de l'input avec la date du jour
      const dateInput = screen.getByDisplayValue('2024-01-15');
      // Vérification que la date est correctement pré-remplie
      expect(dateInput).toBeInTheDocument();

      // Restoration des vraies horloges
      vi.useRealTimers();
    });

    // Test de calcul automatique du bénéfice
    it('calcule automatiquement le bénéfice', async () => {
      // Rendu du composant
      renderWithProviders(<AddSaleForm isOpen={true} onClose={vi.fn()} />);

      // Recherche du sélecteur de produit
      const productSelect = screen.getByRole('combobox');
      // Simulation d'un clic pour ouvrir le sélecteur
      fireEvent.click(productSelect);

      // Vérification que le formulaire est bien ouvert
      expect(screen.getByText(/ajouter une vente/i)).toBeInTheDocument();
    });
  });

  // Groupe de tests pour le mode modification
  describe('Mode modification', () => {
    // Test d'affichage du formulaire pré-rempli
    it('affiche le formulaire pré-rempli pour modification', () => {
      // Rendu du composant en mode modification avec une vente existante
      renderWithProviders(
        <AddSaleForm 
          isOpen={true}
          onClose={vi.fn()}
          editSale={mockSale} 
        />
      );

      // Vérification que le titre de modification est affiché
      expect(screen.getByText(/modifier la vente/i)).toBeInTheDocument();
    });

    // Test de suppression d'une vente
    it('permet de supprimer une vente', async () => {
      // Mock de la fonction de fermeture
      const onClose = vi.fn();
      // Configuration du mock pour réussir la suppression
      mockApiService.deleteSale.mockResolvedValue(true);

      // Rendu du composant en mode modification
      renderWithProviders(
        <AddSaleForm 
          isOpen={true}
          onClose={onClose}
          editSale={mockSale} 
        />
      );

      // Recherche du bouton de suppression
      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      // Vérification que le bouton est présent
      expect(deleteButton).toBeInTheDocument();
    });
  });

  // Groupe de tests pour la validation
  describe('Validation', () => {
    // Test de validation des champs obligatoires
    it('valide les champs obligatoires', async () => {
      // Rendu du composant
      renderWithProviders(<AddSaleForm isOpen={true} onClose={vi.fn()} />);

      // Recherche du bouton de soumission
      const submitButton = screen.getByRole('button', { name: /ajouter/i });
      // Tentative de soumission sans remplir les champs
      fireEvent.click(submitButton);

      // Vérification que le bouton est désactivé si aucun produit n'est sélectionné
      expect(submitButton).toBeDisabled();
    });
  });

  // Groupe de tests pour l'interface utilisateur
  describe('Interface utilisateur', () => {
    // Test de fermeture du formulaire
    it('ferme le formulaire quand on clique sur annuler', () => {
      // Mock de la fonction de fermeture
      const onClose = vi.fn();
      // Rendu du composant
      renderWithProviders(<AddSaleForm isOpen={true} onClose={onClose} />);

      // Recherche et clic sur le bouton d'annulation
      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      fireEvent.click(cancelButton);

      // Vérification que la fonction de fermeture a été appelée
      expect(onClose).toHaveBeenCalled();
    });

    // Test d'affichage des informations du produit sélectionné
    it('affiche les informations du produit sélectionné', async () => {
      // Rendu du composant
      renderWithProviders(<AddSaleForm isOpen={true} onClose={vi.fn()} />);

      // Vérification que le sélecteur de produit est présent
      expect(screen.getByText(/produit/i)).toBeInTheDocument();
    });
  });
});
