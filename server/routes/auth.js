/**
 * =============================================================================
 * routes/auth.js — Authentification avec double authentification (2FA)
 * =============================================================================
 *
 * Flux :
 *  - Connexion          : POST /login -> POST /login/verify-otp
 *  - Inscription        : POST /register -> POST /register/verify-otp -> POST /register/complete
 *  - Mot de passe oublié: POST /forgot-password -> POST /forgot-password/verify-otp -> POST /reset-password
 *  - Changt mdp (connecté): POST /change-password/request -> POST /change-password/verify
 *
 * Chaque étape OTP envoie un code à 6 chiffres par email (ou SMS si demandé
 * et configuré) via services/otpDispatcher.js. Les codes sont hashés,
 * expirent après un délai court et sont à usage unique (voir models/OtpCode.js).
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const OtpCode = require('../models/OtpCode');
const otpDispatcher = require('../services/otpDispatcher');
const mailService = require('../services/mailService');
const authMiddleware = require('../middleware/auth');
const { rateLimitMiddleware, validateRequest } = require('../middleware/security');
const validationSchemas = require('../middleware/validation');
const { getJwtSecret } = require('../config/jwtSecret');

// Rate limiting strict pour tout /api/auth
router.use(rateLimitMiddleware('auth'));
// Rate limiting encore plus strict spécifiquement sur les endpoints OTP (anti brute-force sur le code)
const otpLimiter = rateLimitMiddleware('strict');

const JWT_EXPIRES_IN = '8h';
const SETUP_TOKEN_EXPIRES_IN = '15m';
const RESET_TOKEN_EXPIRES_IN = '10m';

/** Valide la robustesse d'un mot de passe (règle commune à tout le projet) */
function validatePasswordStrength(password) {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = typeof password === 'string' && password.length >= 8;

  if (!hasMinLength || !hasLower || !hasUpper || !hasNum || !hasSpecial) {
    return {
      valid: false,
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
    };
  }
  return { valid: true };
}

function issueSessionToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

// ============================================================================
// STATUT / VÉRIFICATION DE SESSION (inchangé)
// ============================================================================

router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });

    const decoded = jwt.verify(token, getJwtSecret());
    const user = User.getById(decoded.id);
    if (!user) return res.status(401).json({ valid: false, message: 'User account not found in database' });
    if (!user.email || !user.firstName || !user.lastName) {
      return res.status(401).json({ valid: false, message: 'User profile incomplete in database' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ valid: true, user: userWithoutPassword, verified: true, verifiedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), serverTime: new Date().toISOString() });
});

// ============================================================================
// CONNEXION — étape 1 : identifiants, étape 2 : code OTP
// ============================================================================

router.post('/login', validateRequest(validationSchemas.login), async (req, res) => {
  try {
    const { email, password, channel } = req.body;
    const user = User.getByEmail(email);

    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
    if (!user.id || !user.email || !user.firstName || !user.lastName) {
      return res.status(401).json({ message: 'Profil utilisateur incomplet dans la base de données' });
    }

    const maxAttempts = user.nombreConnexion || 5;
    const lockoutMinutes = user.tempsBlocage || 15;
    const failedAttempts = user.failedAttempts || 0;
    const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;

    if (lockedUntil && new Date() < lockedUntil) {
      const remainingMs = lockedUntil.getTime() - Date.now();
      return res.status(423).json({
        message: 'Compte temporairement bloqué',
        locked: true,
        lockedUntil: lockedUntil.toISOString(),
        remainingSeconds: Math.ceil(remainingMs / 1000),
        maxAttempts,
        failedAttempts: maxAttempts,
      });
    }

    if (lockedUntil && new Date() >= lockedUntil) {
      User.update(user.id, { failedAttempts: 0, lockedUntil: null });
    }

    if (!User.comparePassword(password, user.password)) {
      const newFailedAttempts = (lockedUntil && new Date() >= lockedUntil ? 0 : failedAttempts) + 1;
      const updateData = { failedAttempts: newFailedAttempts };

      if (newFailedAttempts >= maxAttempts) {
        const lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        updateData.lockedUntil = lockUntil.toISOString();
        User.update(user.id, updateData);
        try {
          req.app.locals.logHistorique?.(req, {
            type: 'login_locked',
            userId: user.id,
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role || '',
            message: `Compte bloqué (${lockoutMinutes} min)`,
          });
        } catch {}
        return res.status(423).json({
          message: `Compte bloqué pendant ${lockoutMinutes} minutes`,
          locked: true,
          lockedUntil: lockUntil.toISOString(),
          remainingSeconds: lockoutMinutes * 60,
          maxAttempts,
          failedAttempts: newFailedAttempts,
        });
      }

      User.update(user.id, updateData);
      try {
        req.app.locals.logHistorique?.(req, {
          type: 'login_failed',
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role || '',
          message: `Mot de passe incorrect (tentative ${newFailedAttempts}/${maxAttempts})`,
        });
      } catch {}
      return res.status(401).json({
        message: 'Identifiants invalides',
        failedAttempts: newFailedAttempts,
        maxAttempts,
        remainingAttempts: maxAttempts - newFailedAttempts,
      });
    }

    // Identifiants corrects — on ne délivre PAS encore le token : envoi du code 2FA
    User.update(user.id, { failedAttempts: 0, lockedUntil: null });

    const challenge = await otpDispatcher.createAndSend({
      purpose: 'login',
      userId: user.id,
      email: user.email,
      phone: user.phone,
      requestedChannel: channel === 'sms' ? 'sms' : 'email',
    });

    try {
      req.app.locals.logHistorique?.(req, {
        type: 'login_otp_sent',
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role || '',
        message: `Code de connexion envoyé (${challenge.method})`,
      });
    } catch {}

    res.json({
      requires2FA: true,
      challengeId: challenge.challengeId,
      method: challenge.method,
      maskedDestination: challenge.maskedDestination,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

router.post('/login/verify-otp', otpLimiter, validateRequest(validationSchemas.otpVerify), (req, res) => {
  try {
    const { challengeId, code } = req.body;
    const result = OtpCode.verify({ id: challengeId, code, purpose: 'login' });

    if (!result.success) {
      return res.status(400).json({ message: result.message, remainingAttempts: result.remainingAttempts });
    }

    const user = User.getById(result.record.userId);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

    const token = issueSessionToken(user);
    const { password: _, ...userWithoutPassword } = user;

    let Fidelite;
    try {
      Fidelite = require('../models/Fidelite');
      if (Fidelite && typeof Fidelite.rebuild === 'function') Fidelite.rebuild();
    } catch (_) {}

    try {
      req.app.locals.logHistorique?.(req, {
        type: 'login_success',
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role || 'utilisateur',
        message: 'Connexion réussie (2FA validée)',
      });
    } catch {}

    res.json({ user: userWithoutPassword, token, verified: true, loginTime: new Date().toISOString() });
  } catch (error) {
    console.error('Login OTP verify error:', error.message);
    res.status(500).json({ message: 'Erreur lors de la vérification du code' });
  }
});

router.post('/login/resend-otp', otpLimiter, validateRequest(validationSchemas.otpResend), async (req, res) => {
  try {
    const result = await otpDispatcher.resend({ challengeId: req.body.challengeId, purpose: 'login' });
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error('Login OTP resend error:', error.message);
    res.status(500).json({ success: false, message: "Erreur lors du renvoi du code" });
  }
});

// ============================================================================
// VÉRIFICATION D'EMAIL (inchangé)
// ============================================================================

router.post('/check-email', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = User.getByEmail(email);
    if (user) {
      const maxAttempts = user.nombreConnexion || 5;
      const failedAttempts = user.failedAttempts || 0;
      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;
      let locked = false;
      let remainingSeconds = 0;
      let currentFailedAttempts = failedAttempts;

      if (lockedUntil && new Date() < lockedUntil) {
        locked = true;
        remainingSeconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        currentFailedAttempts = maxAttempts;
      } else if (lockedUntil && new Date() >= lockedUntil) {
        User.update(user.id, { failedAttempts: 0, lockedUntil: null });
        currentFailedAttempts = 0;
      }

      res.json({
        exists: true,
        user: { firstName: user.firstName, lastName: user.lastName },
        maxAttempts,
        failedAttempts: currentFailedAttempts,
        locked,
        lockedUntil: locked ? lockedUntil.toISOString() : null,
        remainingSeconds,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Internal server error during email check' });
  }
});

// ============================================================================
// INSCRIPTION EN 3 ÉTAPES
//   1) /register            -> saisie des infos (SANS mot de passe) + envoi OTP
//   2) /register/verify-otp -> validation du code -> setupToken temporaire
//   3) /register/complete   -> création du mot de passe -> compte créé
// ============================================================================

router.post('/register', validateRequest(validationSchemas.registerStart), async (req, res) => {
  try {
    const { email, firstName, lastName, gender, address, phone, acceptTerms, channel } = req.body;

    if (!acceptTerms) return res.status(400).json({ message: 'Vous devez accepter les conditions' });

    const existingUser = User.getByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

    const pending = PendingUser.createOrReplace({ email, firstName, lastName, gender, address, phone });

    const challenge = await otpDispatcher.createAndSend({
      purpose: 'register',
      userId: pending.id,
      email,
      phone,
      requestedChannel: channel === 'sms' ? 'sms' : 'email',
    });

    res.status(200).json({
      pendingRegistration: true,
      challengeId: challenge.challengeId,
      method: challenge.method,
      maskedDestination: challenge.maskedDestination,
      expiresAt: challenge.expiresAt,
      message: 'Un code de confirmation vous a été envoyé pour valider votre inscription',
    });
  } catch (error) {
    console.error('Register start error:', error.message);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

router.post('/register/verify-otp', otpLimiter, validateRequest(validationSchemas.otpVerify), (req, res) => {
  try {
    const { challengeId, code } = req.body;
    const result = OtpCode.verify({ id: challengeId, code, purpose: 'register' });

    if (!result.success) {
      return res.status(400).json({ message: result.message, remainingAttempts: result.remainingAttempts });
    }

    const pending = PendingUser.getById(result.record.userId);
    if (!pending) return res.status(400).json({ message: 'Inscription introuvable ou expirée, veuillez recommencer' });

    PendingUser.markVerified(pending.id);

    // Token temporaire (15 min) permettant uniquement de définir le mot de passe
    const setupToken = jwt.sign(
      { pendingId: pending.id, email: pending.email, purpose: 'register_setup' },
      getJwtSecret(),
      { expiresIn: SETUP_TOKEN_EXPIRES_IN }
    );

    res.json({ verified: true, setupToken, email: pending.email });
  } catch (error) {
    console.error('Register OTP verify error:', error.message);
    res.status(500).json({ message: 'Erreur lors de la vérification du code' });
  }
});

router.post('/register/resend-otp', otpLimiter, validateRequest(validationSchemas.otpResend), async (req, res) => {
  try {
    const result = await otpDispatcher.resend({ challengeId: req.body.challengeId, purpose: 'register' });
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error('Register OTP resend error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors du renvoi du code' });
  }
});

router.post('/register/complete', validateRequest(validationSchemas.registerComplete), (req, res) => {
  try {
    const { setupToken, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) return res.status(400).json({ message: strength.message });

    let decoded;
    try {
      decoded = jwt.verify(setupToken, getJwtSecret());
    } catch (e) {
      return res.status(401).json({ message: 'Session d\'inscription expirée, veuillez recommencer' });
    }

    if (decoded.purpose !== 'register_setup') {
      return res.status(401).json({ message: 'Jeton invalide' });
    }

    const pending = PendingUser.getById(decoded.pendingId);
    if (!pending || !pending.emailVerified) {
      return res.status(400).json({ message: 'Email non vérifié, veuillez recommencer l\'inscription' });
    }

    const existingUser = User.getByEmail(pending.email);
    if (existingUser) {
      PendingUser.remove(pending.id);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const newUser = User.create({
      email: pending.email,
      password,
      firstName: pending.firstName,
      lastName: pending.lastName,
      gender: pending.gender,
      address: pending.address,
      phone: pending.phone,
    });

    if (!newUser) return res.status(500).json({ message: 'Erreur lors de la création du compte' });

    PendingUser.remove(pending.id);

    const token = issueSessionToken(newUser);

    res.status(201).json({ user: newUser, token, verified: true, registeredAt: new Date().toISOString() });
  } catch (error) {
    console.error('Register complete error:', error.message);
    res.status(500).json({ message: "Erreur lors de la création du compte" });
  }
});

// ============================================================================
// MOT DE PASSE OUBLIÉ — étape 1 : demande, étape 2 : OTP, étape 3 : nouveau mdp
// ============================================================================

router.post('/forgot-password', validateRequest(validationSchemas.forgotPassword), async (req, res) => {
  try {
    const { email, channel } = req.body;
    const user = User.getByEmail(email);

    // On ne révèle jamais explicitement l'inexistence du compte dans ce message,
    // pour limiter l'énumération d'emails, mais on garde `exists` pour compatibilité
    // avec l'UX existante qui l'affichait déjà côté frontend.
    if (!user) {
      return res.status(200).json({ exists: false, message: 'Si ce compte existe, un code a été envoyé' });
    }

    const challenge = await otpDispatcher.createAndSend({
      purpose: 'reset_password',
      userId: user.id,
      email: user.email,
      phone: user.phone,
      requestedChannel: channel === 'sms' ? 'sms' : 'email',
    });

    res.json({
      exists: true,
      challengeId: challenge.challengeId,
      method: challenge.method,
      maskedDestination: challenge.maskedDestination,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ exists: false, message: 'Internal server error during password reset request' });
  }
});

router.post('/forgot-password/verify-otp', otpLimiter, validateRequest(validationSchemas.otpVerify), (req, res) => {
  try {
    const { challengeId, code } = req.body;
    const result = OtpCode.verify({ id: challengeId, code, purpose: 'reset_password' });

    if (!result.success) {
      return res.status(400).json({ message: result.message, remainingAttempts: result.remainingAttempts });
    }

    const resetToken = jwt.sign(
      { userId: result.record.userId, purpose: 'password_reset', challengeId: result.record.id },
      getJwtSecret(),
      { expiresIn: RESET_TOKEN_EXPIRES_IN }
    );

    res.json({ verified: true, resetToken });
  } catch (error) {
    console.error('Forgot password OTP verify error:', error.message);
    res.status(500).json({ message: 'Erreur lors de la vérification du code' });
  }
});

router.post('/forgot-password/resend-otp', otpLimiter, validateRequest(validationSchemas.otpResend), async (req, res) => {
  try {
    const result = await otpDispatcher.resend({ challengeId: req.body.challengeId, purpose: 'reset_password' });
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error('Forgot password OTP resend error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors du renvoi du code' });
  }
});

router.post('/reset-password', validateRequest(validationSchemas.resetPasswordWithToken), (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) return res.status(400).json({ success: false, message: strength.message });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, getJwtSecret());
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Session de réinitialisation expirée, veuillez recommencer' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ success: false, message: 'Jeton invalide' });
    }

    // Le code OTP a déjà été consommé lors de verify-otp ; on vérifie ici, en plus,
    // que ce resetToken précis n'a pas déjà servi à changer le mot de passe — cela
    // empêche un rejeu du JWT resetToken tant qu'il reste valide (fenêtre de 10 min).
    const challenge = OtpCode.getById(decoded.challengeId);
    if (!challenge || challenge.resetTokenUsed) {
      return res.status(401).json({ success: false, message: 'Ce lien de réinitialisation a déjà été utilisé' });
    }

    const user = User.getById(decoded.userId);
    if (!user) return res.status(400).json({ success: false, message: 'Utilisateur non trouvé' });

    const success = User.updatePassword(user.email, newPassword);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit être différent de l\'ancien' });
    }

    // Marque ce resetToken comme définitivement consommé (anti-rejeu)
    OtpCode.markResetTokenUsed(challenge.id);

    mailService.sendPasswordChangedNotice(user.email).catch(() => {});

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// ============================================================================
// CHANGEMENT DE MOT DE PASSE (utilisateur déjà connecté)
// ============================================================================

router.post('/change-password/request', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const channel = req.body?.channel === 'sms' ? 'sms' : 'email';

    const challenge = await otpDispatcher.createAndSend({
      purpose: 'change_password',
      userId: user.id,
      email: user.email,
      phone: user.phone,
      requestedChannel: channel,
    });

    res.json({
      challengeId: challenge.challengeId,
      method: challenge.method,
      maskedDestination: challenge.maskedDestination,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    console.error('Change password request error:', error.message);
    res.status(500).json({ message: "Erreur lors de l'envoi du code" });
  }
});

router.post(
  '/change-password/verify',
  authMiddleware,
  otpLimiter,
  validateRequest(validationSchemas.changePasswordVerify),
  (req, res) => {
    try {
      const { challengeId, code, currentPassword, newPassword, confirmPassword } = req.body;
      const user = req.user;

      if (!User.comparePassword(currentPassword, user.password)) {
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
      }

      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) return res.status(400).json({ message: strength.message });

      const result = OtpCode.verify({ id: challengeId, code, purpose: 'change_password' });
      if (!result.success) {
        return res.status(400).json({ message: result.message, remainingAttempts: result.remainingAttempts });
      }

      if (result.record.userId !== user.id) {
        return res.status(403).json({ message: 'Ce code ne correspond pas à votre compte' });
      }

      const success = User.updatePassword(user.email, newPassword);
      if (!success) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'ancien' });
      }

      mailService.sendPasswordChangedNotice(user.email).catch(() => {});

      res.json({ success: true, message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      console.error('Change password verify error:', error.message);
      res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
    }
  }
);

router.post(
  '/change-password/resend-otp',
  authMiddleware,
  otpLimiter,
  validateRequest(validationSchemas.otpResend),
  async (req, res) => {
    try {
      const result = await otpDispatcher.resend({ challengeId: req.body.challengeId, purpose: 'change_password' });
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      console.error('Change password OTP resend error:', error.message);
      res.status(500).json({ success: false, message: 'Erreur lors du renvoi du code' });
    }
  }
);

module.exports = router;
