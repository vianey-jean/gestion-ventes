// Service API pour l'authentification (connexion, inscription, mot de passe oublié, etc.)
import api from './api';
import { AxiosResponse } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
  channel?: 'email' | 'sms';
}

export interface LoginChallengeResponse {
  requires2FA?: boolean;
  challengeId?: string;
  method?: 'email' | 'sms';
  maskedDestination?: string;
  expiresAt?: string;
  token?: string;
  user?: any;
}

export interface OtpVerificationData {
  challengeId: string;
  code: string;
}

export interface CompleteRegistrationData {
  setupToken: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  challengeId: string;
  code: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApiService = {
  // ============================================================
  // CONNEXION — étape 1: identifiants -> étape 2: code OTP
  // ============================================================
  async login(credentials: LoginCredentials): Promise<LoginChallengeResponse> {
    const response: AxiosResponse<LoginChallengeResponse> = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async verifyLoginOtp(data: OtpVerificationData): Promise<any> {
    const response = await api.post('/api/auth/login/verify-otp', data);
    const result = response.data;
    if (result?.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  async resendLoginOtp(challengeId: string): Promise<any> {
    const response = await api.post('/api/auth/login/resend-otp', { challengeId });
    return response.data;
  },

  // ============================================================
  // INSCRIPTION — étape 1: infos (sans mdp) -> étape 2: code OTP -> étape 3: mdp
  // ============================================================
  async register(credentials: any): Promise<any> {
    const { password, confirmPassword, ...profileData } = credentials || {};
    const response = await api.post('/api/auth/register', profileData);
    return response.data;
  },

  async verifyRegisterOtp(data: OtpVerificationData): Promise<any> {
    const response = await api.post('/api/auth/register/verify-otp', data);
    return response.data;
  },

  async resendRegisterOtp(challengeId: string): Promise<any> {
    const response = await api.post('/api/auth/register/resend-otp', { challengeId });
    return response.data;
  },

  async completeRegistration(data: CompleteRegistrationData): Promise<any> {
    const response = await api.post('/api/auth/register/complete', data);
    return response.data;
  },

  async checkEmail(email: string): Promise<any> {
    const response = await api.post('/api/auth/check-email', { email });
    return response.data;
  },

  // ============================================================
  // MOT DE PASSE OUBLIÉ — demande -> code OTP -> nouveau mot de passe
  // ============================================================
  async resetPasswordRequest(data: { email: string; channel?: 'email' | 'sms' }): Promise<any> {
    try {
      const response = await api.post('/api/auth/forgot-password', data);
      return response.data;
    } catch {
      return { exists: false };
    }
  },

  async verifyForgotPasswordOtp(data: OtpVerificationData): Promise<any> {
    const response = await api.post('/api/auth/forgot-password/verify-otp', data);
    return response.data;
  },

  async resendForgotPasswordOtp(challengeId: string): Promise<any> {
    const response = await api.post('/api/auth/forgot-password/resend-otp', { challengeId });
    return response.data;
  },

  async resetPassword(data: ResetPasswordData): Promise<any> {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  },

  // ============================================================
  // CHANGEMENT DE MOT DE PASSE (utilisateur connecté)
  // ============================================================
  async requestChangePasswordOtp(channel?: 'email' | 'sms'): Promise<any> {
    const response = await api.post('/api/auth/change-password/request', { channel });
    return response.data;
  },

  async resendChangePasswordOtp(challengeId: string): Promise<any> {
    const response = await api.post('/api/auth/change-password/resend-otp', { challengeId });
    return response.data;
  },

  async verifyChangePassword(data: ChangePasswordData): Promise<any> {
    const response = await api.post('/api/auth/change-password/verify', data);
    return response.data;
  },

  async verifyToken(): Promise<any> {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },

  async healthCheck(): Promise<any> {
    const response = await api.get('/api/auth/health');
    return response.data;
  },

  getCurrentUser(): any | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: any | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
};

export default authApiService;
