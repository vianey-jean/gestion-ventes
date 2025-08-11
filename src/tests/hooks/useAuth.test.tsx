
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  resetPasswordRequest: vi.fn(),
  resetPassword: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
  setCurrentUser: vi.fn(),
  checkEmail: vi.fn()
};

vi.mock('@/service/api', () => ({
  authService: mockAuthService
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('État initial', () => {
    it('initialise avec un utilisateur non authentifié', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('restaure l\'utilisateur depuis localStorage', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Connexion', () => {
    it('connecte un utilisateur avec des identifiants valides', async () => {
      const mockResponse = {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });

        expect(success).toBe(true);
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('échoue avec des identifiants invalides', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Identifiants invalides'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'wrong-password'
        });

        expect(success).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Inscription', () => {
    it('inscrit un nouvel utilisateur avec succès', async () => {
      const mockResponse = {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Smith'
        }
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'female',
          address: '123 Rue Test',
          phone: '+33123456789',
          acceptTerms: true
        });

        expect(success).toBe(true);
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('échoue si l\'email existe déjà', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email déjà utilisé'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'female',
          address: '123 Rue Test',
          phone: '+33123456789',
          acceptTerms: true
        });

        expect(success).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Déconnexion', () => {
    it('déconnecte l\'utilisateur et nettoie les données', async () => {
      // Mock window.location.href correctly
      const originalLocation = window.location;
      const mockLocation = {
        ...originalLocation,
        href: ''
      };
      
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Vérifier que l'utilisateur est connecté
      expect(result.current.isAuthenticated).toBe(true);

      // Déconnecter
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(null);
      
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      });
    });
  });

  describe('Réinitialisation de mot de passe', () => {
    it('envoie une demande de réinitialisation', async () => {
      mockAuthService.resetPasswordRequest.mockResolvedValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.resetPasswordRequest({ email: 'test@example.com' });
        expect(success).toBe(true);
      });

      expect(mockAuthService.resetPasswordRequest).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('réinitialise le mot de passe avec succès', async () => {
      mockAuthService.resetPassword.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.resetPassword({
          email: 'test@example.com',
          newPassword: 'new-password',
          confirmPassword: 'new-password'
        });
        expect(success).toBe(true);
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Vérification email', () => {
    it('vérifie si un email existe', async () => {
      mockAuthService.checkEmail.mockResolvedValue({ exists: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const exists = await result.current.checkEmail('test@example.com');
        expect(exists).toBe(true);
      });

      expect(mockAuthService.checkEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
