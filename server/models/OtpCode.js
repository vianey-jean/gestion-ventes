/**
 * =============================================================================
 * OtpCode.js — Modèle de gestion des codes de vérification à 6 chiffres
 * =============================================================================
 *
 * Utilisé pour la double authentification (2FA) sur :
 *   - la connexion (purpose = 'login')
 *   - l'inscription (purpose = 'register')
 *   - le changement de mot de passe connecté (purpose = 'change_password')
 *   - la réinitialisation de mot de passe oublié (purpose = 'reset_password')
 *
 * Sécurité :
 *   - Le code n'est JAMAIS stocké en clair (hashé avec bcrypt, comme les mots de passe).
 *   - Expiration courte (OTP_TTL_MINUTES, 10 min par défaut).
 *   - Nombre de tentatives limité (OTP_MAX_ATTEMPTS, 5 par défaut) avant invalidation.
 *   - Usage unique : un code consommé ne peut pas être réutilisé.
 *   - Cooldown de renvoi pour éviter le spam (OTP_RESEND_COOLDOWN_SECONDS).
 *   - Persisté dans server/db/otp_codes.json, chiffré automatiquement comme
 *     tous les fichiers de server/db/ (voir middleware/patchDbIO.js).
 *
 * @module models/OtpCode
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { readJsonDecrypted, writeJsonEncrypted } = require('../middleware/encryption');

const otpPath = path.join(__dirname, '../db/otp_codes.json');

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES, 10) || 10;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 45;
const OTP_MAX_PER_HOUR = parseInt(process.env.OTP_MAX_PER_HOUR, 10) || 8;

/** Génère un code numérique à 6 chiffres cryptographiquement sûr */
function generateSixDigitCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

const OtpCode = {
  _getAll: () => {
    try {
      const data = readJsonDecrypted(otpPath);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur lecture otp_codes.json:', error.message);
      return [];
    }
  },

  _saveAll: (records) => {
    writeJsonEncrypted(otpPath, records);
  },

  /** Purge les enregistrements expirés depuis plus de 24h (hygiène du fichier) */
  _cleanup: (records) => {
    const now = Date.now();
    return records.filter((r) => new Date(r.expiresAt).getTime() + 24 * 60 * 60 * 1000 > now);
  },

  /**
   * Crée un nouveau challenge OTP.
   * @param {Object} params
   * @param {'login'|'register'|'change_password'|'reset_password'} params.purpose
   * @param {string|null} params.userId - id de l'utilisateur si déjà connu (login, change_password, reset_password)
   * @param {string} params.destination - email ou téléphone réel (utilisé pour l'envoi, jamais renvoyé tel quel au client)
   * @param {'email'|'sms'} params.channel
   * @returns {{ id: string, code: string, expiresAt: string }}
   */
  create: ({ purpose, userId = null, destination, channel = 'email' }) => {
    let records = OtpCode._getAll();
    records = OtpCode._cleanup(records);

    const code = generateSixDigitCode();
    const codeHash = bcrypt.hashSync(code, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    const record = {
      id: crypto.randomUUID(),
      purpose,
      userId,
      destination,
      channel,
      codeHash,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      consumed: false,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastSentAt: now.toISOString(),
      resendCount: 0,
    };

    records.push(record);
    OtpCode._saveAll(records);

    return { id: record.id, code, expiresAt: record.expiresAt };
  },

  getById: (id) => {
    const records = OtpCode._getAll();
    return records.find((r) => r.id === id) || null;
  },

  /**
   * Vérifie si on peut renvoyer un code (cooldown + quota horaire), régénère un nouveau
   * code pour le même challenge (même id) et le retourne en clair pour envoi.
   */
  resend: (id) => {
    const records = OtpCode._getAll();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, message: 'Challenge introuvable ou expiré' };

    const record = records[idx];
    if (record.consumed) return { success: false, message: 'Ce challenge a déjà été validé' };

    const secondsSinceLastSend = (Date.now() - new Date(record.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        success: false,
        message: `Veuillez patienter ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)}s avant de redemander un code`,
        retryAfter: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend),
      };
    }

    if (record.resendCount >= OTP_MAX_PER_HOUR) {
      return { success: false, message: 'Trop de renvois. Réessayez plus tard.' };
    }

    const code = generateSixDigitCode();
    record.codeHash = bcrypt.hashSync(code, 10);
    record.attempts = 0;
    record.expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
    record.lastSentAt = new Date().toISOString();
    record.resendCount += 1;

    records[idx] = record;
    OtpCode._saveAll(records);

    return { success: true, code, destination: record.destination, channel: record.channel, expiresAt: record.expiresAt };
  },

  /**
   * Vérifie le code fourni pour un challenge donné.
   * @returns {{ success: boolean, message?: string, record?: object }}
   */
  verify: ({ id, code, purpose }) => {
    const records = OtpCode._getAll();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, message: 'Code invalide ou expiré' };
    }

    const record = records[idx];

    if (purpose && record.purpose !== purpose) {
      return { success: false, message: 'Code invalide ou expiré' };
    }

    if (record.consumed) {
      return { success: false, message: 'Ce code a déjà été utilisé' };
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'Ce code a expiré, veuillez en demander un nouveau' };
    }

    if (record.attempts >= record.maxAttempts) {
      return { success: false, message: 'Nombre maximal de tentatives atteint, veuillez demander un nouveau code' };
    }

    const isValid = bcrypt.compareSync(String(code || ''), record.codeHash);

    if (!isValid) {
      record.attempts += 1;
      records[idx] = record;
      OtpCode._saveAll(records);
      const remaining = record.maxAttempts - record.attempts;
      return {
        success: false,
        message: remaining > 0 ? `Code incorrect (${remaining} tentative(s) restante(s))` : 'Code incorrect, nombre maximal de tentatives atteint',
        remainingAttempts: Math.max(remaining, 0),
      };
    }

    record.consumed = true;
    record.consumedAt = new Date().toISOString();
    records[idx] = record;
    OtpCode._saveAll(records);

    return { success: true, record };
  },

  /** Invalide manuellement un challenge */
  invalidate: (id) => {
    const records = OtpCode._getAll();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    records[idx].consumed = true;
    OtpCode._saveAll(records);
    return true;
  },

  /**
   * Marque le resetToken (issu de ce challenge) comme définitivement consommé.
   * Distinct de `consumed` (qui ne concerne que la validation du code OTP lui-même) :
   * ceci empêche qu'un même resetToken JWT, encore valide pendant sa fenêtre de
   * 10 minutes, ne puisse servir à réinitialiser le mot de passe une seconde fois.
   */
  markResetTokenUsed: (id) => {
    const records = OtpCode._getAll();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    records[idx].resetTokenUsed = true;
    OtpCode._saveAll(records);
    return true;
  },
};

module.exports = OtpCode;
