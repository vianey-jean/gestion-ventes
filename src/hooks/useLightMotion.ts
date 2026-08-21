import { useState } from 'react';

/**
 * useLightMotion
 * Détecte (une seule fois, au montage) si l'appareil doit recevoir une version
 * allégée des décorations animées : petits écrans ou préférence "réduire les animations".
 * Permet d'accélérer nettement le premier rendu sur mobile / tablette
 * sans modifier le style des pages sur desktop.
 */
export function useLightMotion() {
  const [light] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const smallScreen = window.innerWidth < 1024;
      const lowCores = (navigator as any)?.hardwareConcurrency
        ? (navigator as any).hardwareConcurrency <= 4
        : false;
      return reduced || smallScreen || lowCores;
    } catch {
      return false;
    }
  });

  return {
    /** true = appareil léger (mobile/tablette ou animations réduites) */
    light,
    /** nombre de particules décoratives à rendre */
    particleCount: light ? 0 : 18,
  };
}

export default useLightMotion;
