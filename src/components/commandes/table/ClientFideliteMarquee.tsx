/**
 * ClientFideliteMarquee — marquee défilant affichant la fidélité du client
 * issue de la base de données (fidelite.json + listes-fidelite.json).
 * Nouveau client (0 achat) → libellé du palier "nouveau".
 */
import React from 'react';
import type { FideliteInfo } from './useFideliteData';

interface Props {
  fidelite: FideliteInfo | null;
}

const ClientFideliteMarquee: React.FC<Props> = ({ fidelite }) => {
  if (!fidelite) return null;
  const text = `${fidelite.label}${fidelite.count > 0 ? ` · ${fidelite.count} achat${fidelite.count > 1 ? 's' : ''}` : ''}`;
  return (
    <div className="overflow-hidden w-full mt-1">
      <div
        className={`whitespace-nowrap inline-block animate-marquee text-xs font-bold bg-gradient-to-r ${fidelite.grad} bg-clip-text text-transparent`}
      >
        ✦ {text} ✦ {text} ✦
      </div>
    </div>
  );
};

export default ClientFideliteMarquee;
