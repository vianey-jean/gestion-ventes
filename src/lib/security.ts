/**
 * Utilitaires de sécurité pour le frontend
 */

/**
 * Nettoie une chaîne de caractères pour éviter les injections XSS
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .trim();
};

/**
 * Encode une URL de manière sécurisée
 */
export const safeEncodeURI = (input: string): string => {
  if (typeof input !== 'string') return '';
  return encodeURIComponent(input.trim());
};

/**
 * Vérifie si une URL est sûre (pas de javascript:, data:, etc.)
 */
export const isSafeUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:'
  ];
  
  return !dangerousProtocols.some(protocol => trimmedUrl.startsWith(protocol));
};

/**
 * Génère un ID unique sécurisé
 */
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Masque partiellement une donnée sensible
 */
export const maskSensitiveData = (data: string, visibleChars = 4): string => {
  if (typeof data !== 'string' || data.length <= visibleChars) return '****';
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
};

/**
 * Masque un email partiellement
 */
export const maskEmail = (email: string): string => {
  if (typeof email !== 'string' || !email.includes('@')) return '****@****.***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local.slice(-1)
    : '**';
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Vérifie la force d'un mot de passe
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  label: 'faible' | 'moyen' | 'fort' | 'très fort';
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score++;
  else suggestions.push('Au moins 8 caractères');

  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Ajouter des minuscules');

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Ajouter des majuscules');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Ajouter des chiffres');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Ajouter des caractères spéciaux');

  const labels: Record<number, 'faible' | 'moyen' | 'fort' | 'très fort'> = {
    0: 'faible',
    1: 'faible',
    2: 'faible',
    3: 'moyen',
    4: 'fort',
    5: 'très fort',
    6: 'très fort'
  };

  return {
    score,
    label: labels[Math.min(score, 6)],
    suggestions
  };
};

/**
 * Rate limiter côté client
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Nettoyer les anciennes tentatives
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Instance globale du rate limiter
 */
export const globalRateLimiter = new RateLimiter(10, 60000);
