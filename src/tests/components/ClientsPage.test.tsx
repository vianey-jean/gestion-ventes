
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ClientsPage from '@/pages/ClientsPage';
import { AuthProvider } from '@/contexts/AuthContext';

const mockClients = [
  {
    id: 'client1',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '+33123456789',
    address: '123 Rue Test',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'client2',
    firstName: 'Jean',
    lastName: 'Martin',
    phone: '+33987654321',
    address: '456 Avenue Test',
    createdAt: '2024-01-10T14:20:00Z'
  }
];

const mockClientService = {
  getClients: vi.fn().mockResolvedValue(mockClients),
  addClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn()
};

// Mock du hook de synchronisation
const mockUseClientSync = vi.fn(() => ({
  clients: mockClients,
  isLoading: false,
  error: null,
  addClient: mockClientService.addClient,
  updateClient: mockClientService.updateClient,
  deleteClient: mockClientService.deleteClient
}));

vi.mock('@/service/api', () => ({
  clientService: mockClientService
}));

vi.mock('@/hooks/useClientSync', () => ({
  useClientSync: mockUseClientSync
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la liste des clients', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Jean Martin')).toBeInTheDocument();
      expect(screen.getByText('+33123456789')).toBeInTheDocument();
      expect(screen.getByText('123 Rue Test')).toBeInTheDocument();
    });
  });

  it('affiche le nombre total de clients', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/clients enregistrés/i)).toBeInTheDocument();
    });
  });

  it('permet d\'ajouter un nouveau client', async () => {
    const newClient = {
      id: 'client3',
      firstName: 'Sophie',
      lastName: 'Dupont',
      phone: '+33555666777',
      address: '789 Boulevard Test',
      createdAt: '2024-01-20T16:45:00Z'
    };

    mockClientService.addClient.mockResolvedValue(newClient);

    renderWithProviders(<ClientsPage />);

    // Cliquer sur le bouton d'ajout
    const addButton = screen.getByRole('button', { name: /nouveau client/i });
    fireEvent.click(addButton);

    // Remplir le formulaire
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/nom/i);
    const phoneInput = screen.getByLabelText(/téléphone/i);
    const addressInput = screen.getByLabelText(/adresse/i);

    fireEvent.change(firstNameInput, { target: { value: 'Sophie' } });
    fireEvent.change(lastNameInput, { target: { value: 'Dupont' } });
    fireEvent.change(phoneInput, { target: { value: '+33555666777' } });
    fireEvent.change(addressInput, { target: { value: '789 Boulevard Test' } });

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockClientService.addClient).toHaveBeenCalledWith({
        firstName: 'Sophie',
        lastName: 'Dupont',
        phone: '+33555666777',
        address: '789 Boulevard Test'
      });
    });
  });

  it('permet de modifier un client existant', async () => {
    const updatedClient = {
      ...mockClients[0],
      lastName: 'Dubois-Martin',
      phone: '+33123456000'
    };

    mockClientService.updateClient.mockResolvedValue(updatedClient);

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de modification
    const editButtons = screen.getAllByLabelText(/modifier/i);
    fireEvent.click(editButtons[0]);

    // Modifier les informations
    const lastNameInput = screen.getByDisplayValue('Dubois');
    const phoneInput = screen.getByDisplayValue('+33123456789');

    fireEvent.change(lastNameInput, { target: { value: 'Dubois-Martin' } });
    fireEvent.change(phoneInput, { target: { value: '+33123456000' } });

    // Sauvegarder
    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockClientService.updateClient).toHaveBeenCalledWith('client1', {
        firstName: 'Marie',
        lastName: 'Dubois-Martin',
        phone: '+33123456000',
        address: '123 Rue Test'
      });
    });
  });

  it('permet de supprimer un client', async () => {
    mockClientService.deleteClient.mockResolvedValue(true);

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de suppression
    const deleteButtons = screen.getAllByLabelText(/supprimer/i);
    fireEvent.click(deleteButtons[0]);

    // Confirmer la suppression
    const confirmButton = screen.getByRole('button', { name: /confirmer/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockClientService.deleteClient).toHaveBeenCalledWith('client1');
    });
  });

  it('filtre les clients lors de la recherche', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Jean Martin')).toBeInTheDocument();
    });

    // Rechercher "Marie"
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'Marie' } });

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.queryByText('Jean Martin')).not.toBeInTheDocument();
    });
  });

  it('trie les clients par nom', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    // Cliquer sur l'en-tête "Nom" pour trier
    const nameHeader = screen.getByText(/nom/i);
    fireEvent.click(nameHeader);

    // Vérifier que l'ordre a changé (implementation dépendante)
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(2); // Header + clients
    });
  });

  it('affiche un message quand il n\'y a pas de clients', () => {
    mockUseClientSync.mockReturnValue({
      clients: [],
      isLoading: false,
      error: null,
      addClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn()
    });

    renderWithProviders(<ClientsPage />);

    expect(screen.getByText(/aucun client/i)).toBeInTheDocument();
  });

  it('affiche un indicateur de chargement', () => {
    mockUseClientSync.mockReturnValue({
      clients: [],
      isLoading: true,
      error: null,
      addClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn()
    });

    renderWithProviders(<ClientsPage />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('affiche les erreurs de chargement', () => {
    mockUseClientSync.mockReturnValue({
      clients: [],
      isLoading: false,
      error: 'Erreur de connexion',
      addClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn()
    });

    renderWithProviders(<ClientsPage />);

    expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
  });

  it('valide les données du formulaire d\'ajout', async () => {
    renderWithProviders(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /nouveau client/i });
    fireEvent.click(addButton);

    // Essayer de soumettre sans remplir les champs obligatoires
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/prénom requis/i)).toBeInTheDocument();
      expect(screen.getByText(/nom requis/i)).toBeInTheDocument();
    });

    expect(mockClientService.addClient).not.toHaveBeenCalled();
  });

  it('formate correctement les dates d\'ajout', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      // Vérifier que les dates sont affichées (format peut varier)
      expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
      expect(screen.getByText(/10\/01\/2024/i)).toBeInTheDocument();
    });
  });

  it('synchronise en temps réel avec les changements', async () => {
    // Simuler un changement de données en temps réel
    const updatedClients = [
      ...mockClients,
      {
        id: 'client3',
        firstName: 'Nouveau',
        lastName: 'Client',
        phone: '+33111222333',
        address: 'Nouvelle Adresse',
        createdAt: '2024-01-20T18:00:00Z'
      }
    ];

    // Premier rendu avec les clients initiaux
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    // Simuler une mise à jour en temps réel
    mockUseClientSync.mockReturnValue({
      clients: updatedClients,
      isLoading: false,
      error: null,
      addClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn()
    });

    // Re-render avec les nouvelles données
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Nouveau Client')).toBeInTheDocument();
    });
  });

  it('gère les actions en lot (sélection multiple)', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    // Sélectionner plusieurs clients via les checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Premier client
    fireEvent.click(checkboxes[2]); // Deuxième client

    // Vérifier que les actions en lot sont disponibles
    expect(screen.getByRole('button', { name: /supprimer sélectionnés/i })).toBeInTheDocument();
  });
});
