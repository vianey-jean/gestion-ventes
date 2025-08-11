
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import Inventaire from '@/components/dashboard/Inventaire';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock du service API
const mockProducts = [
  {
    id: '1',
    description: 'Perruque Lisse 20 pouces',
    purchasePrice: 50,
    quantity: 10,
    imageUrl: null
  },
  {
    id: '2',
    description: 'Tissage Bouclé 18 pouces',
    purchasePrice: 75,
    quantity: 5,
    imageUrl: '/images/product2.jpg'
  }
];

const mockApiService = {
  getProducts: vi.fn().mockResolvedValue(mockProducts),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn()
};

vi.mock('@/service/api', () => ({
  productService: mockApiService
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};

describe('Inventaire', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la liste des produits', async () => {
    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText('Perruque Lisse 20 pouces')).toBeInTheDocument();
      expect(screen.getByText('Tissage Bouclé 18 pouces')).toBeInTheDocument();
    });

    expect(screen.getByText('50 €')).toBeInTheDocument();
    expect(screen.getByText('75 €')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('permet d\'ajouter un nouveau produit', async () => {
    const newProduct = {
      id: '3',
      description: 'Nouveau Produit',
      purchasePrice: 60,
      quantity: 8,
      imageUrl: null
    };

    mockApiService.addProduct.mockResolvedValue(newProduct);

    renderWithProviders(<Inventaire />);

    // Cliquer sur le bouton d'ajout
    const addButton = screen.getByRole('button', { name: /ajouter produit/i });
    fireEvent.click(addButton);

    // Remplir le formulaire
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/prix d'achat/i);
    const quantityInput = screen.getByLabelText(/quantité/i);

    fireEvent.change(descriptionInput, { target: { value: 'Nouveau Produit' } });
    fireEvent.change(priceInput, { target: { value: '60' } });
    fireEvent.change(quantityInput, { target: { value: '8' } });

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.addProduct).toHaveBeenCalledWith({
        description: 'Nouveau Produit',
        purchasePrice: 60,
        quantity: 8
      });
    });
  });

  it('permet de modifier un produit existant', async () => {
    const updatedProduct = {
      ...mockProducts[0],
      description: 'Perruque Modifiée',
      purchasePrice: 55
    };

    mockApiService.updateProduct.mockResolvedValue(updatedProduct);

    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText('Perruque Lisse 20 pouces')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de modification
    const editButtons = screen.getAllByLabelText(/modifier/i);
    fireEvent.click(editButtons[0]);

    // Modifier les valeurs
    const descriptionInput = screen.getByDisplayValue('Perruque Lisse 20 pouces');
    const priceInput = screen.getByDisplayValue('50');

    fireEvent.change(descriptionInput, { target: { value: 'Perruque Modifiée' } });
    fireEvent.change(priceInput, { target: { value: '55' } });

    // Sauvegarder
    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApiService.updateProduct).toHaveBeenCalledWith({
        ...mockProducts[0],
        description: 'Perruque Modifiée',
        purchasePrice: 55
      });
    });
  });

  it('permet de supprimer un produit', async () => {
    mockApiService.deleteProduct.mockResolvedValue(true);

    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText('Perruque Lisse 20 pouces')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de suppression
    const deleteButtons = screen.getAllByLabelText(/supprimer/i);
    fireEvent.click(deleteButtons[0]);

    // Confirmer la suppression
    const confirmButton = screen.getByRole('button', { name: /confirmer/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockApiService.deleteProduct).toHaveBeenCalledWith('1');
    });
  });

  it('filtre les produits lors de la recherche', async () => {
    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText('Perruque Lisse 20 pouces')).toBeInTheDocument();
      expect(screen.getByText('Tissage Bouclé 18 pouces')).toBeInTheDocument();
    });

    // Rechercher "Perruque"
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'Perruque' } });

    await waitFor(() => {
      expect(screen.getByText('Perruque Lisse 20 pouces')).toBeInTheDocument();
      expect(screen.queryByText('Tissage Bouclé 18 pouces')).not.toBeInTheDocument();
    });
  });

  it('affiche un message quand il n\'y a pas de produits', () => {
    mockApiService.getProducts.mockResolvedValue([]);

    renderWithProviders(<Inventaire />);

    expect(screen.getByText(/aucun produit/i)).toBeInTheDocument();
  });

  it('gère les erreurs de chargement', async () => {
    mockApiService.getProducts.mockRejectedValue(new Error('Erreur de chargement'));

    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
    });
  });

  it('valide les données du formulaire', async () => {
    renderWithProviders(<Inventaire />);

    const addButton = screen.getByRole('button', { name: /ajouter produit/i });
    fireEvent.click(addButton);

    // Essayer de soumettre avec des données invalides
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description requise/i)).toBeInTheDocument();
      expect(screen.getByText(/prix requis/i)).toBeInTheDocument();
    });

    expect(mockApiService.addProduct).not.toHaveBeenCalled();
  });

  it('affiche le statut de stock faible', async () => {
    const productsWithLowStock = [
      {
        id: '1',
        description: 'Produit Stock Faible',
        purchasePrice: 50,
        quantity: 2, // Stock faible
        imageUrl: null
      }
    ];

    mockApiService.getProducts.mockResolvedValue(productsWithLowStock);

    renderWithProviders(<Inventaire />);

    await waitFor(() => {
      expect(screen.getByText(/stock faible/i)).toBeInTheDocument();
    });
  });
});
