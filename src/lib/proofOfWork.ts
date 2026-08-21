/**
 * proofOfWork.ts — Preuve de travail légère (anti-bot / anti-automatisation)
 *
 * Utilisée par la page de vérification de sécurité : le navigateur doit trouver
 * un nonce dont le hash SHA-256 commence par N bits à zéro. Coût négligeable
 * pour un humain (quelques centaines de ms), coûteux pour un botnet qui tente
 * des milliers d'ouvertures de session en parallèle.
 */

export interface PowResult {
  challenge: string;
  nonce: number;
  hash: string;
  difficulty: number;
  durationMs: number;
}

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const sha256Hex = async (text: string): Promise<string> => {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

/** Nombre de bits nuls en tête du hash hexadécimal. */
const leadingZeroBits = (hex: string): number => {
  let bits = 0;
  for (const ch of hex) {
    const v = parseInt(ch, 16);
    if (v === 0) {
      bits += 4;
      continue;
    }
    if (v < 2) bits += 3;
    else if (v < 4) bits += 2;
    else if (v < 8) bits += 1;
    break;
  }
  return bits;
};

/** Génère un défi aléatoire côté client. */
export const createChallenge = (): string =>
  toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);

/**
 * Résout la preuve de travail. `difficulty` = bits nuls exigés (18 ≈ 200-600 ms).
 * `maxIterations` borne le calcul pour ne jamais bloquer un appareil lent.
 */
export const solveProofOfWork = async (
  challenge: string = createChallenge(),
  difficulty = 18,
  maxIterations = 4_000_000
): Promise<PowResult | null> => {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  const started = performance.now();

  for (let nonce = 0; nonce < maxIterations; nonce++) {
    const hash = await sha256Hex(`${challenge}:${nonce}`);
    if (leadingZeroBits(hash) >= difficulty) {
      return {
        challenge,
        nonce,
        hash,
        difficulty,
        durationMs: Math.round(performance.now() - started),
      };
    }
    // Laisse respirer le thread principal
    if (nonce % 500 === 499) await new Promise((r) => setTimeout(r, 0));
  }

  return null;
};

/** Persiste la preuve pour la session courante (audit / anti-rejeu léger). */
export const storeProof = (proof: PowResult) => {
  try {
    sessionStorage.setItem('security_pow_v1', JSON.stringify({ ...proof, at: Date.now() }));
  } catch {
    /* ignore */
  }
};

export default solveProofOfWork;
