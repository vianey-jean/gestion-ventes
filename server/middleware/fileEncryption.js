/**
 * fileEncryption — Chiffrement au repos de TOUS les fichiers de server/uploads
 * (photos de profil, photos produits, photos clients, pièces justificatives,
 * factures d'achat, PDF, etc.).
 *
 * - Quand le cryptage est activé (profil > sécurité), chaque fichier écrit dans
 *   server/uploads est stocké chiffré (AES-256-CBC, même clé dérivée que les
 *   fichiers JSON).
 * - La lecture est transparente : `fs.readFileSync` est patché pour déchiffrer
 *   les fichiers du dossier uploads, ce qui permet de les servir et de les
 *   sauvegarder sans modifier les routes existantes.
 * - `encryptAllUploads` / `decryptAllUploads` / `reEncryptAllUploads`
 *   traitent les fichiers déjà présents lors de l'activation, la désactivation
 *   ou le changement de clé.
 *
 * Format d'un fichier chiffré :
 *   [ "RZKFENC1" (8 octets) ][ IV (16 octets) ][ données chiffrées ]
 *
 * @module middleware/fileEncryption
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Writable } = require('stream');
const { getEncryptionConfig, deriveKey } = require('./encryption');

const ALGORITHM = 'aes-256-cbc';
const MAGIC = Buffer.from('RZKFENC1', 'utf8');
const HEADER_LENGTH = MAGIC.length + 16;

const uploadsRoot = path.resolve(path.join(__dirname, '../uploads'));

/** Vrai si le chemin est dans server/uploads */
function isUploadPath(filePath) {
  try {
    const resolved = path.resolve(String(filePath));
    return resolved === uploadsRoot || resolved.startsWith(uploadsRoot + path.sep);
  } catch {
    return false;
  }
}

/** Vrai si le buffer porte l'entête de chiffrement fichier */
function isEncryptedBuffer(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length > HEADER_LENGTH &&
    buffer.subarray(0, MAGIC.length).equals(MAGIC)
  );
}

/** Chiffre un buffer avec une clé (chaîne) */
function encryptBuffer(buffer, keyString) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (isEncryptedBuffer(buf)) return buf; // jamais de double chiffrement
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(keyString), iv);
  return Buffer.concat([MAGIC, iv, cipher.update(buf), cipher.final()]);
}

/** Déchiffre un buffer ; renvoie le buffer d'origine si non chiffré */
function decryptBuffer(buffer, keyString) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (!isEncryptedBuffer(buf)) return buf;
  const iv = buf.subarray(MAGIC.length, HEADER_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(keyString), iv);
  return Buffer.concat([decipher.update(buf.subarray(HEADER_LENGTH)), decipher.final()]);
}

/** Liste récursivement tous les fichiers du dossier uploads (chemins absolus) */
function listAllUploadFiles(dir = uploadsRoot) {
  const out = [];
  let items = [];
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  items.forEach((item) => {
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...listAllUploadFiles(absolute));
    else out.push(absolute);
  });
  return out;
}

// ---------------------------------------------------------------------------
// Patch fs pour un chiffrement/déchiffrement transparent des uploads
// ---------------------------------------------------------------------------
let patched = false;

function patchUploadsIO() {
  if (patched) return;
  patched = true;

  const originalReadFileSync = fs.readFileSync;
  const originalCreateWriteStream = fs.createWriteStream;
  const originalWriteFileSync = fs.writeFileSync;

  // Lecture : déchiffrement transparent
  fs.readFileSync = function patchedUploadReadFileSync(filePath, ...args) {
    const result = originalReadFileSync.call(fs, filePath, ...args);
    try {
      if (typeof filePath === 'string' && isUploadPath(filePath)) {
        const buf = Buffer.isBuffer(result) ? result : Buffer.from(String(result), 'binary');
        if (isEncryptedBuffer(buf)) {
          const config = getEncryptionConfig();
          if (config.enabled && config.key) {
            const plain = decryptBuffer(buf, config.key);
            const enc = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].encoding);
            return enc ? plain.toString(enc) : plain;
          }
        }
      }
    } catch {
      /* en cas de problème, on renvoie le contenu brut */
    }
    return result;
  };

  // Écriture synchrone (rare pour les uploads mais possible)
  fs.writeFileSync = function patchedUploadWriteFileSync(filePath, data, ...args) {
    try {
      if (typeof filePath === 'string' && isUploadPath(filePath)) {
        const config = getEncryptionConfig();
        if (config.enabled && config.key) {
          const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
          return originalWriteFileSync.call(fs, filePath, encryptBuffer(buf, config.key));
        }
      }
    } catch {
      /* écriture brute en secours */
    }
    return originalWriteFileSync.call(fs, filePath, data, ...args);
  };

  // Écriture par flux (multer diskStorage) : on chiffre avant écriture disque
  fs.createWriteStream = function patchedCreateWriteStream(filePath, options) {
    let active = false;
    try {
      if (typeof filePath === 'string' && isUploadPath(filePath)) {
        const config = getEncryptionConfig();
        active = !!(config.enabled && config.key);
      }
    } catch {
      active = false;
    }

    if (!active) return originalCreateWriteStream.call(fs, filePath, options);

    const chunks = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);
        stream.bytesWritten += buf.length;
        callback();
      },
      final(callback) {
        try {
          const config = getEncryptionConfig();
          const plain = Buffer.concat(chunks);
          const payload = config.enabled && config.key ? encryptBuffer(plain, config.key) : plain;
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          originalWriteFileSync.call(fs, filePath, payload);
          callback();
        } catch (err) {
          callback(err);
        }
      },
    });
    stream.bytesWritten = 0;
    stream.path = filePath;
    return stream;
  };

  console.log('🔐 Uploads I/O patching active — les fichiers seront chiffrés au repos');
}

// ---------------------------------------------------------------------------
// Traitement en masse des fichiers existants
// ---------------------------------------------------------------------------

/** Chiffre tous les fichiers uploads encore en clair */
function encryptAllUploads(keyString) {
  let count = 0;
  listAllUploadFiles().forEach((absolute) => {
    try {
      const raw = readRaw(absolute);
      if (isEncryptedBuffer(raw)) return;
      writeRaw(absolute, encryptBuffer(raw, keyString));
      count += 1;
    } catch (e) {
      console.error(`Erreur chiffrement fichier ${absolute}:`, e.message);
    }
  });
  return count;
}

/** Déchiffre tous les fichiers uploads chiffrés */
function decryptAllUploads(keyString) {
  let count = 0;
  listAllUploadFiles().forEach((absolute) => {
    try {
      const raw = readRaw(absolute);
      if (!isEncryptedBuffer(raw)) return;
      writeRaw(absolute, decryptBuffer(raw, keyString));
      count += 1;
    } catch (e) {
      console.error(`Erreur déchiffrement fichier ${absolute}:`, e.message);
    }
  });
  return count;
}

/** Re-chiffre tous les fichiers uploads avec une nouvelle clé */
function reEncryptAllUploads(oldKey, newKey) {
  let count = 0;
  listAllUploadFiles().forEach((absolute) => {
    try {
      const raw = readRaw(absolute);
      const plain = isEncryptedBuffer(raw) ? decryptBuffer(raw, oldKey) : raw;
      writeRaw(absolute, encryptBuffer(plain, newKey));
      count += 1;
    } catch (e) {
      console.error(`Erreur re-chiffrement fichier ${absolute}:`, e.message);
    }
  });
  return count;
}

// Accès disque brut (contourne les patchs) pour les traitements en masse
const rawRead = fs.readFileSync.bind(fs);
const rawWrite = fs.writeFileSync.bind(fs);
function readRaw(absolute) {
  // On lit via une descripteur pour éviter le patch de lecture
  const fd = fs.openSync(absolute, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, 0);
    return buf;
  } finally {
    fs.closeSync(fd);
  }
}
function writeRaw(absolute, buffer) {
  const fd = fs.openSync(absolute, 'w');
  try {
    fs.writeSync(fd, buffer, 0, buffer.length, 0);
  } finally {
    fs.closeSync(fd);
  }
}

module.exports = {
  uploadsRoot,
  isUploadPath,
  isEncryptedBuffer,
  encryptBuffer,
  decryptBuffer,
  listAllUploadFiles,
  patchUploadsIO,
  encryptAllUploads,
  decryptAllUploads,
  reEncryptAllUploads,
  rawRead,
  rawWrite,
};
