/**
 * =============================================================================
 * Composant CommandeFormDialog
 * =============================================================================
 * 
 * Modal de création/édition de commande ou réservation.
 * Contient le formulaire complet avec gestion client, produits et dates.
 * 
 * @module CommandeFormDialog
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, ShoppingCart, Crown, Star, Sparkles, Gift, Award, Zap, Filter, CalendarClock } from 'lucide-react';
import SaleQuantityInput from '@/components/dashboard/forms/SaleQuantityInput';
import { Commande, CommandeProduit } from '@/types/commande';
import type { ClientCaracteristique } from '@/utils/clientCharacteristic';
import indisponibleApi from '@/services/api/indisponibleApi';
import rdvTachesApi from '@/services/api/rdvTachesApi';
import commandeApi from '@/services/api/commandeApi';
import travailleurApi from '@/services/api/travailleurApi';
import tachesRdvApi from '@/services/api/tachesRdvApi';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones?: string[];
  adresse: string;
  photo?: string;
}

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  mainPhoto?: string;
  photos?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'perruque', label: 'Perruque' },
  { value: 'tissage', label: 'Tissage' },
  { value: 'extension', label: 'Extension' },
  { value: 'autres', label: 'Autres' },
];

const filterProductsByCategory = (products: Product[], category: ProductCategory): Product[] => {
  if (category === 'all') return products;
  const check = (p: Product) => p.description.toLowerCase();
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

  // Client fields
  clientNom: string;
  setClientNom: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientPhones?: string[];
  clientAddress: string;
  setClientAddress: (value: string) => void;
  clientSearch: string;
  setClientSearch: (value: string) => void;
  showClientSuggestions: boolean;
  setShowClientSuggestions: (value: boolean) => void;
  filteredClients: Client[];
  handleClientSelect: (client: Client) => void;

  // Type field
  type: 'commande' | 'reservation' | 'rdv';
  setType: (value: 'commande' | 'reservation' | 'rdv') => void;

  // Product fields
  produitNom: string;
  setProduitNom: (value: string) => void;
  prixUnitaire: string;
  setPrixUnitaire: (value: string) => void;
  quantite: string;
  setQuantite: (value: string) => void;
  prixVente: string;
  setPrixVente: (value: string) => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  showProductSuggestions: boolean;
  setShowProductSuggestions: (value: boolean) => void;
  filteredProducts: Product[];
  handleProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
  availableQuantityForSelected?: number | null;

  // Products list
  produitsListe: CommandeProduit[];
  editingProductIndex: number | null;
  handleAddProduit: () => void;
  handleEditProduit: (index: number) => void;
  handleRemoveProduit: (index: number) => void;

  // Date fields
  dateArrivagePrevue: string;
  setDateArrivagePrevue: (value: string) => void;
  dateEcheance: string;
  setDateEcheance: (value: string) => void;
  horaire: string;
  setHoraire: (value: string) => void;
  horaireFin?: string;
  setHoraireFin?: (value: string) => void;

  // Actions
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;

  // Caractéristique client (calculée en live)
  currentClientCaracteristique?: ClientCaracteristique | null;
}

/**
 * Modal de formulaire pour créer/éditer une commande ou réservation
 */
const CommandeFormDialog: React.FC<CommandeFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingCommande,
  clientNom,
  setClientNom,
  clientPhone,
  setClientPhone,
  clientPhones = [],
  clientAddress,
  setClientAddress,
  clientSearch,
  setClientSearch,
  showClientSuggestions,
  setShowClientSuggestions,
  filteredClients,
  handleClientSelect,
  type,
  setType,
  produitNom,
  setProduitNom,
  prixUnitaire,
  setPrixUnitaire,
  quantite,
  setQuantite,
  prixVente,
  setPrixVente,
  productSearch,
  setProductSearch,
  showProductSuggestions,
  setShowProductSuggestions,
  filteredProducts,
  handleProductSelect,
  selectedProduct,
  produitsListe,
  editingProductIndex,
  handleAddProduit,
  handleEditProduit,
  handleRemoveProduit,
  dateArrivagePrevue,
  setDateArrivagePrevue,
  dateEcheance,
  setDateEcheance,
  horaire,
  setHoraire,
  horaireFin = '',
  setHoraireFin,
  handleSubmit,
  resetForm,
  availableQuantityForSelected,
  currentClientCaracteristique,
}) => {
  const [showHeureFin, setShowHeureFin] = React.useState(false);
  React.useEffect(() => { if (horaireFin) setShowHeureFin(true); }, [horaireFin, isOpen]);
  const [productCategoryFilter, setProductCategoryFilter] = React.useState<ProductCategory>('all');
  const categoryFilteredProducts = React.useMemo(() => filterProductsByCategory(filteredProducts, productCategoryFilter), [filteredProducts, productCategoryFilter]);
  const [selectedClientPhoto, setSelectedClientPhoto] = React.useState<string | null>(null);

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

  // ===== Mode RDV (3e option du type) =====
  const [localRdvMode, setLocalRdvMode] = React.useState(false);
  const [rdvDate, setRdvDate] = React.useState('');
  const [rdvConflict, setRdvConflict] = React.useState<{ busy: boolean; message?: string }>({ busy: false });

  // Auto-détection: si le nom du produit contient "prestation" => mode RDV
  React.useEffect(() => {
    const txt = (productSearch || produitNom || '').toLowerCase();
    if (txt.includes('prestation')) {
      setLocalRdvMode(true);
    }
  }, [productSearch, produitNom]);

  React.useEffect(() => {
    if (!isOpen) {
      setLocalRdvMode(false);
      setRdvDate('');
      setRdvConflict({ busy: false });
    }
  }, [isOpen]);

  // Vérification créneau dans rdv-taches.json
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

  // Autocompletes du modal de complétion
  const [personneQuery, setPersonneQuery] = React.useState('');
  const [personneOptions, setPersonneOptions] = React.useState<Array<{ id: string; nom: string; prenom: string; phone?: string }>>([]);
  const [showPersonneList, setShowPersonneList] = React.useState(false);
  const [tacheQuery, setTacheQuery] = React.useState('');
  const [tacheOptions, setTacheOptions] = React.useState<Array<{ id: string; nom: string }>>([]);
  const [showTacheList, setShowTacheList] = React.useState(false);
  const [allTaches, setAllTaches] = React.useState<Array<{ id: string; nom: string }>>([]);
  const [createdCommandeId, setCreatedCommandeId] = React.useState<string | null>(null);

  // Recherche travailleurs (3 caractères min)
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

  // Charger toutes les tâches RDV à l'ouverture du modal complétion
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
    if (rdvConflict.busy) {
      toast.error('Créneau occupé');
      return;
    }
    try {
      setSubmittingRdv(true);
      const heureFin = computedHeureFin || horaire;
      // 1) Pré-enregistrer dans rdv-taches.json
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

      // 2) Enregistrer la commande (type='rdv') en liant le rdvTacheId
      let newCommandeId: string | null = null;
      try {
        const cmdResp: any = await commandeApi.create({
          clientNom,
          clientPhone,
          clientAddress,
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
        if (newId) {
          try { await rdvTachesApi.delete(newId); } catch {}
        }
        throw err;
      }
      setCreatedCommandeId(newCommandeId);

      setRdvTacheNom('');
      setTacheQuery('');
      setRdvPersonneNom('');
      setPersonneQuery('');
      setRdvCommentaires('');
      setRdvStatut('planifie');
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



  // Réinitialiser la photo client quand le dialogue se ferme ou que le nom change manuellement
  React.useEffect(() => {
    if (!isOpen) setSelectedClientPhoto(null);
  }, [isOpen]);

  const onClientPick = (client: Client) => {
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
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
          {/* Section Client Premium */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 shadow-[0_8px_30px_rgba(59,130,246,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow-lg">
                <Crown className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Client Premium
                <Star className="h-5 w-5 text-yellow-500" />
              </span>
            </h3>

            {/* Photo du client (si disponible) */}
            {clientPhotoUrl && (
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-md opacity-70" />
                  <img
                    src={clientPhotoUrl}
                    alt={clientNom || 'Client'}
                    className="relative w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="clientNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                  👤 Nom du Client
                </Label>
                {clientNom && clientNom.length >= 2 && currentClientCaracteristique && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${currentClientCaracteristique.badgeClass}`}
                  >
                    {currentClientCaracteristique.label}
                  </span>
                )}
              </div>
              <Input
                id="clientNom"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClientNom(e.target.value);
                  setShowClientSuggestions(e.target.value.length >= 3);
                  if (e.target.value.length < 3) setSelectedClientPhoto(null);
                }}
                placeholder="Saisir au moins 3 caractères..."
                className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                required
              />
              {showClientSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      onClick={() => onClientPick(client)}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{client.nom}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        📱 {client.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📞 Téléphone
                </Label>
                {clientPhones.length > 1 ? (
                  <Select value={clientPhone} onValueChange={setClientPhone}>
                    <SelectTrigger className="w-full border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm">
                      <SelectValue placeholder="Choisir un numéro" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientPhones.map((phone, idx) => (
                        <SelectItem key={idx} value={phone}>
                          {phone} {idx === 0 ? '(principal)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Numéro de téléphone"
                    className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="clientAddress" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  🏠 Adresse
                </Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Adresse complète"
                  className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Produit Premium */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 border-2 border-purple-300 dark:border-purple-700 shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-lg">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Produits Elite
                <Sparkles className="h-5 w-5 text-pink-500" />
              </span>
            </h3>

            {/* Filtre par catégorie */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Filter className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filtre :</span>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProductCategoryFilter(option.value)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 border ${productCategoryFilter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Photo principale du produit (si disponible) */}
            {productPhotoUrl && (
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-2xl blur-md opacity-70" />
                  <img
                    src={productPhotoUrl}
                    alt={selectedProduct?.description || 'Produit'}
                    className="relative w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Label htmlFor="produitNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                📦 Nom du Produit
              </Label>
              <Input
                id="produitNom"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProduitNom(e.target.value);
                  setShowProductSuggestions(e.target.value.length >= 3);
                }}
                placeholder="Saisir au moins 3 caractères..."
                className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
              />
              {showProductSuggestions && categoryFilteredProducts.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {categoryFilteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{product.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <span>💰 {product.purchasePrice}€</span>
                        <span>📊 Stock: {product.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prixUnitaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  💵 Prix Unitaire (€)
                </Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  step="0.01"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  placeholder="Prix d'achat"
                  className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                />
              </div>

              <div>
                <Label htmlFor="quantite" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📊 Quantité {selectedProduct && `(disponible: ${availableQuantityForSelected !== null && availableQuantityForSelected !== undefined ? availableQuantityForSelected : selectedProduct.quantity})`}
                </Label>
                <SaleQuantityInput
                  quantity={quantite}
                  onChange={setQuantite}
                  maxQuantity={availableQuantityForSelected !== null && availableQuantityForSelected !== undefined ? availableQuantityForSelected : selectedProduct?.quantity}
                  showAvailableStock={false}
                />
              </div>

              <div>
                <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  💎 Prix de Vente (€)
                </Label>
                <Input
                  id="prixVente"
                  type="number"
                  step="0.01"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  placeholder="Prix de vente"
                  className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddProduit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              {editingProductIndex !== null ? 'Modifier ce produit' : 'Ajouter ce produit au panier'}
            </Button>

            {/* Liste des produits dans le panier */}
            {produitsListe.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🛒 Panier ({produitsListe.length} produit{produitsListe.length > 1 ? 's' : ''})
                </Label>
                <div className="space-y-2">
                  {produitsListe.map((produit, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all ${editingProductIndex === index
                          ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800'
                          : 'border-purple-200 dark:border-purple-700'
                        }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {produit.nom}
                          {editingProductIndex === index && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                              En édition
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qté: {produit.quantite} | Prix unitaire: {produit.prixUnitaire}€ | Prix vente: {produit.prixVente}€
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduit(index)}
                          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300"
                          title="Modifier ce produit"
                        >
                          <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduit(index)}
                          className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl transition-all duration-300"
                          title="Retirer ce produit"
                        >
                          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Type et Date */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-green-300 dark:border-green-700 shadow-[0_8px_30px_rgba(34,197,94,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-green-700 dark:text-green-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm shadow-lg">
                <Award className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Type & Planification
                <Zap className="h-5 w-5 text-yellow-500" />
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📋 Type
                </Label>
                <Select
                  value={localRdvMode ? 'rdv' : type}
                  onValueChange={(value: string) => {
                    if (value === 'rdv') {
                      setLocalRdvMode(true);
                      setType('rdv');
                    } else {
                      setLocalRdvMode(false);
                      setType(value as 'commande' | 'reservation');
                    }
                  }}
                >
                  <SelectTrigger className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commande">📦 Commande</SelectItem>
                    <SelectItem value="reservation">📅 Réservation</SelectItem>
                    <SelectItem value="rdv">🗓️ RDV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localRdvMode ? (
                <div>
                  <Label htmlFor="rdvDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📅 Date du RDV
                  </Label>
                  <Input
                    id="rdvDate"
                    type="date"
                    value={rdvDate}
                    onChange={(e) => setRdvDate(e.target.value)}
                    className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                </div>
              ) : type === 'commande' ? (
                <div>
                  <Label htmlFor="dateArrivagePrevue" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📅 Date d'arrivage prévue
                  </Label>
                  <Input
                    id="dateArrivagePrevue"
                    type="date"
                    value={dateArrivagePrevue}
                    onChange={(e) => setDateArrivagePrevue(e.target.value)}
                    className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="dateEcheance" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📅 Date d'échéance
                  </Label>
                  <Input
                    id="dateEcheance"
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="horaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ⏰ Horaire (optionnel)
                </Label>
                {!showHeureFin && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHeureFin(true)}
                    className="h-7 px-2 border-green-400 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    title="Définir une heure de fin personnalisée"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Heure fin
                  </Button>
                )}
              </div>
              <div className={showHeureFin ? "grid grid-cols-2 gap-3" : ""}>
                <Input
                  id="horaire"
                  type="time"
                  value={horaire}
                  onChange={(e) => setHoraire(e.target.value)}
                  className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                  placeholder="Heure de début"
                />
                {showHeureFin && (
                  <div className="relative">
                    <Input
                      id="horaireFin"
                      type="time"
                      value={horaireFin}
                      onChange={(e) => setHoraireFin?.(e.target.value)}
                      className="border-2 border-emerald-400 dark:border-emerald-600 focus:border-emerald-500 bg-white dark:bg-gray-900 shadow-sm pr-9"
                      placeholder="Heure de fin"
                    />
                    <button
                      type="button"
                      onClick={() => { setHoraireFin?.(''); setShowHeureFin(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                      title="Retirer (auto +1h)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {!showHeureFin && horaire && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Heure de fin auto: +1h après {horaire}
                </p>
              )}
            </div>
          </div>

          {/* Alerte indisponibilité */}
          {!availability.disponible && (
            <div className="p-4 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 shadow">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-red-700 dark:text-red-300 text-sm">🚫 Créneau indisponible</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{availability.message}</p>
                  {availability.suggestions && availability.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availability.suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setHoraire(s.heureDebut); setHoraireFin?.(s.heureFin); setShowHeureFin(true); }}
                          className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 transition"
                        >
                          ✅ {s.label} ({s.heureDebut} - {s.heureFin})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alerte conflit RDV (rdv-taches.json) */}
          {localRdvMode && rdvConflict.busy && (
            <div className="p-4 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 shadow">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-red-700 dark:text-red-300 text-sm">🚫 Créneau RDV occupé</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{rdvConflict.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="border-2 border-gray-300 dark:border-gray-700"
            >
              Annuler
            </Button>
            {localRdvMode ? (
              !rdvConflict.busy && (
                <Button
                  type="submit"
                  disabled={submittingRdv || !rdvDate || !horaire || !clientNom}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg disabled:opacity-50"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Créer la commande (RDV)
                </Button>
              )
            ) : (
              <Button
                type="submit"
                disabled={!availability.disponible}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCommande ? 'Modifier' : 'Créer'} la {type === 'commande' ? 'commande' : 'réservation'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>

      {/* Modal complétion RDV (rdv-taches.json) */}
      <Dialog open={rdvModalOpen} onOpenChange={setRdvModalOpen}>
        <DialogContent
          className="
      w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto
      p-4 sm:p-6
      bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40
      dark:from-gray-900 dark:via-emerald-900/30 dark:to-teal-900/30
      border-2 border-emerald-300/60 dark:border-emerald-700/60
      rounded-2xl
    "
        >
          <DialogHeader className="space-y-2">
            <DialogTitle
              className="
          text-lg sm:text-xl md:text-2xl font-black
          bg-gradient-to-r from-emerald-600 to-teal-600
          bg-clip-text text-transparent
          flex items-center gap-2
        "
            >
              <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />

              <span className="break-words">
                Compléter le rendez-vous
              </span>
            </DialogTitle>

            <DialogDescription className="text-sm leading-relaxed">
              Les informations client, date et horaires sont déjà enregistrées.
              Complétez le reste pour créer le RDV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">

            {/* Infos client + créneau */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

              <div
                className="
            p-3 sm:p-4 rounded-xl
            bg-emerald-50 dark:bg-emerald-900/30
            border border-emerald-200 dark:border-emerald-700
            min-w-0
          "
              >
                <div className="text-xs text-muted-foreground mb-1">
                  👤 Client
                </div>

                <div className="font-semibold break-words">
                  {clientNom}
                </div>

                <div className="text-xs break-all">
                  {clientPhone}
                </div>

                <div className="text-xs break-words">
                  {clientAddress}
                </div>
              </div>

              <div
                className="
            p-3 sm:p-4 rounded-xl
            bg-emerald-50 dark:bg-emerald-900/30
            border border-emerald-200 dark:border-emerald-700
          "
              >
                <div className="text-xs text-muted-foreground mb-1">
                  📅 Créneau
                </div>

                <div className="font-semibold break-words">
                  {rdvDate}
                </div>

                <div className="text-xs">
                  {horaire} → {computedHeureFin || horaire}
                </div>
              </div>
            </div>

            {/* Responsable */}
            <div className="relative">
              <Label className="text-sm font-semibold">
                👥 Personne responsable
              </Label>

              <Input
                className="mt-1"
                value={personneQuery}
                onChange={(e) => {
                  setPersonneQuery(e.target.value);
                  setShowPersonneList(true);
                  setRdvPersonneNom(e.target.value);
                }}
                onFocus={() => setShowPersonneList(true)}
                placeholder="Tapez au moins 3 caractères du nom..."
              />

              {showPersonneList &&
                personneQuery.trim().length >= 3 &&
                personneOptions.length > 0 && (
                  <div
                    className="
                absolute z-50 mt-1 w-full max-h-52 overflow-auto
                rounded-xl border
                bg-white dark:bg-gray-900
                shadow-xl
              "
                  >
                    {personneOptions.map((p) => {
                      const full = `${p.prenom || ""} ${p.nom || ""}`.trim();

                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setRdvPersonneNom(full);
                            setPersonneQuery(full);
                            setShowPersonneList(false);
                          }}
                          className="
                      block w-full text-left
                      px-3 py-3 text-sm
                      hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                      transition-colors
                      break-words
                    "
                        >
                          {full} {p.phone ? `— ${p.phone}` : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Tâche */}
            <div className="relative">
              <Label className="text-sm font-semibold">
                ✂️ Tâche
              </Label>

              <Input
                className="mt-1"
                value={tacheQuery}
                onChange={(e) => {
                  setTacheQuery(e.target.value);
                  setShowTacheList(true);
                  setRdvTacheNom(e.target.value);
                }}
                onFocus={() => setShowTacheList(true)}
                placeholder="Tapez 1 caractère pour voir la liste..."
              />

              {showTacheList && tacheOptions.length > 0 && (
                <div
                  className="
              absolute z-50 mt-1 w-full max-h-52 overflow-auto
              rounded-xl border
              bg-white dark:bg-gray-900
              shadow-xl
            "
                >
                  {tacheOptions.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setRdvTacheNom(t.nom);
                        setTacheQuery(t.nom);
                        setShowTacheList(false);
                      }}
                      className="
                  block w-full text-left
                  px-3 py-3 text-sm
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                  transition-colors
                  break-words
                "
                    >
                      {t.nom}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Commentaires */}
            <div>
              <Label className="text-sm font-semibold">
                📝 Commentaires
              </Label>

              <Textarea
                className="mt-1 resize-none"
                value={rdvCommentaires}
                onChange={(e) => setRdvCommentaires(e.target.value)}
                placeholder="Commentaires éventuels"
                rows={4}
              />
            </div>

            {/* Statut */}
            <div>
              <Label className="text-sm font-semibold">
                🚦 Statut
              </Label>

              <Select
                value={rdvStatut}
                onValueChange={(v: any) => setRdvStatut(v)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="planifie">
                    Planifié
                  </SelectItem>

                  <SelectItem value="confirme">
                    Confirmé
                  </SelectItem>

                  <SelectItem value="reporte">
                    Reporté
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div
              className="
          flex flex-col-reverse sm:flex-row
          justify-end gap-3 pt-2
        "
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setRdvModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Fermer
              </Button>

              <Button
                type="button"
                onClick={handleSubmitRdvCompletion}
                disabled={submittingRdv || !rdvTacheNom}
                className="
            w-full sm:w-auto
            bg-gradient-to-r from-emerald-600 to-teal-600
            text-white
          "
              >
                Créer le RDV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CommandeFormDialog;
