/**
 * =============================================================================
 * Couche de chiffrement de transport côté client (Web)
 * =============================================================================
 *
 * Fonctionnement (miroir exact de server/security/sessionCrypto.js) :
 *   1. Au démarrage, le navigateur génère une paire ECDH P-256 et envoie sa clé
 *      publique brute (base64) à POST /api/v1/handshake avec { appId: "web" }.
 *   2. Le serveur répond { sessionId, serverPublicKey, expiresAt }.
 *   3. Le secret partagé ECDH est dérivé en clé AES-256-GCM via HKDF-SHA256
 *      (salt = sessionId, info = "riziky-secure-transport:web").
 *   4. Tous les corps JSON envoyés vers /api/* sont chiffrés en enveloppe
 *      { __enc, v, iv, data, tag } et l'en-tête `x-session-id` est ajouté.
 *   5. Les réponses chiffrées (en-tête `x-encrypted: 1`) sont déchiffrées de
 *      façon transparente.
 *   6. Si la session expire, le serveur renvoie 409 { renegotiate: true } avec
 *      l'en-tête `x-handshake-required` : un nouveau handshake est relancé
 *      automatiquement et la requête est rejouée une seule fois.
 *
 * Exemptions (jamais chiffrées) : handshake, /uploads, SSE (`/events`,
 * `/stream`, `Accept: text/event-stream`) et les envois multipart (fichiers).
 *
 * Rétrocompatibilité totale : si le handshake échoue (serveur ancien, réseau
 * indisponible, WebCrypto absent), les requêtes partent en clair comme avant.
 */

const APP_ID = 'web';
const HKDF_INFO = `riziky-secure-transport:${APP_ID}`;
const RENEW_MARGIN_MS = 60 * 1000;

export interface Envelope {
  __enc: 1 | number;
  v?: number;
  iv: string;
  data: string;
  tag: string;
}

interface SessionState {
  sessionId: string;
  key: CryptoKey;
  expiresAt: number;
}

let session: SessionState | null = null;
let pending: Promise<SessionState | null> | null = null;
let disabled = false;

const getBaseURL = (): string =>
  (import.meta as any).env?.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const subtle = (): SubtleCrypto | null => {
  try {
    return globalThis.crypto?.subtle ?? null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ base64 */

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function toAB(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

function enc(text: string): ArrayBuffer {
  return toAB(new TextEncoder().encode(text));
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* --------------------------------------------------------------- handshake */

async function performHandshake(): Promise<SessionState | null> {
  const sc = subtle();
  if (!sc || disabled) return null;

  try {
    const pair = await sc.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, [
      'deriveBits',
    ]);
    const rawPub = await sc.exportKey('raw', pair.publicKey);

    const res = await fetch(`${getBaseURL()}/api/v1/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-id': APP_ID },
      body: JSON.stringify({ appId: APP_ID, publicKey: bufToB64(rawPub) }),
    });
    if (!res.ok) return null;

    const payload = await res.json();
    if (!payload?.ok || !payload.sessionId || !payload.serverPublicKey) return null;

    const serverPub = await sc.importKey(
      'raw',
      toAB(b64ToBuf(payload.serverPublicKey)),
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );
    const shared = await sc.deriveBits(
      { name: 'ECDH', public: serverPub },
      pair.privateKey,
      256
    );
    const hkdfKey = await sc.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
    const aesKey = await sc.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: enc(payload.sessionId),
        info: enc(HKDF_INFO),
      },
      hkdfKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return {
      sessionId: payload.sessionId,
      key: aesKey,
      expiresAt: Number(payload.expiresAt) || Date.now() + 25 * 60 * 1000,
    };
  } catch {
    return null;
  }
}

/** Retourne une session valide, en relançant le handshake si nécessaire. */
export async function ensureSession(): Promise<SessionState | null> {
  if (disabled) return null;
  if (session && session.expiresAt - RENEW_MARGIN_MS > Date.now()) return session;
  if (pending) return pending;

  pending = performHandshake()
    .then((s) => {
      session = s;
      return s;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/** Invalide la session courante (expiration serveur, rotation). */
export function resetSession(): void {
  session = null;
}

/** Désactive définitivement le chiffrement de transport (mode dégradé). */
export function disableSecureTransport(): void {
  disabled = true;
  session = null;
}

export function getSessionId(): string | null {
  return session?.sessionId ?? null;
}

/* ------------------------------------------------------- chiffre / déchiffre */

export async function encryptPayload(plainText: string): Promise<Envelope | null> {
  const s = await ensureSession();
  const sc = subtle();
  if (!s || !sc) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await sc.encrypt({ name: 'AES-GCM', iv: toAB(iv), tagLength: 128 }, s.key, enc(plainText))
  );
  // Node place le tag séparément : les 16 derniers octets de WebCrypto = tag
  const tag = cipher.slice(cipher.length - 16);
  const data = cipher.slice(0, cipher.length - 16);
  return { __enc: 1, v: 1, iv: bufToB64(iv), data: bufToB64(data), tag: bufToB64(tag) };
}

export function isEnvelope(value: any): value is Envelope {
  return !!(value && typeof value === 'object' && value.__enc && value.iv && value.data && value.tag);
}

export async function decryptEnvelope(envelope: Envelope): Promise<any> {
  const sc = subtle();
  if (!session || !sc) throw new Error('Session de chiffrement absente');
  const data = b64ToBuf(envelope.data);
  const tag = b64ToBuf(envelope.tag);
  const full = new Uint8Array(data.length + tag.length);
  full.set(data, 0);
  full.set(tag, data.length);
  const plain = await sc.decrypt(
    { name: 'AES-GCM', iv: toAB(b64ToBuf(envelope.iv)), tagLength: 128 },
    session.key,
    toAB(full)
  );
  const text = new TextDecoder().decode(plain);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ------------------------------------------------------------- exemptions */

export function isExemptUrl(url: string, headers?: Record<string, any>, isMultipart?: boolean): boolean {
  let path = url;
  try {
    path = new URL(url, globalThis.location?.origin || 'http://localhost').pathname;
  } catch {
    /* chemin relatif */
  }
  if (!path.startsWith('/api')) return true;
  if (path.startsWith('/uploads') || path.includes('/uploads/')) return true;
  if (path.includes('/handshake')) return true;
  if (path.endsWith('/events') || path.endsWith('/stream')) return true;
  if (isMultipart) return true;
  const accept = String(headers?.['Accept'] || headers?.['accept'] || '');
  if (accept.includes('text/event-stream')) return true;
  return false;
}

/** Vrai si l'URL vise bien l'API du projet (et pas un service tiers). */
export function isApiUrl(url: string): boolean {
  const base = getBaseURL();
  if (url.startsWith('/api')) return true;
  if (url.startsWith(base)) return true;
  try {
    const u = new URL(url, globalThis.location?.origin || 'http://localhost');
    const b = new URL(base);
    return u.host === b.host && u.pathname.startsWith('/api');
  } catch {
    return false;
  }
}

/* ------------------------------------------------- patch global de `fetch` */

let fetchPatched = false;

/**
 * Enveloppe `window.fetch` : les appels directs (partage, profil, blocage IP,
 * messagerie en direct, WebRTC…) profitent automatiquement du chiffrement
 * sans modification de leur code appelant.
 */
export function installSecureFetch(): void {
  if (fetchPatched || typeof window === 'undefined' || !window.fetch) return;
  fetchPatched = true;

  const originalFetch = window.fetch.bind(window);

  const run = async (input: RequestInfo | URL, init?: RequestInit, retried = false): Promise<Response> => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    if (disabled || !isApiUrl(url)) return originalFetch(input as any, init);

    const method = String(init?.method || (input as Request)?.method || 'GET').toUpperCase();
    const headers = new Headers(init?.headers || (input as Request)?.headers || {});
    const body = init?.body;
    const isMultipart = typeof FormData !== 'undefined' && body instanceof FormData;

    if (isExemptUrl(url, { Accept: headers.get('accept') || '' }, isMultipart)) {
      return originalFetch(input as any, init);
    }

    const s = await ensureSession();
    if (!s) return originalFetch(input as any, init);

    const nextInit: RequestInit = { ...(init || {}) };
    headers.set('x-session-id', s.sessionId);
    headers.set('x-app-id', APP_ID);

    if (body && typeof body === 'string' && method !== 'GET' && method !== 'HEAD') {
      const envelope = await encryptPayload(body);
      if (envelope) {
        nextInit.body = JSON.stringify(envelope);
        headers.set('Content-Type', 'application/json');
        headers.set('x-encrypted', '1');
      }
    }
    nextInit.headers = headers;

    const response = await originalFetch(
      typeof input === 'string' || input instanceof URL ? (url as any) : input,
      nextInit
    );

    // Session expirée côté serveur → renégociation + rejeu unique
    if (response.status === 409 && !retried && response.headers.get('x-handshake-required') === '1') {
      resetSession();
      return run(input, init, true);
    }

    if (response.headers.get('x-encrypted') !== '1') return response;

    // Déchiffrement transparent : on reconstruit une réponse JSON en clair
    try {
      const envelope = await response.clone().json();
      if (!isEnvelope(envelope)) return response;
      const plain = await decryptEnvelope(envelope);
      const clearHeaders = new Headers(response.headers);
      clearHeaders.delete('x-encrypted');
      clearHeaders.set('Content-Type', 'application/json');
      return new Response(JSON.stringify(plain), {
        status: response.status,
        statusText: response.statusText,
        headers: clearHeaders,
      });
    } catch {
      return response;
    }
  };

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => run(input, init)) as typeof window.fetch;
}

/** Démarre le handshake au chargement de l'application (non bloquant). */
export function installSecureTransport(): void {
  installSecureFetch();
  void ensureSession();
}

export default {
  ensureSession,
  resetSession,
  encryptPayload,
  decryptEnvelope,
  isEnvelope,
  isExemptUrl,
  isApiUrl,
  installSecureTransport,
  installSecureFetch,
  disableSecureTransport,
  getSessionId,
};
