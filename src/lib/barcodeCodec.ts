/**
 * barcodeCodec.ts
 * Encodage / décodage du code-barre obfusqué stocké dans products.json.
 *
 * Le serveur stocke le code-barre sous forme de plusieurs segments :
 * { v: 1, s: <salt>, p: [seg1..seg4], c: <checksum> }
 *
 * Cette fonction reconstruit la valeur brute lisible (ex: "223fsdq231321")
 * pour pouvoir l'afficher comme un vrai code-barre via JsBarcode.
 */

import type { EncodedBarcode, ProductCaracteristique } from '@/types/product';

const isEncoded = (v: unknown): v is EncodedBarcode =>
  !!v && typeof v === 'object' && 'p' in (v as any) && Array.isArray((v as any).p);

/** Décode la base64 en chaîne UTF-8 (browser-safe). */
const b64decode = (s: string): string => {
  try {
    // atob ne supporte pas les chaînes sans padding, on en remet
    const padded = s + '==='.slice((s.length + 3) % 4);
    return decodeURIComponent(escape(atob(padded)));
  } catch {
    return '';
  }
};

/** Décode un objet EncodedBarcode -> string lisible. */
export const decodeBarcode = (encoded: EncodedBarcode): string => {
  if (!encoded || !Array.isArray(encoded.p)) return '';
  // Chaque segment commence par 1 char de "tag" (sel), à retirer
  const parts = encoded.p.map((part) => {
    if (!part || part.length < 1) return '';
    return b64decode(part.slice(1));
  });
  return parts.join('');
};

/** Récupère la valeur lisible du code-barre, qu'elle soit brute ou encodée. */
export const getBarcodeValue = (
  carac?: ProductCaracteristique | null,
  fallback?: string,
): string => {
  if (!carac) return fallback || '';
  const b = carac.codeBarre;
  if (typeof b === 'string' && b.length > 0) return b;
  if (isEncoded(b)) {
    const decoded = decodeBarcode(b);
    if (decoded) return decoded;
  }
  return fallback || carac.code || '';
};
