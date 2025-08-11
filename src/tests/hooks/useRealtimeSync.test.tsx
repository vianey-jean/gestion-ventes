
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';

// Mock de realtimeService
const mockRealtimeService = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  addDataListener: vi.fn(),
  addForceListener: vi.fn(),
  getConnectionStatus: vi.fn()
};

vi.mock('@/service/realtime', () => ({
  realtimeService: mockRealtimeService
}));

// Mock de useApp
const mockRefreshData = vi.fn();
const mockUseApp = vi.fn(() => ({
  refreshData: mockRefreshData
}));

vi.mock('@/contexts/AppContext', () => ({
  useApp: mockUseApp
}));

// Mock de document.visibilityState
Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible'
});

describe('useRealtimeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn().mockReturnValue('mock-token');
    
    // Mock des listeners
    mockRealtimeService.addDataListener.mockReturnValue(vi.fn());
    mockRealtimeService.addForceListener.mockReturnValue(vi.fn());
    mockRealtimeService.getConnectionStatus.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initialise la connexion temps réel au montage', () => {
    renderHook(() => useRealtimeSync());

    expect(mockRealtimeService.connect).toHaveBeenCalledWith('mock-token');
    expect(mockRealtimeService.addDataListener).toHaveBeenCalled();
    expect(mockRealtimeService.addForceListener).toHaveBeenCalled();
  });

  it('synchronise les données périodiquement quand l\'onglet est actif', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible'
    });

    renderHook(() => useRealtimeSync());

    // Avancer le timer de 5 secondes
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('ne synchronise pas quand l\'onglet est inactif', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden'
    });

    renderHook(() => useRealtimeSync());

    // Avancer le timer
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockRefreshData).not.toHaveBeenCalled();
  });

  it('gère les changements de visibilité de l\'onglet', () => {
    const { unmount } = renderHook(() => useRealtimeSync());

    // Simuler un changement de visibilité
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Vérifier que l'événement est écouté
    expect(document.addEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    unmount();

    // Vérifier le nettoyage
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  it('debounce les appels de synchronisation', () => {
    renderHook(() => useRealtimeSync());

    // Simuler plusieurs appels rapides
    act(() => {
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
    });

    // Vérifier que refreshData n'est appelé qu'une fois après le debounce
    expect(mockRefreshData).toHaveBeenCalledTimes(1);
  });

  it('gère les données reçues en temps réel', () => {
    let dataListener: (data: any) => void;
    
    mockRealtimeService.addDataListener.mockImplementation((callback) => {
      dataListener = callback;
      return vi.fn();
    });

    renderHook(() => useRealtimeSync());

    // Simuler la réception de données
    const mockData = {
      products: [{ id: '1', name: 'Product 1' }],
      sales: [{ id: '1', amount: 100 }]
    };

    act(() => {
      dataListener!(mockData);
    });

    // Vérifier que refreshData est appelé
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('gère les événements de synchronisation forcée', () => {
    let forceListener: () => void;
    
    mockRealtimeService.addForceListener.mockImplementation((callback) => {
      forceListener = callback;
      return vi.fn();
    });

    renderHook(() => useRealtimeSync());

    // Simuler une synchronisation forcée
    act(() => {
      forceListener!();
    });

    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('vérifie périodiquement le statut de connexion', () => {
    renderHook(() => useRealtimeSync());

    // Simuler une déconnexion
    mockRealtimeService.getConnectionStatus.mockReturnValue(false);

    // Avancer le timer de vérification (30 secondes)
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Vérifier la tentative de reconnexion
    expect(mockRealtimeService.connect).toHaveBeenCalledTimes(2); // Initial + reconnection
  });

  it('nettoie les ressources au démontage', () => {
    const unsubscribeData = vi.fn();
    const unsubscribeForce = vi.fn();

    mockRealtimeService.addDataListener.mockReturnValue(unsubscribeData);
    mockRealtimeService.addForceListener.mockReturnValue(unsubscribeForce);

    const { unmount } = renderHook(() => useRealtimeSync());

    unmount();

    expect(unsubscribeData).toHaveBeenCalled();
    expect(unsubscribeForce).toHaveBeenCalled();
  });

  it('gère les erreurs de connexion gracieusement', () => {
    mockRealtimeService.connect.mockImplementation(() => {
      throw new Error('Connection failed');
    });

    // Ne devrait pas lever d'erreur
    expect(() => {
      renderHook(() => useRealtimeSync());
    }).not.toThrow();
  });

  it('utilise l\'intervalle personnalisé quand fourni', () => {
    const customInterval = 10000; // 10 secondes

    renderHook(() => useRealtimeSync({ interval: customInterval }));

    // Vérifier que l'intervalle personnalisé est utilisé
    act(() => {
      vi.advanceTimersByTime(customInterval);
    });

    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('peut être désactivé avec l\'option enabled', () => {
    renderHook(() => useRealtimeSync({ enabled: false }));

    expect(mockRealtimeService.connect).not.toHaveBeenCalled();
    expect(mockRealtimeService.addDataListener).not.toHaveBeenCalled();
  });

  it('gère les changements de token', () => {
    Storage.prototype.getItem = vi.fn().mockReturnValue('old-token');

    const { rerender } = renderHook(() => useRealtimeSync());

    expect(mockRealtimeService.connect).toHaveBeenCalledWith('old-token');

    // Changer le token
    Storage.prototype.getItem = vi.fn().mockReturnValue('new-token');

    rerender();

    // La reconnexion devrait utiliser le nouveau token
    act(() => {
      vi.advanceTimersByTime(30000); // Déclencher la vérification de connexion
    });

    expect(mockRealtimeService.connect).toHaveBeenCalledWith('new-token');
  });

  it('limite la fréquence des appels de synchronisation', () => {
    renderHook(() => useRealtimeSync());

    // Simuler de nombreux événements rapides
    act(() => {
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(500);
      }
    });

    // Vérifier que le debouncing limite les appels
    expect(mockRefreshData).toHaveBeenCalledTimes(1);
  });
});
