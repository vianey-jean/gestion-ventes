/**
 * =============================================================================
 * Composant CommandeFormDialog (orchestrateur)
 * =============================================================================
 *
 * Décomposé en sous-composants réutilisables :
 *  - ClientSection, ProductSection, TypeDateSection
 *  - IndisponibiliteAlert, FormActionButtons, RdvCompletionModal
 *
 * Toute la logique (états, effets, handlers) reste ici afin de garantir la
 * compatibilité totale avec l'API existante (props identiques).
 *
 * @module CommandeFormDialog
 * @version 2.0.0
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Sparkles, Edit, Gift } from 'lucide-react';
import { toast } from 'sonner';

import ClientSection, { ClientLite } from './form/ClientSection';
import ProductSection, { ProductLite, ProductCategory } from './form/ProductSection';
import TypeDateSection from './form/TypeDateSection';
import IndisponibiliteAlert from './form/IndisponibiliteAlert';
import FormActionButtons from './form/FormActionButtons';
import RdvCompletionModal from './form/RdvCompletionModal';

import { Commande, CommandeProduit } from '@/types/commande';
import type { ClientCaracteristique } from '@/utils/clientCharacteristic';
import indisponibleApi from '@/services/api/indisponibleApi';
import rdvTachesApi from '@/services/api/rdvTachesApi';
import commandeApi from '@/services/api/commandeApi';
import travailleurApi from '@/services/api/travailleurApi';
import tachesRdvApi from '@/services/api/tachesRdvApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const filterProductsByCategory = (products: ProductLite[], category: ProductCategory): ProductLite[] => {
  if (category === 'all') return products;
  const check = (p: ProductLite) => p.description.toLowerCase();
  switch (category) {
    case 'perruque': return products.filter(p => check(p).includes('perruque'));
    case 'tissage': return products.filter(p => check(p).includes('tissage'));
    case 'extension': return products.filter(p => check(p).includes('extension'));
    case 'autres': return products.filter(p =>
      !check(p).includes('perruque') && !check(p).includes('tissage') && !check(p).includes('extension')
    );
    default: return products;
  }
};

interface CommandeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCommande: Commande | null;

  clientNom: string;
  setClientNom: (v: string) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  clientPhones?: string[];
  clientAddress: string;
  setClientAddress: (v: string) => void;
  clientVille?: string;
  setClientVille?: (v: string) => void;
  clientSearch: string;
  setClientSearch: (v: string) => void;
  showClientSuggestions: boolean;
  setShowClientSuggestions: (v: boolean) => void;
  filteredClients: ClientLite[];
  handleClientSelect: (client: ClientLite) => void;

  type: 'commande' | 'reservation' | 'rdv';
  setType: (v: 'commande' | 'reservation' | 'rdv') => void;

  produitNom: string;
  setProduitNom: (v: string) => void;
  prixUnitaire: string;
  setPrixUnitaire: (v: string) => void;
  quantite: string;
  setQuantite: (v: string) => void;
  prixVente: string;
  setPrixVente: (v: string) => void;
  productSearch: string;
  setProductSearch: (v: string) => void;
  showProductSuggestions: boolean;
  setShowProductSuggestions: (v: boolean) => void;
  filteredProducts: ProductLite[];
  handleProductSelect: (p: ProductLite) => void;
  selectedProduct: ProductLite | null;
  availableQuantityForSelected?: number | null;

  produitsListe: CommandeProduit[];
  editingProductIndex: number | null;
  handleAddProduit: () => void;
  handleEditProduit: (i: number) => void;
  handleRemoveProduit: (i: number) => void;

  dateArrivagePrevue: string;
  setDateArrivagePrevue: (v: string) => void;
  dateEcheance: string;
  setDateEcheance: (v: string) => void;
  horaire: string;
  setHoraire: (v: string) => void;
  horaireFin?: string;
  setHoraireFin?: (v: string) => void;

  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;

  currentClientCaracteristique?: ClientCaracteristique | null;

  productReduction?: string;
  setProductReduction?: (v: string) => void;
  productReductionType?: '' | 'amount' | 'percent';
  setProductReductionType?: (v: '' | 'amount' | 'percent') => void;
  productDeliveryLocation?: string;
  setProductDeliveryLocation?: (v: string) => void;
  productDeliveryFee?: string;
  setProductDeliveryFee?: (v: string) => void;
  productBaseDeliveryFee?: number | null;
  setProductBaseDeliveryFee?: (v: number | null) => void;

  ulterieurConfig?: { mode: 'date' | 'inconnu'; date?: string } | null;
  onOpenUlterieurModal?: () => void;
}

const CommandeFormDialog: React.FC<CommandeFormDialogProps> = ({
  isOpen, onOpenChange, editingCommande,
  clientNom, setClientNom, clientPhone, setClientPhone, clientPhones = [],
  clientAddress, setClientAddress, clientVille = '', setClientVille,
  clientSearch, setClientSearch, showClientSuggestions, setShowClientSuggestions,
  filteredClients, handleClientSelect,
  type, setType,
  produitNom, setProduitNom, prixUnitaire, setPrixUnitaire, quantite, setQuantite,
  prixVente, setPrixVente, productSearch, setProductSearch,
  showProductSuggestions, setShowProductSuggestions,
  filteredProducts, handleProductSelect, selectedProduct,
  produitsListe, editingProductIndex, handleAddProduit, handleEditProduit, handleRemoveProduit,
  dateArrivagePrevue, setDateArrivagePrevue, dateEcheance, setDateEcheance,
  horaire, setHoraire, horaireFin = '', setHoraireFin,
  handleSubmit, resetForm,
  availableQuantityForSelected, currentClientCaracteristique,
  productReduction = '', setProductReduction,
  productReductionType = '', setProductReductionType,
  productDeliveryLocation = '', setProductDeliveryLocation,
  productDeliveryFee = '0', setProductDeliveryFee,
  productBaseDeliveryFee = null, setProductBaseDeliveryFee,
  ulterieurConfig = null, onOpenUlterieurModal,
}) => {
  // ===== États UI =====
  const [showHeureFin, setShowHeureFin] = React.useState(false);
  React.useEffect(() => { if (horaireFin) setShowHeureFin(true); }, [horaireFin, isOpen]);

  const [productCategoryFilter, setProductCategoryFilter] = React.useState<ProductCategory>('all');
  const categoryFilteredProducts = React.useMemo(
    () => filterProductsByCategory(filteredProducts, productCategoryFilter),
    [filteredProducts, productCategoryFilter]
  );

  const [selectedClientPhoto, setSelectedClientPhoto] = React.useState<string | null>(null);
  const [availableVilles, setAvailableVilles] = React.useState<string[]>([]);
  const [livraisonVilles, setLivraisonVilles] = React.useState<Array<{ ville: string; fee: number }>>([]);
  const [showFeeOverride, setShowFeeOverride] = React.useState(false);
  const [showFeeIncrease, setShowFeeIncrease] = React.useState(false);
  const [feeIncreaseAmount, setFeeIncreaseAmount] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    import('@/services/api/villesApi').then(({ clientsVillesApi, livraisonVilleApi }) => {
      clientsVillesApi.getAll().then(setAvailableVilles).catch(() => setAvailableVilles([]));
      livraisonVilleApi.getAll().then(setLivraisonVilles).catch(() => setLivraisonVilles([]));
    });
  }, [isOpen]);

  const isCustomVille = !!clientVille && !availableVilles.some(v => v.toLowerCase() === clientVille.toLowerCase());

  // Auto pré-remplissage frais de livraison depuis ville client
  const lastAutoFillRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!selectedProduct || !livraisonVilles.length || !clientVille || !setProductDeliveryLocation || !setProductDeliveryFee) return;
    const key = `${selectedProduct.id}__${clientVille.toLowerCase()}`;
    if (lastAutoFillRef.current === key) return;
    if (productDeliveryLocation && productDeliveryLocation.toLowerCase() === clientVille.toLowerCase()) {
      lastAutoFillRef.current = key;
      return;
    }
    lastAutoFillRef.current = key;
    const found = livraisonVilles.find(v => v.ville.toLowerCase() === clientVille.toLowerCase());
    if (found) {
      setProductDeliveryLocation(found.ville);
      setProductDeliveryFee(String(found.fee));
      setProductBaseDeliveryFee?.(found.fee);
    } else {
      setProductDeliveryLocation(clientVille);
      setProductDeliveryFee('0');
      setProductBaseDeliveryFee?.(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id, livraisonVilles.length, clientVille]);

  // ===== Vérification de disponibilité (indisponibilité) =====
  const [availability, setAvailability] = React.useState<{ disponible: boolean; message?: string; suggestions?: Array<{ heureDebut: string; heureFin: string; label: string }> }>({ disponible: true });
  const checkDate = type === 'commande' ? dateArrivagePrevue : dateEcheance;
  const computedHeureFin = React.useMemo(() => {
    if (horaireFin) return horaireFin;
    if (!horaire) return '';
    const [h, m] = horaire.split(':').map(Number);
    if (isNaN(h)) return '';
    const end = new Date(); end.setHours(h + 1, m || 0, 0, 0);
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
  }, [horaire, horaireFin]);

  React.useEffect(() => {
    if (!isOpen || !checkDate) { setAvailability({ disponible: true }); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await indisponibleApi.checkDisponibilite(checkDate, horaire || undefined, computedHeureFin || undefined);
        if (!cancelled) setAvailability(res as any);
      } catch {
        if (!cancelled) setAvailability({ disponible: true });
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [isOpen, checkDate, horaire, computedHeureFin]);

  // ===== Mode RDV =====
  const [localRdvMode, setLocalRdvMode] = React.useState(false);
  const [rdvDate, setRdvDate] = React.useState('');
  const [rdvConflict, setRdvConflict] = React.useState<{ busy: boolean; message?: string }>({ busy: false });

  React.useEffect(() => {
    const txt = (productSearch || produitNom || '').toLowerCase();
    if (txt.includes('prestation')) setLocalRdvMode(true);
  }, [productSearch, produitNom]);

  React.useEffect(() => {
    if (!isOpen) {
      setLocalRdvMode(false);
      setRdvDate('');
      setRdvConflict({ busy: false });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !localRdvMode || !rdvDate || !horaire) {
      setRdvConflict({ busy: false });
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const resp: any = await rdvTachesApi.getByDate(rdvDate);
        const items: any[] = Array.isArray(resp) ? resp : (resp?.data || []);
        const toMin = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return (h || 0) * 60 + (m || 0);
        };
        const s = toMin(horaire);
        const e = toMin(computedHeureFin || horaire);
        const conflict = items.find((r: any) => {
          if (r.statut === 'annule' || r.statut === 'termine') return false;
          const rs = toMin(r.heureDebut);
          const re = toMin(r.heureFin);
          return s < re && e > rs;
        });
        if (!cancelled) {
          if (conflict) {
            setRdvConflict({ busy: true, message: `Créneau occupé par "${(conflict as any).tacheNom}" (${(conflict as any).heureDebut} - ${(conflict as any).heureFin})` });
          } else {
            setRdvConflict({ busy: false });
          }
        }
      } catch {
        if (!cancelled) setRdvConflict({ busy: false });
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [isOpen, localRdvMode, rdvDate, horaire, computedHeureFin]);

  // ===== Modal de complétion RDV =====
  const [rdvModalOpen, setRdvModalOpen] = React.useState(false);
  const [createdRdvTacheId, setCreatedRdvTacheId] = React.useState<string | null>(null);
  const [rdvPersonneNom, setRdvPersonneNom] = React.useState('');
  const [rdvTacheNom, setRdvTacheNom] = React.useState('');
  const [rdvCommentaires, setRdvCommentaires] = React.useState('');
  const [rdvStatut, setRdvStatut] = React.useState<'planifie' | 'confirme' | 'reporte'>('planifie');
  const [submittingRdv, setSubmittingRdv] = React.useState(false);

  const [personneQuery, setPersonneQuery] = React.useState('');
  const [personneOptions, setPersonneOptions] = React.useState<Array<{ id: string; nom: string; prenom: string; phone?: string }>>([]);
  const [showPersonneList, setShowPersonneList] = React.useState(false);
  const [tacheQuery, setTacheQuery] = React.useState('');
  const [tacheOptions, setTacheOptions] = React.useState<Array<{ id: string; nom: string }>>([]);
  const [showTacheList, setShowTacheList] = React.useState(false);
  const [allTaches, setAllTaches] = React.useState<Array<{ id: string; nom: string }>>([]);
  const [createdCommandeId, setCreatedCommandeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!showPersonneList) return;
    const q = personneQuery.trim();
    if (q.length < 3) { setPersonneOptions([]); return; }
    let cancel = false;
    const t = setTimeout(async () => {
      try {
        const resp: any = await travailleurApi.search(q);
        const items: any[] = Array.isArray(resp) ? resp : (resp?.data || []);
        if (!cancel) setPersonneOptions(items.slice(0, 10));
      } catch { if (!cancel) setPersonneOptions([]); }
    }, 200);
    return () => { cancel = true; clearTimeout(t); };
  }, [personneQuery, showPersonneList]);

  React.useEffect(() => {
    if (!rdvModalOpen) return;
    (async () => {
      try {
        const resp: any = await tachesRdvApi.getAll();
        const items: any[] = Array.isArray(resp) ? resp : (resp?.data || []);
        setAllTaches(items);
      } catch { setAllTaches([]); }
    })();
  }, [rdvModalOpen]);

  React.useEffect(() => {
    if (!showTacheList) return;
    const q = tacheQuery.trim().toLowerCase();
    if (q.length < 1) { setTacheOptions(allTaches.slice(0, 20)); return; }
    setTacheOptions(allTaches.filter(t => t.nom.toLowerCase().includes(q)).slice(0, 20));
  }, [tacheQuery, allTaches, showTacheList]);

  const handleSubmitRdvMode = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!clientNom || !rdvDate || !horaire) {
      toast.error('Veuillez remplir client, date et horaire');
      return;
    }
    if (rdvConflict.busy) { toast.error('Créneau occupé'); return; }
    try {
      setSubmittingRdv(true);
      const heureFin = computedHeureFin || horaire;
      const createdResp: any = await rdvTachesApi.create({
        clientNom,
        clientTelephone: clientPhone,
        telephone: clientPhone,
        lieu: clientAddress,
        tacheNom: produitNom || 'Prestation',
        date: rdvDate,
        heureDebut: horaire,
        heureFin,
        statut: 'planifie',
      } as any);
      const created = createdResp?.data || createdResp;
      const newId = created?.id;
      setCreatedRdvTacheId(newId);

      let newCommandeId: string | null = null;
      try {
        const cmdResp: any = await commandeApi.create({
          clientNom, clientPhone, clientAddress,
          type: 'rdv' as any,
          produits: produitsListe.length > 0 ? produitsListe : [{
            nom: produitNom || 'Prestation',
            prixUnitaire: parseFloat(prixUnitaire) || 0,
            quantite: parseFloat(quantite) || 1,
            prixVente: parseFloat(prixVente) || 0,
          }],
          dateEcheance: rdvDate,
          horaire,
          horaireFin: heureFin,
          rdvTacheId: newId,
        } as any);
        const cmd = cmdResp?.data || cmdResp;
        newCommandeId = cmd?.id || null;
        if (newCommandeId && newId) {
          await rdvTachesApi.updateByCommande(newCommandeId, { commandeId: newCommandeId } as any);
        }
      } catch (err) {
        console.error('commande create error', err);
        if (newId) { try { await rdvTachesApi.delete(newId); } catch { } }
        throw err;
      }
      setCreatedCommandeId(newCommandeId);

      setRdvTacheNom(''); setTacheQuery(''); setRdvPersonneNom(''); setPersonneQuery('');
      setRdvCommentaires(''); setRdvStatut('planifie');
      onOpenChange(false);
      setRdvModalOpen(true);
      toast.success('Commande créée. Complétez le RDV.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setSubmittingRdv(false);
    }
  };

  const handleSubmitRdvCompletion = async () => {
    if (!createdRdvTacheId) return;
    if (!rdvTacheNom.trim()) { toast.error('Veuillez sélectionner une tâche'); return; }
    try {
      setSubmittingRdv(true);
      const completionPayload = {
        personneNom: rdvPersonneNom,
        tacheNom: rdvTacheNom,
        commentaires: rdvCommentaires,
        statut: rdvStatut,
      } as any;
      if (createdCommandeId) {
        await rdvTachesApi.updateByCommande(createdCommandeId, completionPayload);
      } else {
        await rdvTachesApi.update(createdRdvTacheId, completionPayload);
      }
      toast.success('Rendez-vous créé avec succès');
      setRdvModalOpen(false);
      setCreatedRdvTacheId(null);
      setCreatedCommandeId(null);
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSubmittingRdv(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) setSelectedClientPhoto(null);
  }, [isOpen]);

  const onClientPick = (client: ClientLite) => {
    setSelectedClientPhoto(client.photo || null);
    handleClientSelect(client);
  };

  const clientPhotoUrl = selectedClientPhoto
    ? (selectedClientPhoto.startsWith('http') ? selectedClientPhoto : `${API_BASE_URL}${selectedClientPhoto}`)
    : null;

  const productMainPhoto = selectedProduct
    ? (selectedProduct.mainPhoto || (selectedProduct.photos && selectedProduct.photos[0]))
    : null;
  const productPhotoUrl = productMainPhoto
    ? (productMainPhoto.startsWith('http') ? productMainPhoto : `${API_BASE_URL}${productMainPhoto}`)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-2xl border-2 border-purple-300/50 dark:border-purple-600/50 shadow-[0_20px_70px_rgba(168,85,247,0.4)]">
        <DialogHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
            <Sparkles className="h-6 w-6 text-pink-500" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center">
            {editingCommande ? (
              <span className="flex items-center justify-center gap-2">
                <Edit className="h-6 w-6 text-purple-600" />
                Modifier Commande Premium
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-pink-600" />
                Nouvelle Commande Elite
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-3 text-center font-medium">
            ✨ Créez une expérience d'achat exclusive et luxueuse ✨
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={localRdvMode ? handleSubmitRdvMode : handleSubmit} className="space-y-6 mt-6">
          <ClientSection
            clientPhotoUrl={clientPhotoUrl}
            clientNom={clientNom}
            clientSearch={clientSearch}
            setClientSearch={setClientSearch}
            setClientNom={setClientNom}
            setShowClientSuggestions={setShowClientSuggestions}
            showClientSuggestions={showClientSuggestions}
            filteredClients={filteredClients}
            onClientPick={onClientPick}
            setSelectedClientPhoto={setSelectedClientPhoto}
            currentClientCaracteristique={currentClientCaracteristique}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientPhones={clientPhones}
            clientAddress={clientAddress}
            setClientAddress={setClientAddress}
            clientVille={clientVille}
            setClientVille={setClientVille}
            availableVilles={availableVilles}
            setAvailableVilles={setAvailableVilles}
            isCustomVille={isCustomVille}
          />

          <ProductSection
            productPhotoUrl={productPhotoUrl}
            selectedProduct={selectedProduct}
            productCategoryFilter={productCategoryFilter}
            setProductCategoryFilter={setProductCategoryFilter}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            produitNom={produitNom}
            setProduitNom={setProduitNom}
            showProductSuggestions={showProductSuggestions}
            setShowProductSuggestions={setShowProductSuggestions}
            categoryFilteredProducts={categoryFilteredProducts}
            handleProductSelect={handleProductSelect}
            prixUnitaire={prixUnitaire}
            setPrixUnitaire={setPrixUnitaire}
            quantite={quantite}
            setQuantite={setQuantite}
            prixVente={prixVente}
            setPrixVente={setPrixVente}
            availableQuantityForSelected={availableQuantityForSelected}
            productReduction={productReduction}
            setProductReduction={setProductReduction}
            productReductionType={productReductionType}
            setProductReductionType={setProductReductionType}
            productDeliveryLocation={productDeliveryLocation}
            setProductDeliveryLocation={setProductDeliveryLocation}
            productDeliveryFee={productDeliveryFee}
            setProductDeliveryFee={setProductDeliveryFee}
            productBaseDeliveryFee={productBaseDeliveryFee}
            setProductBaseDeliveryFee={setProductBaseDeliveryFee}
            livraisonVilles={livraisonVilles}
            showFeeOverride={showFeeOverride}
            setShowFeeOverride={setShowFeeOverride}
            showFeeIncrease={showFeeIncrease}
            setShowFeeIncrease={setShowFeeIncrease}
            feeIncreaseAmount={feeIncreaseAmount}
            setFeeIncreaseAmount={setFeeIncreaseAmount}
            produitsListe={produitsListe}
            editingProductIndex={editingProductIndex}
            handleAddProduit={handleAddProduit}
            handleEditProduit={handleEditProduit}
            handleRemoveProduit={handleRemoveProduit}
          />

          <TypeDateSection
            type={type}
            setType={setType}
            localRdvMode={localRdvMode}
            setLocalRdvMode={setLocalRdvMode}
            ulterieurConfig={ulterieurConfig}
            onOpenUlterieurModal={onOpenUlterieurModal}
            rdvDate={rdvDate}
            setRdvDate={setRdvDate}
            dateArrivagePrevue={dateArrivagePrevue}
            setDateArrivagePrevue={setDateArrivagePrevue}
            dateEcheance={dateEcheance}
            setDateEcheance={setDateEcheance}
            horaire={horaire}
            setHoraire={setHoraire}
            horaireFin={horaireFin}
            setHoraireFin={setHoraireFin}
            showHeureFin={showHeureFin}
            setShowHeureFin={setShowHeureFin}
          />

          <IndisponibiliteAlert
            availability={availability}
            localRdvMode={localRdvMode}
            rdvConflict={rdvConflict}
            onApplySuggestion={(s) => { setHoraire(s.heureDebut); setHoraireFin?.(s.heureFin); setShowHeureFin(true); }}
          />

          <FormActionButtons
            onCancel={() => { onOpenChange(false); resetForm(); }}
            localRdvMode={localRdvMode}
            rdvConflictBusy={rdvConflict.busy}
            submittingRdv={submittingRdv}
            rdvDate={rdvDate}
            horaire={horaire}
            clientNom={clientNom}
            editingCommande={!!editingCommande}
            type={type}
            availabilityDisponible={availability.disponible}
          />
        </form>
      </DialogContent>

      <RdvCompletionModal
        open={rdvModalOpen}
        onOpenChange={setRdvModalOpen}
        clientNom={clientNom}
        clientPhone={clientPhone}
        clientAddress={clientAddress}
        rdvDate={rdvDate}
        horaire={horaire}
        computedHeureFin={computedHeureFin}
        personneQuery={personneQuery}
        setPersonneQuery={setPersonneQuery}
        setRdvPersonneNom={setRdvPersonneNom}
        showPersonneList={showPersonneList}
        setShowPersonneList={setShowPersonneList}
        personneOptions={personneOptions}
        tacheQuery={tacheQuery}
        setTacheQuery={setTacheQuery}
        setRdvTacheNom={setRdvTacheNom}
        rdvTacheNom={rdvTacheNom}
        showTacheList={showTacheList}
        setShowTacheList={setShowTacheList}
        tacheOptions={tacheOptions}
        rdvCommentaires={rdvCommentaires}
        setRdvCommentaires={setRdvCommentaires}
        rdvStatut={rdvStatut}
        setRdvStatut={setRdvStatut}
        submittingRdv={submittingRdv}
        onSubmit={handleSubmitRdvCompletion}
      />
    </Dialog>
  );
};

export default CommandeFormDialog;
