/**
 * =============================================================================
 * otpDispatcher.js — Point d'entrée unique pour créer + envoyer un code OTP
 * =============================================================================
 *
 * Centralise la logique commune aux 4 flux (login, register, change_password,
 * reset_password) : choix du canal, création de l'enregistrement OTP,
 * envoi effectif, masquage de la destination pour la réponse API.
 *
 * @module services/otpDispatcher
 */

const OtpCode = require('../models/OtpCode');
const mailService = require('./mailService');
const smsService = require('./smsService');

const SENDERS = {
  login: { email: mailService.sendLoginOtp, sms: (to, code) => smsService.sendOtpSms(to, code, 'connexion') },
  register: { email: mailService.sendRegistrationOtp, sms: (to, code) => smsService.sendOtpSms(to, code, 'inscription') },
  change_password: { email: mailService.sendChangePasswordOtp, sms: (to, code) => smsService.sendOtpSms(to, code, 'changement de mot de passe') },
  reset_password: { email: mailService.sendPasswordResetOtp, sms: (to, code) => smsService.sendOtpSms(to, code, 'réinitialisation') },
};

/** Masque un email : j***@domain.com */
function maskEmail(email) {
  const [local, domain] = String(email).split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

/** Masque un téléphone : garde les 2 derniers chiffres */
function maskPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 2) return '**';
  return `${'*'.repeat(digits.length - 2)}${digits.slice(-2)}`;
}

/**
 * Choisit le canal effectif : 'sms' seulement si demandé, qu'un téléphone est
 * fourni et que le service SMS est réellement configuré ; sinon repli sur 'email'.
 */
function resolveChannel({ requestedChannel, email, phone }) {
  if (requestedChannel === 'sms' && phone && smsService.isConfigured()) {
    return 'sms';
  }
  return 'email';
}

/**
 * Crée un challenge OTP et l'envoie immédiatement.
 * @returns {Promise<{ challengeId: string, method: 'email'|'sms', maskedDestination: string, expiresAt: string }>}
 */
async function createAndSend({ purpose, userId = null, email, phone = null, requestedChannel = 'email' }) {
  const channel = resolveChannel({ requestedChannel, email, phone });
  const destination = channel === 'sms' ? phone : email;

  const { id, code, expiresAt } = OtpCode.create({ purpose, userId, destination, channel });

  const sender = SENDERS[purpose]?.[channel];
  if (!sender) throw new Error('Configuration OTP invalide');

  await sender(destination, code);

  return {
    challengeId: id,
    method: channel,
    maskedDestination: channel === 'sms' ? maskPhone(destination) : maskEmail(destination),
    expiresAt,
  };
}

/** Renvoie un nouveau code pour un challenge existant */
async function resend({ challengeId, purpose }) {
  const existing = OtpCode.getById(challengeId);
  if (!existing || existing.purpose !== purpose) {
    return { success: false, message: 'Challenge introuvable ou expiré' };
  }

  const result = OtpCode.resend(challengeId);
  if (!result.success) return result;

  const sender = SENDERS[purpose]?.[result.channel];
  if (!sender) return { success: false, message: 'Configuration OTP invalide' };

  await sender(result.destination, result.code);

  return {
    success: true,
    method: result.channel,
    maskedDestination: result.channel === 'sms' ? maskPhone(result.destination) : maskEmail(result.destination),
    expiresAt: result.expiresAt,
  };
}

module.exports = { createAndSend, resend, maskEmail, maskPhone };
