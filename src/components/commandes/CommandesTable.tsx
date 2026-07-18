/**
 * Tableau des commandes et réservations
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Gift, Edit, Trash2, ArrowUp, ArrowDown, Sparkles, CalendarDays, PackageOpen } from 'lucide-react';
import { Commande, CommandeStatut } from '@/types/commande';
import CommandesStatsButtons from './CommandesStatsButtons';
import PreparationLivraisonButton from './PreparationLivraisonButton';
import { getCaracteristiqueByLabel } from '@/utils/clientCharacteristic';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useCommandes } from '@/hooks/useCommandes';
import ClientDetailModal from '@/components/clients/ClientDetailModal';
import ProductDetailModal from '@/components/products/ProductDetailModal';
import CaracteristiqueModal from '@/components/products/CaracteristiqueModal';
import type { Client } from '@/types/client';
import type { Product } from '@/types/product';

const ClientCaracMarquee: React.FC<{ label?: string }> = ({ label }) => {
  const carac = getCaracteristiqueByLabel(label);
  if (!carac) return null;
  return (
    <div className="overflow-hidden w-full mt-1">
      <div className={`whitespace-nowrap inline-block animate-marquee text-xs ${carac.marqueeClass}`}>
        ✦ {carac.label} ✦ {carac.label} ✦
      </div>
    </div>
  );
};

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
      <Card className="border-2 border-purple-200/50 dark:border-purple-700/50 shadow-[0_20px_70px_rgba(168,85,247,0.3)] bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm">
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
              />
            ))}
            {filteredCommandes.length === 0 && (
              <div className="relative flex flex-col items-center justify-center overflow-hidden px-8 py-28">

                {/* Background Luxury Glow */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                  <div className="absolute h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[140px] animate-pulse" />

                  <div className="absolute h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[180px]" />

                  <div className="absolute h-[520px] w-[520px] rounded-full border border-purple-400/10" />

                </div>


                {/* Premium Glass Card */}
                <div className="relative w-full max-w-3xl rounded-[40px] border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-3xl px-10 py-14 shadow-[0_40px_140px_rgba(168,85,247,.20)]">


                  {/* Icon Luxury */}
                  <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">

                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 blur-3xl opacity-40 animate-pulse" />


                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/40 dark:border-purple-500/20 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 shadow-[0_30px_90px_rgba(168,85,247,.35)]">

                      <PackageOpen className="h-16 w-16 text-purple-500 animate-[float_4s_ease-in-out_infinite]" />

                    </div>

                  </div>


                  {/* Badge */}
                  <div className="mb-6 flex justify-center">

                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/40 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 px-5 py-2 backdrop-blur-xl">

                      <Sparkles className="h-4 w-4 text-fuchsia-500" />

                      <span className="text-sm font-semibold tracking-wide text-purple-700 dark:text-purple-300">
                        Gestion des commandes
                      </span>

                    </div>

                  </div>


                  {/* Title */}
                  <h3 className="text-center text-4xl font-black tracking-tight">

                    <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">

                      Aucune commande disponible

                    </span>

                  </h3>


                  {/* Description */}
                  <p className="mx-auto mt-6 max-w-xl text-center text-base sm:text-lg leading-8 text-muted-foreground">

                    Votre espace commandes est actuellement vide.

                    <br />

                    Les nouvelles commandes apparaîtront automatiquement ici dès leur création.

                  </p>


                  {/* Premium Info Cards */}
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">


                    {/* Card 1 */}
                    <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                      <div className="text-3xl font-black text-purple-600">
                        0
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Commandes actives
                      </p>

                    </div>


                    {/* Card 2 */}
                    <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                      <div className="text-2xl sm:text-3xl font-black text-fuchsia-600 break-words">
                        {lastActivityLabel}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Dernière commande
                      </p>

                    </div>


                    {/* Card 3 */}
                    <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                      <div className="text-3xl font-black text-indigo-600">
                        ✓
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Synchronisé
                      </p>

                    </div>


                  </div>


                </div>

              </div>
            )}
          </div>

          {/* Vue desktop - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <ModernTable className="min-w-full">
              <ModernTableHeader>
                <ModernTableRow>
                  <ModernTableHead className="w-52">Client</ModernTableHead>
                  <ModernTableHead>Contact</ModernTableHead>
                  <ModernTableHead className="w-52">Produit</ModernTableHead>
                  <ModernTableHead>Prix</ModernTableHead>
                  <ModernTableHead>Type</ModernTableHead>
                  <ModernTableHead>
                    <button
                      onClick={() => setSortDateAsc(!sortDateAsc)}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                      title={sortDateAsc ? "Trier du plus loin au plus proche" : "Trier du plus proche au plus loin"}
                    >
                      Date
                      {sortDateAsc ? (
                        <ArrowDown className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-purple-600" />
                      )}
                    </button>
                  </ModernTableHead>
                  <ModernTableHead>Statut</ModernTableHead>
                  <ModernTableHead>Actions</ModernTableHead>
                </ModernTableRow>
              </ModernTableHeader>

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
                    />
                  ))
                ) : (
                  <ModernTableRow>
                    <ModernTableCell colSpan={8} className="py-28">
                      <div className="relative flex flex-col items-center justify-center overflow-hidden">

                        {/* Halo Background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                          <div className="absolute h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[140px] animate-pulse" />

                          <div className="absolute h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[180px]" />

                          <div className="absolute h-[520px] w-[520px] rounded-full border border-purple-400/10" />

                        </div>

                        {/* Floating Card */}
                        <div className="relative rounded-[36px] border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-3xl shadow-[0_30px_120px_rgba(168,85,247,.18)] px-14 py-14">

                          {/* Icon */}
                          <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">

                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 blur-3xl opacity-40 animate-pulse" />

                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/40 dark:border-purple-500/20 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-slate-900 dark:via-violet-900/30 dark:to-slate-900 shadow-[0_25px_80px_rgba(168,85,247,.35)]">

                              <PackageOpen className="h-16 w-16 text-violet-500 animate-[float_4s_ease-in-out_infinite]" />

                            </div>

                          </div>

                          {/* Badge */}
                          <div className="mb-6 flex justify-center">

                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/40 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-indigo-500/10 px-5 py-2 backdrop-blur-xl">

                              <Sparkles className="h-4 w-4 text-fuchsia-500" />

                              <span className="text-sm font-semibold tracking-wide text-purple-700 dark:text-purple-300">
                                Tableau intelligent
                              </span>

                            </div>

                          </div>

                          {/* Title */}
                          <h2 className="text-center text-4xl font-black tracking-tight">

                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                              Aucune commande disponible
                            </span>

                          </h2>

                          {/* Subtitle */}
                          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-9 text-muted-foreground">

                            Votre tableau est actuellement vide.

                            <br />

                            Dès qu'une nouvelle commande sera créée, elle apparaîtra automatiquement ici .

                          </p>

                          {/* Premium Stats */}
                          <div className="mt-12 grid grid-cols-3 gap-5">

                            <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                              <div className="text-3xl font-black text-violet-600">
                                0
                              </div>

                              <div className="mt-1 text-sm text-muted-foreground">
                                Commandes
                              </div>

                            </div>

                            <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                              <div className="text-2xl sm:text-3xl font-black text-fuchsia-600 break-words">
                                {lastActivityLabel}
                              </div>

                              <div className="mt-1 text-sm text-muted-foreground">
                                Dernière activité
                              </div>

                            </div>

                            <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 p-6 backdrop-blur-xl">

                              <div className="text-3xl font-black text-indigo-600">
                                ✓
                              </div>

                              <div className="mt-1 text-sm text-muted-foreground">
                                Synchronisation
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    </ModernTableCell>
                  </ModernTableRow>
                )}
              </TableBody>

            </ModernTable>
          </div>
        </CardContent>
      </Card>

      {/* ===== Modales détail (variables réinitialisées à la fermeture) ===== */}
      <ClientDetailModal
        open={!!selectedClient}
        onOpenChange={(o) => { if (!o) setSelectedClient(null); }}
        client={selectedClient as any}
        photoUrl={selectedClient?.photo || null}
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
};

// Composant pour une ligne de tableau (desktop)
interface CommandeRowProps {
  commande: Commande;
  handleEdit: (commande: Commande) => void;
  handleStatusChange: (id: string, status: CommandeStatut | 'reporter') => void;
  setDeleteId: (id: string) => void;
  getStatusOptions: (type: 'commande' | 'reservation' | 'rdv') => { value: string; label: string }[];
  onClientClick?: (commande: Commande) => void;
  onProductClick?: (produitNom: string) => void;
  locked?: boolean;
}

const CommandeTableRow: React.FC<CommandeRowProps> = ({
  commande,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions,
  onClientClick,
  onProductClick,
  locked,
}) => {
  const renderDateCell = () => {
    if (commande.type === 'commande') {
      return (
        <div>
          <div className="text-xs text-muted-foreground">Arrivage:</div>
          <div>{new Date(commande.dateArrivagePrevue || '').toLocaleDateString()}</div>
          {commande.horaire && (
            <div className="text-xs text-muted-foreground mt-1">
              Horaire: {commande.horaire}
            </div>
          )}
        </div>
      );
    }

    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);

    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0;
    const isNearDeadline = diffDays >= 0 && diffDays <= 2;

    return (
      <div>
        <div className="text-xs text-muted-foreground">Échéance:</div>
        <div className={
          isOverdue
            ? "animate-pulse text-red-600 dark:text-red-500 font-bold"
            : isNearDeadline
              ? "animate-pulse text-green-600 dark:text-green-500 font-bold"
              : ""
        }>
          {echeance.toLocaleDateString()}
        </div>
        {commande.horaire && (
          <div className={`text-xs mt-1 ${isOverdue
            ? "animate-pulse text-red-600 dark:text-red-500 font-semibold"
            : isNearDeadline
              ? "animate-pulse text-green-600 dark:text-green-500 font-semibold"
              : "text-muted-foreground"
            }`}>
            Horaire: {commande.horaire}
          </div>
        )}
      </div>
    );
  };

  return (
    <ModernTableRow className={`bg-gradient-to-r from-purple-50/30 via-pink-50/20 to-indigo-50/30 dark:from-gray-900/20 dark:via-purple-900/10 dark:to-indigo-900/10 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-100/40 hover:via-pink-100/30 hover:to-indigo-100/30 transition-all duration-500 rounded-xl backdrop-blur-sm ${locked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      <ModernTableCell className="align-top w-52">
        <button
          type="button"
          onClick={() => onClientClick?.(commande)}
          className="text-left w-full group rounded-lg hover:bg-purple-100/40 dark:hover:bg-purple-900/20 px-1.5 py-1 -mx-1.5 transition-colors"
          title="Voir le détail du client"
        >
          <div className="font-semibold text-purple-800 dark:text-purple-200 group-hover:underline whitespace-normal break-words">{commande.clientNom}</div>
          <ClientCaracMarquee label={commande.clientCaracteristique} />
          <div className="text-xs text-muted-foreground whitespace-normal break-words">{commande.clientAddress}</div>
        </button>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <span className="text-sm whitespace-normal break-words text-gray-700 dark:text-gray-300">{commande.clientPhone}</span>
      </ModernTableCell>
      <ModernTableCell className="align-top w-52">
        {commande.produits.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onProductClick?.(p.nom)}
            className="block text-left w-full text-sm space-y-0.5 rounded-lg hover:bg-pink-100/40 dark:hover:bg-pink-900/20 px-1.5 py-1 -mx-1.5 transition-colors"
            title="Voir le détail du produit"
          >
            <div className="font-medium text-purple-700 dark:text-purple-300 hover:underline whitespace-normal break-words inline-flex items-center gap-1">
              {p.nom}
              <Sparkles className="h-3 w-3 text-fuchsia-500 opacity-60" />
            </div>
            <div className="text-xs text-muted-foreground">
              Qté: <span className="font-bold text-red-600">{p.quantite}</span>
            </div>
          </button>
        ))}
      </ModernTableCell>
      <ModernTableCell className="align-top">
        {commande.produits.map((p, idx) => (
          <div key={idx} className="text-sm space-y-0.5">
            <div className="text-gray-600 dark:text-gray-400">Unitaire: {p.prixUnitaire}€</div>
            <div className="font-semibold text-purple-700 dark:text-purple-300">Vente: {p.prixVente}€</div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t-2 border-red-300 dark:border-red-700">
          <div className="text-base font-extrabold text-red-600 dark:text-red-500 shadow-sm">
            Total: {commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€
          </div>
        </div>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <Badge
          className={
            commande.type === 'commande'
              ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md hover:from-purple-700 hover:via-pink-600 hover:to-indigo-600"
              : commande.type === 'rdv'
                ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-md hover:from-amber-600 hover:via-orange-600 hover:to-rose-600"
                : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white shadow-md hover:from-blue-600 hover:via-cyan-500 hover:to-green-500"
          }
          variant={commande.type === 'commande' ? 'default' : 'secondary'}
        >
          {commande.type === 'commande' ? 'Commande' : commande.type === 'rdv' ? 'RDV' : 'Réservation'}
        </Badge>
      </ModernTableCell>
      <ModernTableCell className="align-top text-sm">
        {renderDateCell()}
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <Select
          value={commande.statut}
          onValueChange={(value) => handleStatusChange(commande.id, value as any)}
        >
          <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            {getStatusOptions(commande.type).map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={
                  option.value === 'en_route' ? 'text-purple-600 font-semibold' :
                    option.value === 'arrive' ? 'text-green-600 font-semibold' :
                      option.value === 'en_attente' ? 'text-red-600 font-semibold' :
                        option.value === 'valide' ? 'text-blue-600 font-semibold' :
                          option.value === 'annule' ? 'text-gray-600 font-semibold' :
                            option.value === 'reporter' ? 'text-blue-500 font-semibold' :
                              ''
                }
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(commande)}
            className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl shadow-sm transition-all duration-300"
            title="Modifier"
          >
            <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(commande.id)}
            className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl shadow-sm transition-all duration-300"
            title="Supprimer"
          >
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </ModernTableCell>
    </ModernTableRow>

  );
};

// Composant pour une carte mobile
const CommandeMobileCard: React.FC<CommandeRowProps> = ({
  commande,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions,
  onClientClick,
  onProductClick,
  locked,
}) => {
  const totalPrice = commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);

  const getDateInfo = () => {
    if (commande.type === 'commande') {
      return {
        label: 'Arrivage',
        date: new Date(commande.dateArrivagePrevue || '').toLocaleDateString(),
        isOverdue: false,
        isNearDeadline: false
      };
    }

    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);

    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      label: 'Échéance',
      date: echeance.toLocaleDateString(),
      isOverdue: diffDays < 0,
      isNearDeadline: diffDays >= 0 && diffDays <= 2
    };
  };

  const dateInfo = getDateInfo();

  return (
    <div className={`p-4 border-b border-purple-100 dark:border-purple-800/30 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-pink-50/20 hover:to-indigo-50/30 dark:hover:from-purple-900/10 dark:hover:via-pink-900/10 dark:hover:to-indigo-900/10 transition-all duration-500 shadow-lg backdrop-blur-md rounded-2xl ${locked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      {/* En-tête: Client + Type */}
      <div className="flex justify-between items-start mb-3">
        <button
          type="button"
          onClick={() => onClientClick?.(commande)}
          className="flex-1 min-w-0 text-left rounded-lg hover:bg-purple-100/40 dark:hover:bg-purple-900/20 -mx-1 px-1 py-0.5 transition-colors"
          title="Voir le détail du client"
        >
          <h3 className="font-extrabold text-lg text-purple-800 dark:text-purple-200 truncate hover:underline">{commande.clientNom}</h3>
          <ClientCaracMarquee label={commande.clientCaracteristique} />
          <p className="text-xs text-muted-foreground truncate">{commande.clientAddress}</p>
          <p className="text-xs text-muted-foreground">{commande.clientPhone}</p>
        </button>
        <Badge
          className={`ml-2 text-xs px-3 py-1 rounded-full font-semibold shadow-md ${commande.type === 'commande'
            ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white"
            : commande.type === 'rdv'
              ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white"
              : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white"
            }`}
        >
          {commande.type === 'commande' ? 'CMD' : commande.type === 'rdv' ? 'RDV' : 'RES'}
        </Badge>
      </div>

      {/* Produits */}
      <div className="mb-3 space-y-1">
        {commande.produits.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onProductClick?.(p.nom)}
            className="w-full flex justify-between text-sm rounded-md hover:bg-pink-100/40 dark:hover:bg-pink-900/20 px-1 py-0.5 -mx-1 transition-colors"
            title="Voir le détail du produit"
          >
            <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200 text-left hover:underline">{p.nom} <span className="text-red-600 font-bold">{`x${p.quantite}`}</span></span>
            <span className="font-semibold ml-2 text-purple-700 dark:text-purple-300">{p.prixVente}€</span>
          </button>
        ))}
        <div className="pt-2 border-t border-red-200 dark:border-red-800">
          <div className="flex justify-between">
            <span className="font-bold text-red-600 dark:text-red-400 tracking-wide">Total</span>
            <span className="font-black text-red-600 dark:text-red-400 text-lg">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Date + Statut */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <div className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${dateInfo.isOverdue
          ? "bg-red-100 text-red-700 animate-pulse"
          : dateInfo.isNearDeadline
            ? "bg-green-100 text-green-700 animate-pulse"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
          {dateInfo.label}: {dateInfo.date}
          {commande.horaire && ` ${commande.horaire}`}
        </div>

        <Select
          value={commande.statut}
          onValueChange={(value) => handleStatusChange(commande.id, value as any)}
        >
          <SelectTrigger className="h-8 w-28 text-xs bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            {getStatusOptions(commande.type).map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(commande)}
          className="flex-1 text-xs h-8 bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
        >
          <Edit className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteId(commande.id)}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>

  );
};

export default CommandesTable;
