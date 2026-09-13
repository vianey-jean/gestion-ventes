/**
 * AuthContext.tsx - Contexte d'authentification
 *
 * Gère l'état de connexion, le token JWT, le profil utilisateur, ainsi que
 * les flux de double authentification (2FA) par code à 6 chiffres pour :
 *   - la connexion (login -> verifyLoginOtp)
 *   - l'inscription (register -> verifyRegisterOtp -> completeRegistration)
 *   - le mot de passe oublié (resetPasswordRequest -> verifyResetOtp -> resetPassword)
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  LoginCredentials,
  PasswordResetRequest,
  RegistrationData,
  User,
  OtpChallenge,
} from '../types';
import { authService } from '../service/api';
import { useToast } from '@/hooks/use-toast';
import { realtimeService } from '@/services/realtimeService';
import connecteProfilUniqueApi from '@/services/api/connecteProfilUniqueApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  isVerified: boolean;

  // ---- Connexion (2FA) ----
  loginChallenge: OtpChallenge | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Permet à une page qui appelle elle-même POST /api/auth/login (pour un traitement
   *  d'erreur avancé, ex: compteur de tentatives) d'enregistrer le challenge OTP reçu
   *  sans déclencher un second appel réseau. */
  hydrateLoginChallenge: (challenge: OtpChallenge, password: string) => void;
  verifyLoginOtp: (code: string) => Promise<boolean>;
  resendLoginOtp: () => Promise<{ success: boolean; message?: string }>;
  cancelLoginChallenge: () => void;

  logout: () => void;

  // ---- Inscription (2FA) ----
  registerChallenge: OtpChallenge | null;
  registerEmail: string | null;
  register: (data: RegistrationData) => Promise<boolean>;
  verifyRegisterOtp: (code: string) => Promise<boolean>;
  resendRegisterOtp: () => Promise<{ success: boolean; message?: string }>;
  completeRegistration: (password: string, confirmPassword: string) => Promise<boolean>;
  cancelRegisterChallenge: () => void;

  checkEmail: (email: string) => Promise<boolean>;

  // ---- Mot de passe oublié (2FA) ----
  resetChallenge: OtpChallenge | null;
  resetPasswordRequest: (data: PasswordResetRequest) => Promise<boolean>;
  verifyResetOtp: (code: string) => Promise<boolean>;
  resendResetOtp: () => Promise<{ success: boolean; message?: string }>;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<boolean>;
  cancelResetChallenge: () => void;

  verifySession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  // 2FA — challenges en cours
  const [loginChallenge, setLoginChallenge] = useState<OtpChallenge | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{ password: string } | null>(null);

  const [registerChallenge, setRegisterChallenge] = useState<OtpChallenge | null>(null);
  const [registerEmail, setRegisterEmail] = useState<string | null>(null);
  const [registerSetupToken, setRegisterSetupToken] = useState<string | null>(null);
  // Référence synchrone : l'état React n'est pas encore à jour dans le même
  // gestionnaire d'événement (vérification du code -> création du compte).
  const registerSetupTokenRef = useRef<string | null>(null);

  const [resetChallenge, setResetChallenge] = useState<OtpChallenge | null>(null);
  const [resetTokenValue, setResetTokenValue] = useState<string | null>(null);
  const resetTokenRef = useRef<string | null>(null);

  // CRITICAL: Verify session against database
  const verifySession = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsVerified(false);
      return false;
    }

    try {
      const response = await authService.verifyToken();

      if (response && response.user) {
        setUser(response.user);
        setToken(storedToken);
        setIsVerified(true);
        localStorage.setItem('user', JSON.stringify(response.user));
        const fullName = `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim();
        if (fullName) {
          localStorage.setItem('user_name', fullName);
        }
        return true;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsVerified(false);
        return false;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsVerified(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const verified = await verifySession();

        if (!verified) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [verifySession, toast]);

  const logout = useCallback(() => {
    try {
      const sessionId = connecteProfilUniqueApi.getSessionId();
      if (sessionId) {
        connecteProfilUniqueApi.logout(sessionId, 'deconnexion_manuelle').catch(() => {});
        connecteProfilUniqueApi.setSessionId(null);
      }
    } catch {}

    try {
      realtimeService.disconnect();
    } catch {}

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_name');
    sessionStorage.removeItem('_abk');

    setUser(null);
    setToken(null);
    setIsVerified(false);
    authService.setCurrentUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      className: "bg-red-800 text-white border-red-800",
    });
  }, [toast]);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout]);

  // ==========================================================================
  // CONNEXION — étape 1 : identifiants -> étape 2 : code OTP
  // ==========================================================================

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);

      if (result?.requires2FA && result?.challengeId) {
        setLoginChallenge({
          challengeId: result.challengeId,
          method: result.method,
          maskedDestination: result.maskedDestination,
          expiresAt: result.expiresAt,
        });
        setPendingCredentials({ password: credentials.password });
        toast({
          title: 'Code envoyé',
          description: `Un code de vérification a été envoyé (${result.method === 'sms' ? 'SMS' : 'email'}) à ${result.maskedDestination}`,
        });
        return true;
      }

      toast({
        title: "Échec de la connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Une erreur s'est produite lors de la connexion";
      toast({ title: "Erreur", description: message, variant: "destructive", className: "notification-erreur" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginOtp = async (code: string): Promise<boolean> => {
    if (!loginChallenge) return false;
    try {
      setIsLoading(true);
      const result = await authService.verifyLoginOtp({ challengeId: loginChallenge.challengeId, code });

      if (result && result.user && result.token) {
        if (pendingCredentials?.password) {
          sessionStorage.setItem('_abk', btoa(pendingCredentials.password));
        }
        if (!result.user.id || !result.user.email || !result.user.firstName || !result.user.lastName) {
          toast({ title: "Erreur de profil", description: "Profil utilisateur incomplet dans la base de données", variant: "destructive" });
          return false;
        }

        const fullName = `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim();
        if (fullName) localStorage.setItem('user_name', fullName);

        setUser(result.user);
        setToken(result.token);
        setIsVerified(true);
        setLoginChallenge(null);
        setPendingCredentials(null);

        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
          className: "bg-green-600 text-white border-green-600",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Code invalide';
      toast({ title: "Erreur", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendLoginOtp = async () => {
    if (!loginChallenge) return { success: false, message: 'Aucune demande en cours' };
    try {
      const result = await authService.resendLoginOtp(loginChallenge.challengeId);
      if (result.success !== false) {
        toast({ title: 'Code renvoyé', description: 'Un nouveau code vous a été envoyé' });
      }
      return result;
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || 'Erreur lors du renvoi du code' };
    }
  };

  const cancelLoginChallenge = () => {
    setLoginChallenge(null);
    setPendingCredentials(null);
  };

  const hydrateLoginChallenge = (challenge: OtpChallenge, password: string) => {
    setLoginChallenge(challenge);
    setPendingCredentials({ password });
  };

  // ==========================================================================
  // INSCRIPTION — étape 1 : infos (sans mdp) -> étape 2 : OTP -> étape 3 : mdp
  // ==========================================================================

  const register = async (data: RegistrationData): Promise<boolean> => {
    try {
      setIsLoading(true);

      const registerData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        acceptTerms: data.acceptTerms,
      };

      const result = await authService.register(registerData);

      if (result?.pendingRegistration && result?.challengeId) {
        setRegisterChallenge({
          challengeId: result.challengeId,
          method: result.method,
          maskedDestination: result.maskedDestination,
          expiresAt: result.expiresAt,
        });
        setRegisterEmail(data.email);
        toast({
          title: 'Code envoyé',
          description: `Un code de confirmation a été envoyé à ${result.maskedDestination}`,
        });
        return true;
      }

      toast({ title: "Échec de l'inscription", description: "Impossible de démarrer l'inscription", variant: "destructive" });
      return false;
    } catch (error: any) {
      const apiData = error?.response?.data;
      const apiDetails = Array.isArray(apiData?.details) ? apiData.details.join(' • ') : null;
      const message = apiData?.message || apiDetails || "Une erreur s'est produite lors de l'inscription";
      toast({ title: "Erreur", description: message, variant: "destructive", className: "notification-erreur" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegisterOtp = async (code: string): Promise<boolean> => {
    if (!registerChallenge) return false;
    try {
      setIsLoading(true);
      const result = await authService.verifyRegisterOtp({ challengeId: registerChallenge.challengeId, code });

      if (result?.verified && result?.setupToken) {
        registerSetupTokenRef.current = result.setupToken;
        setRegisterSetupToken(result.setupToken);
        setRegisterChallenge(null);
        toast({
          title: 'Email confirmé',
          description: 'Vous pouvez maintenant créer votre mot de passe',
          className: "bg-green-600 text-white border-green-600",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Code invalide';
      toast({ title: "Erreur", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendRegisterOtp = async () => {
    if (!registerChallenge) return { success: false, message: 'Aucune demande en cours' };
    try {
      const result = await authService.resendRegisterOtp(registerChallenge.challengeId);
      if (result.success !== false) {
        toast({ title: 'Code renvoyé', description: 'Un nouveau code vous a été envoyé' });
      }
      return result;
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || 'Erreur lors du renvoi du code' };
    }
  };

  const completeRegistration = async (password: string, confirmPassword: string): Promise<boolean> => {
    const setupToken = registerSetupTokenRef.current || registerSetupToken;
    if (!setupToken) return false;
    try {
      setIsLoading(true);
      const result = await authService.completeRegistration({ setupToken, password, confirmPassword });

      if (result && result.user) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsVerified(false);
        registerSetupTokenRef.current = null;
        setRegisterSetupToken(null);
        setRegisterEmail(null);

        toast({
          title: '✅ Compte créé',
          description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          className: "bg-green-600 text-white border-green-600",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Une erreur s'est produite lors de la création du compte";
      toast({ title: "Erreur", description: message, variant: "destructive", className: "notification-erreur" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRegisterChallenge = () => {
    setRegisterChallenge(null);
    setRegisterEmail(null);
    setRegisterSetupToken(null);
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.checkEmail(email);
      return result.exists;
    } catch {
      return false;
    }
  };

  // ==========================================================================
  // MOT DE PASSE OUBLIÉ — demande -> OTP -> nouveau mot de passe
  // ==========================================================================

  const resetPasswordRequest = async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.resetPasswordRequest(data);

      if (!result.exists || !result.challengeId) {
        toast({
          title: "Échec de la réinitialisation",
          description: "Cet email n'existe pas dans notre système",
          variant: "destructive",
        });
        return false;
      }

      setResetChallenge({
        challengeId: result.challengeId,
        method: result.method,
        maskedDestination: result.maskedDestination,
        expiresAt: result.expiresAt,
      });

      toast({
        title: 'Code envoyé',
        description: `Un code de vérification a été envoyé à ${result.maskedDestination}`,
        className: "bg-green-600 text-white border-green-600",
      });

      return true;
    } catch (error) {
      toast({ title: "Erreur", description: "Une erreur s'est produite lors de la réinitialisation", variant: "destructive", className: "notification-erreur" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetOtp = async (code: string): Promise<boolean> => {
    if (!resetChallenge) return false;
    try {
      setIsLoading(true);
      const result = await authService.verifyForgotPasswordOtp({ challengeId: resetChallenge.challengeId, code });

      if (result?.verified && result?.resetToken) {
        resetTokenRef.current = result.resetToken;
        setResetTokenValue(result.resetToken);
        setResetChallenge(null);
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Code invalide';
      toast({ title: "Erreur", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendResetOtp = async () => {
    if (!resetChallenge) return { success: false, message: 'Aucune demande en cours' };
    try {
      const result = await authService.resendForgotPasswordOtp(resetChallenge.challengeId);
      if (result.success !== false) {
        toast({ title: 'Code renvoyé', description: 'Un nouveau code vous a été envoyé' });
      }
      return result;
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || 'Erreur lors du renvoi du code' };
    }
  };

  const resetPassword = async (newPassword: string, confirmPassword: string): Promise<boolean> => {
    const resetTok = resetTokenRef.current || resetTokenValue;
    if (!resetTok) return false;
    try {
      setIsLoading(true);
      const result = await authService.resetPassword({ resetToken: resetTok, newPassword, confirmPassword });

      if (result.success) {
        toast({
          title: "Réinitialisation réussie",
          description: "Votre mot de passe a été réinitialisé avec succès",
          className: "bg-green-600 text-white border-green-600",
        });
        resetTokenRef.current = null;
        setResetTokenValue(null);
        return true;
      } else {
        toast({
          title: "Échec de la réinitialisation",
          description: result.message || "Le nouveau mot de passe doit être différent de l'ancien",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Une erreur s'est produite lors de la réinitialisation";
      toast({ title: "Erreur", description: message, variant: "destructive", className: "notification-erreur" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelResetChallenge = () => {
    setResetChallenge(null);
    setResetTokenValue(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && isVerified,
    isLoading,
    token,
    isVerified,

    loginChallenge,
    login,
    hydrateLoginChallenge,
    verifyLoginOtp,
    resendLoginOtp,
    cancelLoginChallenge,

    logout,

    registerChallenge,
    registerEmail,
    register,
    verifyRegisterOtp,
    resendRegisterOtp,
    completeRegistration,
    cancelRegisterChallenge,

    checkEmail,

    resetChallenge,
    resetPasswordRequest,
    verifyResetOtp,
    resendResetOtp,
    resetPassword,
    cancelResetChallenge,

    verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
