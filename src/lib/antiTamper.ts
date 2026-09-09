/**
 * antiTamper.ts — Défenses front additives (anti-clone / anti-embarquement / anti-exfiltration)
 * Installé une seule fois au démarrage depuis main.tsx, après installRuntimeSecurity().
 *
 * Couches :
 *  1. Framebusting        : refus d'exécution dans une iframe étrangère (clickjacking,
 *                           clonage par proxy transparent).
 *  2. Vérification d'origine : l'application ne s'initialise que sur un domaine
 *                           autorisé (localhost, *.lovable.app, *.vercel.app,
 *                           domaine de production). Sinon écran de blocage.
 *  3. Anti-copie des données sensibles : blocage de la copie / du glisser-déposer
 *                           des blocs marqués `data-sensitive`, et du menu contextuel
 *                           sur ces blocs.
 *  4. Intégrité runtime   : détection d'un remplacement de `fetch` /
 *                           `XMLHttpRequest` par un script injecté.
 *
 * Aucune logique métier n'est modifiée : ce module n'observe et ne bloque que
 * des comportements hostiles.
 */

let installed = false;

const ALLOWED_HOST_SUFFIXES = [
  'localhost',
  '127.0.0.1',
  '.lovable.app',
  '.lovableproject.com',
  '.vercel.app',
  '.onrender.com',
];

const isAllowedHost = (host: string): boolean => {
  const h = host.toLowerCase().split(':')[0];
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return true;
  return ALLOWED_HOST_SUFFIXES.some((s) => s.startsWith('.') && h.endsWith(s));
};

const blockScreen = (title: string, detail: string) => {
  try {
    document.documentElement.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.setAttribute(
      'style',
      'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;' +
        'justify-content:center;gap:12px;font-family:system-ui,sans-serif;' +
        'background:#0b1120;color:#e2e8f0;text-align:center;padding:24px;z-index:2147483647'
    );
    const h = document.createElement('h1');
    h.textContent = title;
    h.setAttribute('style', 'font-size:20px;font-weight:700;margin:0');
    const p = document.createElement('p');
    p.textContent = detail;
    p.setAttribute('style', 'font-size:14px;opacity:.75;max-width:520px;margin:0');
    wrap.appendChild(h);
    wrap.appendChild(p);
    document.body ? document.body.appendChild(wrap) : document.documentElement.appendChild(wrap);
  } catch {
    /* ignore */
  }
};

export function installAntiTamper() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // Les protections bloquantes ne s'appliquent qu'en production sur un domaine
  // réellement public : jamais en développement ni dans l'aperçu Lovable
  // (qui affiche le site dans une iframe légitime).
  const host = window.location.host.toLowerCase().split(':')[0];
  const isPreviewOrDev =
    !import.meta.env.PROD ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.lovable.app') ||
    host.endsWith('.lovableproject.com');

  if (!isPreviewOrDev) {
    // 1) Framebusting — l'app ne doit jamais tourner dans une frame tierce
    try {
      if (window.top && window.top !== window.self) {
        let sameOrigin = false;
        try {
          sameOrigin = window.top.location.origin === window.location.origin;
        } catch {
          sameOrigin = false;
        }
        if (!sameOrigin) {
          blockScreen(
            'Affichage non autorisé',
            "Cette application ne peut pas être intégrée dans un site externe."
          );
          try {
            window.top.location.href = window.location.href;
          } catch {
            /* origine croisée : l'écran de blocage suffit */
          }
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // 2) Vérification d'origine (anti-clone déployé sur un domaine pirate)
    if (!isAllowedHost(window.location.host)) {
      blockScreen(
        'Copie non autorisée',
        'Ce déploiement ne correspond pas à un domaine officiel de l’application. Accès bloqué.'
      );
      return;
    }
  }

  // 3) Anti-copie / anti-exfiltration des blocs sensibles
  const isSensitive = (target: EventTarget | null) =>
    !!(target as HTMLElement | null)?.closest?.('[data-sensitive="true"]');

  ['copy', 'cut', 'dragstart', 'contextmenu'].forEach((evt) => {
    document.addEventListener(
      evt,
      (e) => {
        if (isSensitive(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  });

  // 4) Intégrité runtime : NON BLOQUANTE.
  // Si un script tiers (souvent une extension de navigateur légitime) remplace
  // fetch/XHR, on restaure simplement les fonctions natives. Aucun écran de
  // blocage : une extension ne doit jamais interrompre la session utilisateur.
  const nativeFetch = window.fetch;
  const nativeXhrOpen = XMLHttpRequest.prototype.open;
  const checkIntegrity = () => {
    try {
      if (window.fetch !== nativeFetch) window.fetch = nativeFetch;
      if (XMLHttpRequest.prototype.open !== nativeXhrOpen) {
        XMLHttpRequest.prototype.open = nativeXhrOpen;
      }
    } catch {
      /* ignore */
    }
  };
  window.setInterval(checkIntegrity, 15000);
}

export default installAntiTamper;
