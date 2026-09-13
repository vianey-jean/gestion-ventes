/**
 * =============================================================================
 * zipArchive - Création et lecture d'archives ZIP sans dépendance externe
 * =============================================================================
 * Utilisé pour les sauvegardes de fichiers (photos produits/clients/profils,
 * pièces justificatives d'achat...) associées aux sauvegardes JSON.
 *
 * - createZip(entries)  : entries = [{ name: 'uploads/x.jpg', data: Buffer }]
 * - readZip(buffer)     : retourne [{ name, data }]
 *
 * Écriture : méthode "store" (aucune compression) → compatible avec tous les
 * outils de décompression. Lecture : "store" (0) et "deflate" (8).
 */

const zlib = require('zlib');

// --- CRC32 -------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

const crc32 = (buffer) => {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

// --- Date/heure DOS ----------------------------------------------------
const dosDateTime = (date = new Date()) => {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const day =
    (((Math.max(date.getFullYear(), 1980) - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { time, day };
};

/**
 * Crée une archive ZIP (stockée, sans compression).
 * @param {{name: string, data: Buffer}[]} entries
 * @returns {Buffer}
 */
const createZip = (entries) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  entries.forEach((entry) => {
    const nameBuf = Buffer.from(String(entry.name).replace(/\\/g, '/'), 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data || '');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);            // version needed
    local.writeUInt16LE(0x0800, 6);        // flags : nom en UTF-8
    local.writeUInt16LE(0, 8);             // méthode : store
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, nameBuf, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);          // version made by
    central.writeUInt16LE(20, 6);          // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);          // extra
    central.writeUInt16LE(0, 32);          // comment
    central.writeUInt16LE(0, 34);          // disk
    central.writeUInt16LE(0, 36);          // internal attrs
    central.writeUInt32LE(0, 38);          // external attrs
    central.writeUInt32LE(offset, 42);

    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + data.length;
  });

  const centralBuffer = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuffer, end]);
};

/**
 * Lit une archive ZIP (store ou deflate).
 * @param {Buffer} buffer
 * @returns {{name: string, data: Buffer}[]}
 */
const readZip = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 22) {
    throw new Error('Archive ZIP invalide');
  }

  // Recherche de l'End Of Central Directory
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error('Archive ZIP invalide (EOCD introuvable)');

  const entriesCount = buffer.readUInt16LE(eocd + 10);
  let pointer = buffer.readUInt32LE(eocd + 16);
  const results = [];

  for (let i = 0; i < entriesCount; i += 1) {
    if (pointer + 46 > buffer.length || buffer.readUInt32LE(pointer) !== 0x02014b50) break;

    const method = buffer.readUInt16LE(pointer + 10);
    const compressedSize = buffer.readUInt32LE(pointer + 20);
    const nameLen = buffer.readUInt16LE(pointer + 28);
    const extraLen = buffer.readUInt16LE(pointer + 30);
    const commentLen = buffer.readUInt16LE(pointer + 32);
    const localOffset = buffer.readUInt32LE(pointer + 42);
    const name = buffer.slice(pointer + 46, pointer + 46 + nameLen).toString('utf8');

    pointer += 46 + nameLen + extraLen + commentLen;

    if (!name || name.endsWith('/')) continue;
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) continue;

    const localNameLen = buffer.readUInt16LE(localOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = buffer.slice(dataStart, dataStart + compressedSize);

    let data;
    if (method === 0) {
      data = raw;
    } else if (method === 8) {
      data = zlib.inflateRawSync(raw);
    } else {
      continue; // méthode non supportée
    }

    results.push({ name: name.replace(/\\/g, '/'), data });
  }

  return results;
};

module.exports = { createZip, readZip, crc32 };
