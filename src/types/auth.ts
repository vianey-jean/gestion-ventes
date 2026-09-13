// Types pour l'authentification

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================
// Double authentification (2FA) — code à 6 chiffres
// ============================================================

/** Réponse renvoyée quand un challenge OTP vient d'être créé et envoyé */
export interface OtpChallenge {
  challengeId: string;
  method: 'email' | 'sms';
  maskedDestination: string;
  expiresAt: string;
}

export interface OtpVerifyPayload {
  challengeId: string;
  code: string;
}

/** État de connexion en cours d'authentification à 2 facteurs */
export interface LoginOtpState extends OtpChallenge {
  requires2FA: true;
}

/** État d'inscription en attente de validation par email */
export interface RegisterOtpState extends OtpChallenge {
  pendingRegistration: true;
}

