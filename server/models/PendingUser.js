/**
 * =============================================================================
 * PendingUser.js — Inscriptions en attente de validation
 * =============================================================================
 *
 * Quand un visiteur s'inscrit, on NE crée PAS tout de suite un compte dans
 * users.json : on stocke ses informations ici, on lui envoie un code à 6
 * chiffres par email, et ce n'est qu'après validation du code (voir OtpCode)
 * ET définition du mot de passe (register/complete) que le vrai compte est créé.
 *
 * @module models/PendingUser
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readJsonDecrypted, writeJsonEncrypted } = require('../middleware/encryption');

const pendingPath = path.join(__dirname, '../db/pending_users.json');
const PENDING_TTL_HOURS = parseInt(process.env.PENDING_REGISTRATION_TTL_HOURS, 10) || 24;

const PendingUser = {
  _getAll: () => {
    try {
      const data = readJsonDecrypted(pendingPath);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur lecture pending_users.json:', error.message);
      return [];
    }
  },

  _saveAll: (records) => {
    writeJsonEncrypted(pendingPath, records);
  },

  _cleanup: (records) => {
    const now = Date.now();
    return records.filter((r) => new Date(r.createdAt).getTime() + PENDING_TTL_HOURS * 60 * 60 * 1000 > now);
  },

  getByEmail: (email) => {
    const records = PendingUser._getAll();
    return records.find((r) => r.email.toLowerCase() === String(email).toLowerCase()) || null;
  },

  getById: (id) => {
    const records = PendingUser._getAll();
    return records.find((r) => r.id === id) || null;
  },

  /** Crée ou remplace une inscription en attente pour cet email */
  createOrReplace: (data) => {
    let records = PendingUser._getAll();
    records = PendingUser._cleanup(records);
    records = records.filter((r) => r.email.toLowerCase() !== data.email.toLowerCase());

    const record = {
      id: crypto.randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      address: data.address,
      phone: data.phone,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    records.push(record);
    PendingUser._saveAll(records);
    return record;
  },

  markVerified: (id) => {
    const records = PendingUser._getAll();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    records[idx].emailVerified = true;
    records[idx].verifiedAt = new Date().toISOString();
    PendingUser._saveAll(records);
    return records[idx];
  },

  remove: (id) => {
    let records = PendingUser._getAll();
    const before = records.length;
    records = records.filter((r) => r.id !== id);
    PendingUser._saveAll(records);
    return records.length < before;
  },
};

module.exports = PendingUser;
