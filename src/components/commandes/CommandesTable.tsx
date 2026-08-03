/**
 * Tableau des commandes et réservations (composition de composants réutilisables)
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernTable, ModernTableRow, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Gift } from 'lucide-react';
import { Commande, CommandeStatut } from '@/types/commande';
import CommandesStatsButtons from './CommandesStatsButtons';
import PreparationLivraisonButton from './PreparationLivraisonButton';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useCommandes } from '@/hooks/useCommandes';
import {
  CommandeTableRow,
  CommandeMobileCard,
  CommandesEmptyState,
  CommandesDetailModals,
  CommandesTableDesktopHead,
  useFideliteData,
} from './table';
import type { Client } from '@/types/client';
import type { Product } from '@/types/product';

interface CommandesTableProps {
  filteredCommandes: Commande[];
  totalActiveCommandes: number;
  commandeSearch: string;
  sortDateAsc: boolean;
  setSortDateAsc: (value: boolean) => void;
  handleEdit: (commande: Commande) => void;
  handleStatusChange: (id: string, status: CommandeStatut | 'reporter') => void;
  setDeleteId: (id: string) => void;
  getStatusOptions: (type: 'commande' | 'reservation' | 'rdv') => { value: string; label: string }[];
  lockedIds?: Set<string>;
}

const CommandesTable: React.FC<CommandesTableProps> = ({
  filteredCommandes,
  totalActiveCommandes,
  commandeSearch,
  sortDateAsc,
  setSortDateAsc,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions,
  lockedIds
}) => {
  const { clients } = useClients();
  const { products } = useProducts();
  const { commandes: allCommandes } = useCommandes();
  const { getFidelite } = useFideliteData();

  const lastActivityLabel = useMemo(() => {
    const source = (allCommandes && allCommandes.length ? allCommandes : filteredCommandes) || [];
    if (!source.length) return '—';
    const getTime = (c: any): number => {
      const candidates = [
        c.updatedAt, c.dateModification, c.dateCreation, c.createdAt,
        c.dateArrivagePrevue, c.dateEcheance, c.date,
      ].filter(Boolean);
      let max = 0;
      for (const d of candidates) {
        const t = new Date(d).getTime();
        if (!isNaN(t) && t > max) max = t;
      }
      return max;
    };
    const latest = source.reduce<{ t: number; c: any } | null>((acc, c) => {
      const t = getTime(c);
      return !acc || t > acc.t ? { t, c } : acc;
    }, null);
    if (!latest || !latest.t) return '—';
    try {
      return new Date(latest.t).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return '—'; }
  }, [allCommandes, filteredCommandes]);

  // Variables locales — réinitialisées à null à la fermeture
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [caracProduct, setCaracProduct] = useState<Product | null>(null);

  const clientsByName = useMemo(() => {
    const m = new Map<string, Client>();
    clients.forEach((c) => m.set((c.nom || '').toLowerCase().trim(), c));
    return m;
  }, [clients]);

  const productsByName = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set((p.description || '').toLowerCase().trim(), p));
    return m;
  }, [products]);

  const handleClientClick = (commande: Commande) => {
    const found = clientsByName.get((commande.clientNom || '').toLowerCase().trim());
    if (found) {
      setSelectedClient(found);
    } else {
      // Fallback : créer un ClientLike à la volée depuis les données de la commande
      setSelectedClient({
        id: `tmp-${commande.id}`,
        nom: commande.clientNom,
        phone: commande.clientPhone,
        phones: commande.clientPhone ? [commande.clientPhone] : [],
        adresse: commande.clientAddress,
        addresses: commande.clientAddress ? [commande.clientAddress] : [],
        dateCreation: commande.createdAt || commande.dateCommande,
      } as Client);
    }
  };

  const handleProductClick = (produitNom: string) => {
    const found = productsByName.get((produitNom || '').toLowerCase().trim());
    if (found) setSelectedProduct(found);
  };

  return (
    <>
      <Card className="border-2 border-purple-200/50 dark:border-purple-700/50 shadow-[0_20px_70px_rgba(168,85,247,0.3)] bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 pb-4 sm:pb-6 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-4 text-base sm:text-xl md:text-2xl font-black tracking-tight">
            <span className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-2xl">
              <Gift className="h-5 w-5 sm:h-7 sm:w-7" />
            </span>
            <span className="truncate">Liste des Commandes</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <CommandesStatsButtons
              filteredCommandes={filteredCommandes}
              totalActiveCommandes={totalActiveCommandes}
              commandeSearch={commandeSearch}
            />
            <PreparationLivraisonButton filteredCommandes={filteredCommandes} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Vue mobile - Cards */}
          <div className="block lg:hidden">
            {filteredCommandes.map((commande) => (
              <CommandeMobileCard
                key={commande.id}
                commande={commande}
                handleEdit={handleEdit}
                handleStatusChange={handleStatusChange}
                setDeleteId={setDeleteId}
                getStatusOptions={getStatusOptions}
                onClientClick={handleClientClick}
                onProductClick={handleProductClick}
                locked={lockedIds?.has(commande.id)}
                fidelite={getFidelite(commande.clientNom)}
              />
            ))}
            {filteredCommandes.length === 0 && (
              <CommandesEmptyState lastActivityLabel={lastActivityLabel} variant="mobile" />
            )}
          </div>

          {/* Vue desktop - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <ModernTable className="min-w-full">
              <CommandesTableDesktopHead sortDateAsc={sortDateAsc} setSortDateAsc={setSortDateAsc} />

              <TableBody>
                {filteredCommandes.length > 0 ? (
                  filteredCommandes.map((commande) => (
                    <CommandeTableRow
                      key={commande.id}
                      commande={commande}
                      handleEdit={handleEdit}
                      handleStatusChange={handleStatusChange}
                      setDeleteId={setDeleteId}
                      getStatusOptions={getStatusOptions}
                      onClientClick={handleClientClick}
                      onProductClick={handleProductClick}
                      locked={lockedIds?.has(commande.id)}
                      fidelite={getFidelite(commande.clientNom)}
                    />
                  ))
                ) : (
                  <ModernTableRow>
                    <ModernTableCell colSpan={8} className="py-28">
                      <CommandesEmptyState lastActivityLabel={lastActivityLabel} variant="desktop" />
                    </ModernTableCell>
                  </ModernTableRow>
                )}
              </TableBody>
            </ModernTable>
          </div>
        </CardContent>
      </Card>

      {/* ===== Modales détail (variables réinitialisées à la fermeture) ===== */}
      <CommandesDetailModals
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        caracProduct={caracProduct}
        setCaracProduct={setCaracProduct}
      />
    </>
  );
};

export default CommandesTable;
