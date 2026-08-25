// Résumé :
// Wrapper de performance appliqué aux pages publiques lourdes (Home, About,
// Login, Register, Contact, Messages).
// - Coupe les animations de transform/layout coûteuses de framer-motion
//   (MotionConfig reducedMotion) : les boucles décoratives infinies ne
//   déclenchent plus de recalculs permanents.
// - Raccourcit les transitions restantes pour un rendu immédiat.
// - Ajoute une classe CSS "light-page" qui réduit les flous (backdrop-filter)
//   et les ombres très coûteuses sur mobile / tablette.
// Aucune logique métier n'est modifiée : c'est purement présentationnel.

import React from 'react';
import { MotionConfig } from 'framer-motion';

interface LightPageProps {
  children: React.ReactNode;
}

/**
 * Conteneur allégé : encapsule une page dans un MotionConfig "réduit".
 */
const LightPage: React.FC<LightPageProps> = ({ children }) => (
  <MotionConfig reducedMotion="always" transition={{ duration: 0.2 }}>
    <div className="light-page">{children}</div>
  </MotionConfig>
);

/**
 * HOC utilitaire : enveloppe un composant page sans changer ses props.
 * Utilisé au moment de l'export par défaut des pages concernées.
 */
export function withLightPage<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <LightPage>
      <Component {...props} />
    </LightPage>
  );
  Wrapped.displayName = `withLightPage(${Component.displayName || Component.name || 'Page'})`;
  return Wrapped;
}

export default LightPage;
