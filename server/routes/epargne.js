/**
 * epargne.js - Routes API pour les comptes d'épargne
 *
 * - Un fichier de base de données par propriétaire : db/compte-<NOM>.json
 * - Un index chiffré : db/comptes-epargne.json (liste des propriétaires)
 * - Toutes les données sont chiffrées via le middleware d'encryption.
 * - Accès réservé à l'administrateur principale (vérification du mot de passe).
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { readJsonDecrypted, writeJsonEncrypted } = require('../middleware/encryption');

const DB_DIR = path.join(__dirname, '..', 'db');
const INDEX_FILE = path.join(DB_DIR, 'comptes-epargne.json');

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const slugify = (str) =>
  (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase() || 'INCONNU';

function readIndex() {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      writeJsonEncrypted(INDEX_FILE, []);
      return [];
    }
    const data = readJsonDecrypted(INDEX_FILE);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('epargne readIndex:', e);
    return [];
  }
}

function writeIndex(data) {
  writeJsonEncrypted(INDEX_FILE, data);
}

function ownerFilePath(fileName) {
  return path.join(DB_DIR, fileName);
}

function readOwner(fileName) {
  try {
    const p = ownerFilePath(fileName);
    if (!fs.existsSync(p)) return null;
    const data = readJsonDecrypted(p);
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.comptes)) data.comptes = [];
    return data;
  } catch (e) {
    console.error('epargne readOwner:', e);
    return null;
  }
}

function writeOwner(fileName, data) {
  writeJsonEncrypted(ownerFilePath(fileName), data);
}

function computeSolde(compte) {
  return (compte.operations || []).reduce((acc, op) => {
    const m = Number(op.montant) || 0;
    return op.type === 'retrait' ? acc - m : acc + m;
  }, 0);
}

function serializeOwner(entry) {
  const data = readOwner(entry.fileName);
  if (!data) return { ...entry, comptes: [], soldeTotal: 0 };
  const comptes = (data.comptes || []).map((c) => ({
    ...c,
    solde: computeSolde(c),
    operationsCount: (c.operations || []).length,
  }));
  return {
    id: entry.id,
    personName: data.personName || entry.personName,
    address: data.address || entry.address || '',
    description: data.description || entry.description || '',
    fileName: entry.fileName,
    createdAt: entry.createdAt,
    comptes,
    soldeTotal: comptes.reduce((a, c) => a + c.solde, 0),
  };
}

// ---------------------------------------------------------------------------
// Sécurité : administrateur principale uniquement
// ---------------------------------------------------------------------------
const isMainAdmin = (user) =>
  !!user && String(user.role || '').toLowerCase().trim() === 'administrateur principale';

const mainAdminOnly = (req, res, next) => {
  if (!isMainAdmin(req.user)) {
    return res.status(403).json({ message: 'Accès réservé à l\'administrateur principale' });
  }
  next();
};

/** Vérifie le mot de passe de l'administrateur principale connecté */
router.post('/verify-admin', auth, (req, res) => {
  try {
    if (!isMainAdmin(req.user)) {
      return res.status(403).json({ ok: false, message: 'Accès réservé à l\'administrateur principale' });
    }
    const password = (req.body?.password || '').toString();
    if (!password) return res.status(400).json({ ok: false, message: 'Mot de passe requis' });

    const full = User.getById(req.user.id);
    if (!full || !full.password) return res.status(401).json({ ok: false, message: 'Utilisateur introuvable' });

    const ok = User.comparePassword(password, full.password);
    if (!ok) return res.status(401).json({ ok: false, message: 'Mot de passe incorrect' });

    const name = `${full.firstName || ''} ${full.lastName || ''}`.trim() || full.name || full.email;
    res.json({ ok: true, name });
  } catch (e) {
    console.error('epargne verify-admin:', e);
    res.status(500).json({ ok: false, message: 'Erreur serveur' });
  }
});

// ---------------------------------------------------------------------------
// Propriétaires / comptes
// ---------------------------------------------------------------------------

// Liste complète
router.get('/', auth, mainAdminOnly, (_req, res) => {
  try {
    res.json(readIndex().map(serializeOwner));
  } catch (e) {
    console.error('epargne list:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un propriétaire (+ son premier compte) => fichier compte-<NOM>.json
router.post('/', auth, mainAdminOnly, (req, res) => {
  try {
    const personName = (req.body?.personName || '').toString().trim();
    const accountName = (req.body?.accountName || '').toString().trim();
    const address = (req.body?.address || '').toString().trim();
    const description = (req.body?.description || '').toString().trim();

    if (!personName) return res.status(400).json({ message: 'Le nom de la personne est requis' });
    if (!accountName) return res.status(400).json({ message: 'Le nom du compte est requis' });

    const index = readIndex();
    const slug = slugify(personName);
    let existing = index.find((e) => e.slug === slug);

    if (existing) {
      const data = readOwner(existing.fileName) || {
        personName, address, description, comptes: [],
      };
      if ((data.comptes || []).some((c) => (c.accountName || '').toLowerCase() === accountName.toLowerCase())) {
        return res.status(409).json({ message: 'Ce compte existe déjà pour cette personne' });
      }
      data.personName = personName;
      if (address) data.address = address;
      if (description) data.description = description;
      data.comptes.push({
        id: genId(),
        accountName,
        description,
        createdAt: new Date().toISOString(),
        operations: [],
      });
      writeOwner(existing.fileName, data);
      return res.status(201).json(serializeOwner(existing));
    }

    const fileName = `compte-${slug}.json`;
    const entry = {
      id: genId(),
      slug,
      personName,
      address,
      description,
      fileName,
      createdAt: new Date().toISOString(),
    };
    const data = {
      personName,
      address,
      description,
      createdAt: entry.createdAt,
      comptes: [
        {
          id: genId(),
          accountName,
          description,
          createdAt: entry.createdAt,
          operations: [],
        },
      ],
    };
    writeOwner(fileName, data);
    index.push(entry);
    writeIndex(index);
    res.status(201).json(serializeOwner(entry));
  } catch (e) {
    console.error('epargne create:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier les infos d'un propriétaire
router.put('/:ownerId', auth, mainAdminOnly, (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find((e) => e.id === req.params.ownerId);
    if (!entry) return res.status(404).json({ message: 'Propriétaire non trouvé' });
    const data = readOwner(entry.fileName);
    if (!data) return res.status(404).json({ message: 'Données non trouvées' });

    const { personName, address, description } = req.body || {};
    if (personName !== undefined && String(personName).trim()) {
      data.personName = String(personName).trim();
      entry.personName = data.personName;
    }
    if (address !== undefined) { data.address = String(address); entry.address = data.address; }
    if (description !== undefined) { data.description = String(description); entry.description = data.description; }

    writeOwner(entry.fileName, data);
    writeIndex(index);
    res.json(serializeOwner(entry));
  } catch (e) {
    console.error('epargne update owner:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un propriétaire (et son fichier)
router.delete('/:ownerId', auth, mainAdminOnly, (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find((e) => e.id === req.params.ownerId);
    if (!entry) return res.status(404).json({ message: 'Propriétaire non trouvé' });
    try { fs.unlinkSync(ownerFilePath(entry.fileName)); } catch (_) {}
    writeIndex(index.filter((e) => e.id !== entry.id));
    res.json({ message: 'Propriétaire supprimé' });
  } catch (e) {
    console.error('epargne delete owner:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un compte à un propriétaire existant
router.post('/:ownerId/comptes', auth, mainAdminOnly, (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find((e) => e.id === req.params.ownerId);
    if (!entry) return res.status(404).json({ message: 'Propriétaire non trouvé' });
    const data = readOwner(entry.fileName);
    if (!data) return res.status(404).json({ message: 'Données non trouvées' });

    const accountName = (req.body?.accountName || '').toString().trim();
    const description = (req.body?.description || '').toString().trim();
    if (!accountName) return res.status(400).json({ message: 'Le nom du compte est requis' });
    if ((data.comptes || []).some((c) => (c.accountName || '').toLowerCase() === accountName.toLowerCase())) {
      return res.status(409).json({ message: 'Ce compte existe déjà pour cette personne' });
    }
    data.comptes.push({
      id: genId(),
      accountName,
      description,
      createdAt: new Date().toISOString(),
      operations: [],
    });
    writeOwner(entry.fileName, data);
    res.status(201).json(serializeOwner(entry));
  } catch (e) {
    console.error('epargne add compte:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un compte
router.put('/:ownerId/comptes/:compteId', auth, mainAdminOnly, (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find((e) => e.id === req.params.ownerId);
    if (!entry) return res.status(404).json({ message: 'Propriétaire non trouvé' });
    const data = readOwner(entry.fileName);
    const compte = (data?.comptes || []).find((c) => c.id === req.params.compteId);
    if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });

    const { accountName, description } = req.body || {};
    if (accountName !== undefined && String(accountName).trim()) compte.accountName = String(accountName).trim();
    if (description !== undefined) compte.description = String(description);
    writeOwner(entry.fileName, data);
    res.json(serializeOwner(entry));
  } catch (e) {
    console.error('epargne update compte:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un compte
router.delete('/:ownerId/comptes/:compteId', auth, mainAdminOnly, (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find((e) => e.id === req.params.ownerId);
    if (!entry) return res.status(404).json({ message: 'Propriétaire non trouvé' });
    const data = readOwner(entry.fileName);
    if (!data) return res.status(404).json({ message: 'Données non trouvées' });
    const before = (data.comptes || []).length;
    data.comptes = (data.comptes || []).filter((c) => c.id !== req.params.compteId);
    if (data.comptes.length === before) return res.status(404).json({ message: 'Compte non trouvé' });
    writeOwner(entry.fileName, data);
    res.json(serializeOwner(entry));
  } catch (e) {
    console.error('epargne delete compte:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ---------------------------------------------------------------------------
// Opérations : versement / retrait
// ---------------------------------------------------------------------------
function findCompte(ownerId, compteId) {
  const index = readIndex();
  const entry = index.find((e) => e.id === ownerId);
  if (!entry) return {};
  const data = readOwner(entry.fileName);
  const compte = (data?.comptes || []).find((c) => c.id === compteId);
  return { entry, data, compte };
}

router.post('/:ownerId/comptes/:compteId/operations', auth, mainAdminOnly, (req, res) => {
  try {
    const { entry, data, compte } = findCompte(req.params.ownerId, req.params.compteId);
    if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });

    const type = (req.body?.type || '').toString();
    const montant = parseFloat(req.body?.montant);
    if (!['versement', 'retrait'].includes(type)) {
      return res.status(400).json({ message: 'Type invalide' });
    }
    if (isNaN(montant) || montant <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }
    const op = {
      id: genId(),
      type,
      montant,
      date: (req.body?.date || new Date().toISOString().substring(0, 10)).toString(),
      description: (req.body?.description || '').toString(),
      createdAt: new Date().toISOString(),
    };
    if (!Array.isArray(compte.operations)) compte.operations = [];
    compte.operations.push(op);
    writeOwner(entry.fileName, data);
    res.status(201).json({ operation: op, owner: serializeOwner(entry) });
  } catch (e) {
    console.error('epargne add operation:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:ownerId/comptes/:compteId/operations/:opId', auth, mainAdminOnly, (req, res) => {
  try {
    const { entry, data, compte } = findCompte(req.params.ownerId, req.params.compteId);
    if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });
    const op = (compte.operations || []).find((o) => o.id === req.params.opId);
    if (!op) return res.status(404).json({ message: 'Opération non trouvée' });

    const { type, montant, date, description } = req.body || {};
    if (type !== undefined) {
      if (!['versement', 'retrait'].includes(String(type))) {
        return res.status(400).json({ message: 'Type invalide' });
      }
      op.type = String(type);
    }
    if (montant !== undefined) {
      const m = parseFloat(montant);
      if (isNaN(m) || m <= 0) return res.status(400).json({ message: 'Montant invalide' });
      op.montant = m;
    }
    if (date !== undefined) op.date = String(date);
    if (description !== undefined) op.description = String(description);
    op.updatedAt = new Date().toISOString();

    writeOwner(entry.fileName, data);
    res.json({ operation: op, owner: serializeOwner(entry) });
  } catch (e) {
    console.error('epargne update operation:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/:ownerId/comptes/:compteId/operations/:opId', auth, mainAdminOnly, (req, res) => {
  try {
    const { entry, data, compte } = findCompte(req.params.ownerId, req.params.compteId);
    if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });
    const before = (compte.operations || []).length;
    compte.operations = (compte.operations || []).filter((o) => o.id !== req.params.opId);
    if (compte.operations.length === before) {
      return res.status(404).json({ message: 'Opération non trouvée' });
    }
    writeOwner(entry.fileName, data);
    res.json({ message: 'Opération supprimée', owner: serializeOwner(entry) });
  } catch (e) {
    console.error('epargne delete operation:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
