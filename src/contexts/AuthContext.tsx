
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, RegistrationData, User } from '../types';
import { authService } from '../service/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<boolean>;
  checkEmail: (email: string) => Promise<boolean>;
  resetPasswordRequest: (data: PasswordResetRequest) => Promise<boolean>;
  resetPassword: (data: PasswordResetData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const loggedInUser = await authService.login(credentials);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        authService.setCurrentUser(loggedInUser);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${loggedInUser.firstName} ${loggedInUser.lastName}`,
          className: "bg-green-500 text-white",
        });
        return true;
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.setCurrentUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    // Redirect to login page after logout
    window.location.href = '/login';
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = await authService.register(data);
      
      if (newUser) {
        setUser(newUser);
        authService.setCurrentUser(newUser);
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${newUser.firstName} ${newUser.lastName}`,
          className: "notification-success",
        });
        return true;
      } else {
        toast({
          title: "Échec de l'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      return await authService.checkEmail(email);
    } catch (error) {
      return false;
    }
  };

  const resetPasswordRequest = async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const exists = await authService.resetPasswordRequest(data);
      
      if (!exists) {
        toast({
          title: "Échec de la réinitialisation",
          description: "Cet email n'existe pas dans notre système",
          variant: "destructive",
        });
      }
      
      return exists;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: PasswordResetData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await authService.resetPassword(data);
      
      if (success) {
        toast({
          title: "Réinitialisation réussie",
          description: "Votre mot de passe a été réinitialisé avec succès",
          className: "notification-success",
        });
      } else {
        toast({
          title: "Échec de la réinitialisation",
          description: "Le nouveau mot de passe doit être différent de l'ancien",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    checkEmail,
    resetPasswordRequest,
    resetPassword,
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
