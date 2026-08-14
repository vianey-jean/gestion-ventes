/**
 * runtimeSecurity.ts — Durcissement runtime léger (zéro impact perf notable).
 * Installé une seule fois au démarrage depuis main.tsx.
 *
 * - Blocage de la pollution de prototype via JSON.parse (__proto__ / constructor)
 * - Neutralisation des ouvertures de fenêtre non sécurisées (window.opener)
 * - Blocage des navigations "javascript:" / "data:text/html"
 * - Gestion silencieuse des erreurs globales (aucune donnée sensible loggée)
 */

let installed = false;

const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

export function installRuntimeSecurity() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // 1) JSON.parse durci (reviver anti prototype-pollution)
  const nativeParse = JSON.parse.bind(JSON);
  JSON.parse = ((text: string, reviver?: (k: string, v: unknown) => unknown) =>
    nativeParse(text, function (this: unknown, key: string, value: unknown) {
      if (FORBIDDEN_KEYS.includes(key)) return undefined;
      return reviver ? reviver.call(this, key, value) : value;
    })) as typeof JSON.parse;

  // 2) window.open toujours sans opener (anti tabnabbing)
  const nativeOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const feat = features ? `${features},noopener,noreferrer` : 'noopener,noreferrer';
    return nativeOpen(url as any, target || '_blank', feat);
  }) as typeof window.open;

  // 3) Blocage des schémas dangereux au clic (liens injectés)
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement | null)?.closest?.('a');
      const href = el?.getAttribute('href') || '';
      const lower = href.trim().toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('data:text/html')) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // 4) Erreurs globales : pas de fuite de données dans la console
  window.addEventListener('unhandledrejection', (e) => {
    if (import.meta.env.PROD) e.preventDefault();
  });
}

export default installRuntimeSecurity;
