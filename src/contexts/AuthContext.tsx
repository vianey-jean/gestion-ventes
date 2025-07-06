
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, RegistrationData, User } from '../types';
import { authService } from '../service/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem('token');
    
    setUser(currentUser);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);
      
      if (result && result.user) {
        setUser(result.user);
        setToken(result.token);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
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
    setToken(null);
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
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
      };
      
      const result = await authService.register(registerData);
      
      if (result && result.user) {
        setUser(result.user);
        setToken(result.token);
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
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
      const result = await authService.checkEmail(email);
      return result.exists;
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
      const result = await authService.resetPassword(data.email);
      
      if (result.success) {
        toast({
          title: "Réinitialisation réussie",
          description: "Votre mot de passe a été réinitialisé avec succès",
          className: "notification-success",
        });
        return true;
      } else {
        toast({
          title: "Échec de la réinitialisation",
          description: "Le nouveau mot de passe doit être différent de l'ancien",
          variant: "destructive",
        });
        return false;
      }
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
    token,
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
