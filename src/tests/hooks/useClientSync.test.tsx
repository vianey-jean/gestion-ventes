
// Importation des utilitaires de test pour les hooks React
import { renderHook, act, waitFor } from '@testing-library/react';
// Importation des fonctions de test et mocks Vitest
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Importation du hook à tester
import { useClientSync } from '@/hooks/useClientSync';

// Données mock de clients pour les tests
const mockClients = [
  {
    id: 'client1', // Identifiant unique du premier client
    nom: 'Marie Dubois', // Nom complet
    phone: '+33123456789', // Numéro de téléphone formaté
    adresse: '123 Rue Test', // Adresse complète
    dateCreation: '2024-01-15T10:30:00Z' // Date de création au format ISO
  },
  {
    id: 'client2', // Identifiant unique du second client
    nom: 'Jean Martin', // Nom différent
    phone: '+33987654321', // Téléphone différent
    adresse: '456 Avenue Test', // Adresse différente
    dateCreation: '2024-01-10T14:20:00Z' // Date antérieure
  }
];

// Mock du service temps réel
const mockRealtimeService = {
  connect: vi.fn(), // Mock pour la connexion
  addDataListener: vi.fn(), // Mock pour l'écoute des données
  addSyncListener: vi.fn(), // Mock pour l'écoute de synchronisation
  getConnectionStatus: vi.fn().mockReturnValue(true) // Mock du statut (connecté par défaut)
};

// Mock d'axios pour les appels HTTP
const mockAxios = {
  get: vi.fn().mockResolvedValue({ data: mockClients }) // Mock qui retourne les clients
};

// Mock du service temps réel
vi.mock('@/services/realtimeService', () => ({
  realtimeService: mockRealtimeService
}));

// Mock d'axios
vi.mock('axios', () => ({
  default: mockAxios
}));

// Mock du localStorage
Storage.prototype.getItem = vi.fn().mockReturnValue('mock-token');

// Mock de la variable d'environnement
vi.mock('import.meta.env', () => ({
  VITE_API_BASE_URL: 'http://localhost:10000' // URL de base de l'API
}));

// Suite de tests pour useClientSync
describe('useClientSync', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialisation de tous les mocks
    vi.clearAllMocks();
    // Configuration des mocks pour retourner des fonctions de nettoyage
    mockRealtimeService.addDataListener.mockReturnValue(vi.fn());
    mockRealtimeService.addSyncListener.mockReturnValue(vi.fn());
  });

  // Test de chargement initial des clients
  it('charge les clients au montage', async () => {
    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Vérification que le chargement démarre
    expect(result.current.isLoading).toBe(true);

    // Attente de la fin du chargement
    await waitFor(() => {
      // Vérification que le chargement est terminé
      expect(result.current.isLoading).toBe(false);
      // Vérification que les clients sont chargés
      expect(result.current.clients).toEqual(mockClients);
    });

    // Vérification que l'API est appelée avec les bons paramètres
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:10000/api/clients',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  // Test d'établissement de la connexion temps réel
  it('établit la connexion temps réel', () => {
    // Rendu du hook
    renderHook(() => useClientSync());

    // Vérification que la connexion est établie avec le token
    expect(mockRealtimeService.connect).toHaveBeenCalledWith('mock-token');
    // Vérification que les listeners sont ajoutés
    expect(mockRealtimeService.addDataListener).toHaveBeenCalled();
    expect(mockRealtimeService.addSyncListener).toHaveBeenCalled();
  });

  // Test de mise à jour temps réel des clients
  it('met à jour les clients lors de changements temps réel', async () => {
    // Variable pour capturer le callback de données
    let dataListener: (data: any) => void;
    
    // Configuration du mock pour capturer le callback
    mockRealtimeService.addDataListener.mockImplementation((callback) => {
      dataListener = callback;
      return vi.fn(); // Fonction de nettoyage
    });

    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente du chargement initial
    await waitFor(() => {
      expect(result.current.clients).toEqual(mockClients);
    });

    // Données mises à jour avec un nouveau client
    const updatedClients = [
      ...mockClients,
      {
        id: 'client3', // Nouveau client
        nom: 'Sophie Dupont', // Nouveau nom
        phone: '+33555666777', // Nouveau téléphone
        adresse: '789 Boulevard Test', // Nouvelle adresse
        dateCreation: '2024-01-20T16:45:00Z' // Date récente
      }
    ];

    // Simulation d'une mise à jour temps réel
    act(() => {
      dataListener!({ clients: updatedClients });
    });

    // Vérification que les clients sont mis à jour
    expect(result.current.clients).toEqual(updatedClients);
    // Vérification que le chargement est terminé
    expect(result.current.isLoading).toBe(false);
  });

  // Test de synchronisation forcée
  it('force la synchronisation lors d\'événements force-sync', async () => {
    // Variable pour capturer le callback de synchronisation
    let syncListener: (event: any) => void;
    
    // Configuration du mock pour capturer le callback
    mockRealtimeService.addSyncListener.mockImplementation((callback) => {
      syncListener = callback;
      return vi.fn(); // Fonction de nettoyage
    });

    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente du chargement initial
    await waitFor(() => {
      expect(result.current.clients).toEqual(mockClients);
    });

    // Réinitialisation du mock pour vérifier le nouvel appel
    mockAxios.get.mockClear();

    // Simulation d'un événement de synchronisation forcée
    act(() => {
      syncListener!({ type: 'force-sync' });
    });

    // Vérification qu'un nouvel appel API est effectué
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  // Test de fonction de recherche
  it('recherche les clients correctement', async () => {
    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente du chargement des clients
    await waitFor(() => {
      expect(result.current.clients).toEqual(mockClients);
    });

    // Test de recherche avec moins de 3 caractères (doit retourner vide)
    const shortQuery = result.current.searchClients('Ma');
    expect(shortQuery).toEqual([]);

    // Test de recherche avec 3 caractères ou plus
    const longQuery = result.current.searchClients('Marie');
    // Vérification qu'un client est trouvé
    expect(longQuery).toHaveLength(1);
    // Vérification que c'est le bon client
    expect(longQuery[0].nom).toBe('Marie Dubois');
  });

  // Test de gestion des erreurs de chargement
  it('gère les erreurs de chargement', async () => {
    // Mock de console.error pour capturer les erreurs
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Configuration du mock pour rejeter avec une erreur
    mockAxios.get.mockRejectedValue(new Error('Erreur réseau'));

    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente de la gestion de l'erreur
    await waitFor(() => {
      // Vérification que le chargement est terminé
      expect(result.current.isLoading).toBe(false);
      // Vérification que la liste reste vide en cas d'erreur
      expect(result.current.clients).toEqual([]);
    });

    // Vérification que l'erreur est loggée
    expect(consoleSpy).toHaveBeenCalledWith(
      '❌ Erreur lors du chargement des clients:',
      expect.any(Error)
    );

    // Restoration de console.error
    consoleSpy.mockRestore();
  });

  // Test de synchronisation forcée manuelle
  it('permet de forcer une synchronisation', async () => {
    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente du chargement initial
    await waitFor(() => {
      expect(result.current.clients).toEqual(mockClients);
    });

    // Réinitialisation du mock
    mockAxios.get.mockClear();

    // Appel de la fonction de re-fetch
    await act(async () => {
      await result.current.refetch();
    });

    // Vérification qu'un nouvel appel API est effectué
    expect(mockAxios.get).toHaveBeenCalled();
  });

  // Test de nettoyage des ressources
  it('nettoie les ressources au démontage', () => {
    // Fonctions de nettoyage mock
    const unsubscribeData = vi.fn();
    const unsubscribeSync = vi.fn();

    // Configuration des mocks pour retourner les fonctions de nettoyage
    mockRealtimeService.addDataListener.mockReturnValue(unsubscribeData);
    mockRealtimeService.addSyncListener.mockReturnValue(unsubscribeSync);

    // Rendu et démontage du hook
    const { unmount } = renderHook(() => useClientSync());
    unmount();

    // Vérification que les fonctions de nettoyage sont appelées
    expect(unsubscribeData).toHaveBeenCalled();
    expect(unsubscribeSync).toHaveBeenCalled();
  });

  // Test d'ignorance des mises à jour sans données clients
  it('ignore les mises à jour temps réel sans données clients', async () => {
    // Variable pour capturer le callback
    let dataListener: (data: any) => void;
    
    // Configuration du mock
    mockRealtimeService.addDataListener.mockImplementation((callback) => {
      dataListener = callback;
      return vi.fn();
    });

    // Rendu du hook
    const { result } = renderHook(() => useClientSync());

    // Attente du chargement initial
    await waitFor(() => {
      expect(result.current.clients).toEqual(mockClients);
    });

    // Capture de la référence initiale
    const initialClients = result.current.clients;

    // Simulation d'une mise à jour sans données clients
    act(() => {
      dataListener!({ products: [], sales: [] }); // Pas de clients
    });

    // Vérification que les clients n'ont pas changé
    expect(result.current.clients).toBe(initialClients);
  });
});
