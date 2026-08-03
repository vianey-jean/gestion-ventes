/**
 * CommandesDetailModals — modales de détail client / produit / caractéristiques.
 */
import React from 'react';
import ClientDetailModal from '@/components/clients/ClientDetailModal';
import ProductDetailModal from '@/components/products/ProductDetailModal';
import CaracteristiqueModal from '@/components/products/CaracteristiqueModal';
import type { Client } from '@/types/client';
import type { Product } from '@/types/product';

interface Props {
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  caracProduct: Product | null;
  setCaracProduct: (p: Product | null) => void;
}

const CommandesDetailModals: React.FC<Props> = ({
  selectedClient,
  setSelectedClient,
  selectedProduct,
  setSelectedProduct,
  caracProduct,
  setCaracProduct,
}) => (
  <>
    <ClientDetailModal
      open={!!selectedClient}
      onOpenChange={(o) => { if (!o) setSelectedClient(null); }}
      client={selectedClient as any}
      photoUrl={(selectedClient as any)?.photo || null}
    />

    <ProductDetailModal
      open={!!selectedProduct}
      onOpenChange={(o) => { if (!o) setSelectedProduct(null); }}
      product={selectedProduct}
      onOpenCaracteristique={(p) => setCaracProduct(p)}
    />

    <CaracteristiqueModal
      open={!!caracProduct}
      onOpenChange={(o) => { if (!o) setCaracProduct(null); }}
      product={caracProduct as any}
    />
  </>
);

export default CommandesDetailModals;
