/**
 * =============================================================================
 * useCommandesLogic - Hook de logique métier pour CommandesPage
 * =============================================================================
 * 
 * Extrait toute la logique de CommandesPage : chargement des données,
 * gestion des formulaires, soumission, suppression, changement de statut,
 * validation, annulation, report et création de RDV depuis réservation.
 * 
 * @module useCommandesLogic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Commande, CommandeProduit, CommandeStatut } from '@/types/commande';
import api from '@/service/api';
import { rdvFromReservationService } from '@/services/rdvFromReservationService';
import { realtimeService } from '@/services/realtimeService';
import { reservationRdvSyncService } from '@/services/reservationRdvSyncService';
import tacheApi from '@/services/api/tacheApi';
import rdvTachesApi from '@/services/api/rdvTachesApi';
import rdvApiService from '@/services/api/rdvApi';
import type { Sale } from '@/types/sale';
import { computeClientCaracteristique } from '@/utils/clientCharacteristic';
import { confirmationRdvApi, type ConfirmationRdvEntry } from '@/services/api/confirmationRdvApi';
import { computeLockStateForCommande, autoCancelCommandeIfNeeded } from '@/utils/rdvConfirmationLock';

// ============================================================================
// Types locaux
// ============================================================================

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones?: string[];
  adresse: string;
}

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
}

// ============================================================================
// Hook principal
// ============================================================================

export const useCommandesLogic = () => {
  // =========================================================================
  // États principaux
  // =========================================================================
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  
  // =========================================================================
  // États du formulaire client
  // =========================================================================
  const [clientNom, setClientNom] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPhones, setClientPhones] = useState<string[]>([]);
  const [clientAddress, setClientAddress] = useState('');
  const [clientVille, setClientVille] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  
  // =========================================================================
  // États du formulaire type et dates
  // =========================================================================
  const [type, setType] = useState<'commande' | 'reservation' | 'rdv'>('commande');
  const [dateArrivagePrevue, setDateArrivagePrevue] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [horaire, setHoraire] = useState('');
  const [horaireFin, setHoraireFin] = useState('');
  
  // =========================================================================
  // États du formulaire produits
  // =========================================================================
  const [produitNom, setProduitNom] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixVente, setPrixVente] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  // === Nouveaux champs produit: réduction et livraison ===
  const [productReduction, setProductReduction] = useState<string>('');
  const [productReductionType, setProductReductionType] = useState<'' | 'amount' | 'percent'>('');
  const [productDeliveryLocation, setProductDeliveryLocation] = useState<string>('');
  const [productDeliveryFee, setProductDeliveryFee] = useState<string>('0');
  const [productBaseDeliveryFee, setProductBaseDeliveryFee] = useState<number | null>(null);
  
  // =========================================================================
  // États de recherche et tri
  // =========================================================================
  const [commandeSearch, setCommandeSearch] = useState('');
  const [sortDateAsc, setSortDateAsc] = useState(true);
  
  // =========================================================================
  // États des modales de confirmation
  // =========================================================================
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // =========================================================================
  // États export PDF
  // =========================================================================
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDate, setExportDate] = useState('');
  
  // =========================================================================
  // États modale Reporter
  // =========================================================================
  const [reporterModalOpen, setReporterModalOpen] = useState(false);
  const [reporterCommandeId, setReporterCommandeId] = useState<string | null>(null);
  const [reporterDate, setReporterDate] = useState('');
  const [reporterHoraire, setReporterHoraire] = useState('');
  const [reporterHoraireFin, setReporterHoraireFin] = useState('');

  // =========================================================================
  // Réservation ultérieure
  // =========================================================================
  const [ulterieurConfig, setUlterieurConfig] = useState<{ mode: 'date' | 'inconnu'; date?: string } | null>(null);
  const [ulterieurModalOpen, setUlterieurModalOpen] = useState(false);
  const [ulterieurTransitionId, setUlterieurTransitionId] = useState<string | null>(null);
  const [reporterRdvBusy, setReporterRdvBusy] = useState<{ busy: boolean; message?: string }>({ busy: false });
  
  // =========================================================================
  // États création RDV depuis réservation
  // =========================================================================
  const [showRdvConfirmDialog, setShowRdvConfirmDialog] = useState(false);
  const [showRdvFormModal, setShowRdvFormModal] = useState(false);
  const [pendingReservationForRdv, setPendingReservationForRdv] = useState<Commande | null>(null);
  const [isRdvLoading, setIsRdvLoading] = useState(false);

  // =========================================================================
  // États conflit tâche lors création RDV
  // =========================================================================
  const [showTacheConflictModal, setShowTacheConflictModal] = useState(false);
  const [conflictingTache, setConflictingTache] = useState<any>(null);
  const [pendingTacheData, setPendingTacheData] = useState<any>(null);

  // =========================================================================
  // États modale réservation en retard (auto-validation)
  // =========================================================================
  const [overdueReservation, setOverdueReservation] = useState<Commande | null>(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [overdueProcessedIds, setOverdueProcessedIds] = useState<Set<string>>(new Set());

  // =========================================================================
  // Modale planification d'arrivée (statut "arrive" → RDV + tâche)
  // =========================================================================
  const [arriveePlanifId, setArriveePlanifId] = useState<string | null>(null);


  // =========================================================================
  // Helper: sync rdv-taches.json depuis une commande de type 'rdv'
  // =========================================================================
  const mapStatutToRdvTache = (statut: CommandeStatut): 'planifie' | 'confirme' | 'annule' | 'reporte' | 'termine' => {
    switch (statut) {
      case 'valide': return 'termine';
      case 'annule': return 'annule';
      case 'reporter': return 'reporte';
      case 'en_attente': return 'planifie';
      case 'en_route': return 'confirme';
      case 'arrive': return 'confirme';
      default: return 'planifie';
    }
  };

  const syncRdvTacheForCommande = useCallback(async (
    commande: Commande,
    payload: { statut?: CommandeStatut; date?: string; heureDebut?: string; heureFin?: string }
  ) => {
    if (!commande || commande.type !== 'rdv') return;
    try {
      const update: any = {};
      if (payload.statut) update.statut = mapStatutToRdvTache(payload.statut);
      if (payload.date) update.date = payload.date;
      if (payload.heureDebut) update.heureDebut = payload.heureDebut;
      if (payload.heureFin) update.heureFin = payload.heureFin;
      await rdvTachesApi.updateByCommande(commande.id, update);
    } catch (err) {
      console.warn('Sync rdv-taches échouée:', err);
    }
  }, []);

  // =========================================================================
  // Vérification disponibilité créneau RDV lors du report (rdv-taches.json)
  // =========================================================================
  useEffect(() => {
    if (!reporterModalOpen) { setReporterRdvBusy({ busy: false }); return; }
    const commande = commandes.find(c => c.id === reporterCommandeId);
    if (!commande || commande.type !== 'rdv') { setReporterRdvBusy({ busy: false }); return; }
    if (!reporterDate || !reporterHoraire || !reporterHoraireFin) { setReporterRdvBusy({ busy: false }); return; }
    let cancel = false;
    const t = setTimeout(async () => {
      try {
        const resp: any = await rdvTachesApi.getByDate(reporterDate);
        const items: any[] = Array.isArray(resp) ? resp : (resp?.data || []);
        const toMin = (x: string) => { const [h, m] = x.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
        const s = toMin(reporterHoraire);
        const e = toMin(reporterHoraireFin);
        if (e <= s) { if (!cancel) setReporterRdvBusy({ busy: true, message: 'Heure de fin doit être après le début' }); return; }
        const conflict = items.find((r: any) => {
          if (r.id === commande.rdvTacheId) return false;
          if (r.statut === 'annule' || r.statut === 'termine') return false;
          const rs = toMin(r.heureDebut); const re = toMin(r.heureFin);
          return s < re && e > rs;
        });
        if (!cancel) {
          if (conflict) setReporterRdvBusy({ busy: true, message: `Créneau occupé par "${conflict.tacheNom}" (${conflict.heureDebut} - ${conflict.heureFin})` });
          else setReporterRdvBusy({ busy: false });
        }
      } catch { if (!cancel) setReporterRdvBusy({ busy: false }); }
    }, 250);
    return () => { cancel = true; clearTimeout(t); };
  }, [reporterModalOpen, reporterCommandeId, reporterDate, reporterHoraire, reporterHoraireFin, commandes]);


  // =========================================================================
  // Fonctions de chargement des données
  // =========================================================================

  const fetchCommandes = async () => {
    try {
      const response = await api.get('/api/commandes');
      setCommandes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching commandes:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await api.get('/api/sales');
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  // =========================================================================
  // Effets
  // =========================================================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCommandes(), fetchClients(), fetchProducts(), fetchSales()]);
      setIsLoading(false);
    };
    loadData();
    const interval = setInterval(checkNotifications, 60000);

    // Realtime: refetch commandes when DB pushes commandes.json change via SSE
    let unsubscribe: (() => void) | undefined;
    try {
      realtimeService.connect();
      unsubscribe = realtimeService.addSyncListener((event: any) => {
        const t = event?.data?.type;
        if (event?.type === 'data-changed' && (t === 'commandes' || t === 'sales' || t === 'clients' || t === 'products')) {
          if (t === 'commandes') fetchCommandes();
          if (t === 'sales') fetchSales();
          if (t === 'clients') fetchClients();
          if (t === 'products') fetchProducts();
        }
        if (event?.type === 'force-sync') {
          fetchCommandes();
        }
      });
    } catch (e) {
      // ignore
    }

    return () => {
      clearInterval(interval);
      try { unsubscribe?.(); } catch {}
      try { realtimeService.disconnect(); } catch {}
    };
  }, []);

  // =========================================================================
  // Détection des réservations en retard (date+horaire dépassé de 30 min)
  // Le champ overdueTimerStart est persisté en DB pour survivre aux déconnexions
  // =========================================================================
  useEffect(() => {
    if (isLoading || commandes.length === 0) return;

    const checkOverdue = async () => {
      const now = new Date();

      // Chercher une réservation en retard non encore traitée
      const overdue = commandes.find(c => {
        if (c.type !== 'reservation') return false;
        if (c.statut === 'valide' || c.statut === 'annule') return false;
        if (overdueProcessedIds.has(c.id)) return false;

        const reservationDate = c.dateEcheance || c.dateCommande;
        if (!reservationDate) return false;

        // Construire le datetime de la réservation
        let reservationTime: Date;
        if (c.horaire) {
          const [heure] = c.horaire.split('-').map(h => h?.trim());
          const [h, m] = (heure || '00:00').split(':').map(Number);
          reservationTime = new Date(reservationDate + 'T' + `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
        } else {
          reservationTime = new Date(reservationDate + 'T00:00:00');
        }

        // Vérifier si dépassé de 30 minutes
        const diffMs = now.getTime() - reservationTime.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes >= 30;
      });

      if (overdue && !showOverdueModal) {
        // Persister overdueTimerStart en DB si pas encore fait
        if (!overdue.overdueTimerStart) {
          try {
            const timerStart = new Date().toISOString();
            await api.put(`/api/commandes/${overdue.id}`, { overdueTimerStart: timerStart });
            overdue.overdueTimerStart = timerStart;
          } catch (err) {
            console.error('Erreur sauvegarde overdueTimerStart:', err);
          }
        }
        setOverdueReservation(overdue);
        setShowOverdueModal(true);
      }
    };

    // Vérifier immédiatement puis toutes les 60 secondes
    checkOverdue();
    const overdueInterval = setInterval(checkOverdue, 60000);
    return () => clearInterval(overdueInterval);
  }, [commandes, isLoading, overdueProcessedIds, showOverdueModal]);

  // =========================================================================
  // Handlers pour la modale réservation en retard
  // =========================================================================

  /** Valider une réservation en retard (manuelle ou auto) */
  const handleOverdueValidate = useCallback(async (id: string) => {
    setShowOverdueModal(false);
    setOverdueProcessedIds(prev => new Set(prev).add(id));
    setValidatingId(id);
    // Appeler directement confirmValidation via setValidatingId
    // puis la validation sera faite par le bouton existant ou auto
    // On va directement appeler la logique de validation
    const commandeToValidate = commandes.find(c => c.id === id);
    if (!commandeToValidate) return;
    try {
      for (const p of commandeToValidate.produits) {
        const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (existingProduct && existingProduct.quantity < p.quantite) {
          toast({ title: 'Stock insuffisant', description: `Stock disponible pour ${p.nom}: ${existingProduct.quantity} unités`, className: "bg-app-red text-white", variant: 'destructive' });
          setValidatingId(null);
          return;
        }
      }
      const today = new Date().toISOString().split('T')[0];
      const saleProducts = [];
      let totalSellingPrice = 0;
      let totalPurchasePrice = 0;
      for (const p of commandeToValidate.produits) {
        let product = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (!product) { const newProductResponse = await api.post('/api/products', { description: p.nom, purchasePrice: p.prixUnitaire, quantity: p.quantite }); product = newProductResponse.data; }
        const rawSelling = p.prixVente * p.quantite;
        const reduc = (p.reduction || 0) > 0 && p.reductionType
          ? (p.reductionType === 'percent' ? (p.prixVente * (p.reduction as number) / 100) * p.quantite : (p.reduction as number) * p.quantite)
          : 0;
        const sellingPrice = Math.max(0, rawSelling - reduc);
        const purchasePrice = p.prixUnitaire * p.quantite;
        const delFee = Number(p.deliveryFee || 0);
        const delLoc = p.deliveryLocation || "Saint-Denis";
        saleProducts.push({ productId: product.id, description: p.nom, quantitySold: p.quantite, purchasePrice, sellingPrice, profit: sellingPrice - purchasePrice, deliveryFee: delFee, deliveryLocation: delLoc, reduction: p.reduction || 0, reductionType: p.reductionType || '' });
        totalSellingPrice += sellingPrice;
        totalPurchasePrice += purchasePrice;
      }
      const saleData = { date: today, products: saleProducts, totalPurchasePrice, totalSellingPrice, totalProfit: totalSellingPrice - totalPurchasePrice, clientName: commandeToValidate.clientNom, clientAddress: commandeToValidate.clientAddress, clientPhone: commandeToValidate.clientPhone, reste: 0, nextPaymentDate: null };

      await reservationRdvSyncService.syncRdvStatus(id, 'valide');
      await syncTacheForCommande(id, 'valide');

      const saleResponse = await api.post('/api/sales', saleData);
      const createdSale = saleResponse.data;
      await api.put(`/api/commandes/${id}`, { statut: 'valide', saleId: createdSale.id });

      // Dé-réserver les produits
      for (const p of commandeToValidate.produits) {
        const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (existingProduct) {
          const newQuantity = Math.max(0, existingProduct.quantity - p.quantite);
          try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non', quantity: newQuantity }); } catch (err) { console.error('Erreur dé-réservation:', err); }
        }
      }

      toast({ title: '✅ Réservation validée', description: `Réservation de ${commandeToValidate.clientNom} validée et enregistrée comme vente`, className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]);
    } catch (error) {
      console.error('Error auto-validating:', error);
      toast({ title: 'Erreur', description: 'Impossible de valider automatiquement', className: "bg-app-red text-white", variant: 'destructive' });
    }
    setValidatingId(null);
  }, [commandes, products]);

  /** Annuler une réservation en retard */
  const handleOverdueCancel = useCallback(async (id: string) => {
    setShowOverdueModal(false);
    setOverdueProcessedIds(prev => new Set(prev).add(id));
    try {
      await api.put(`/api/commandes/${id}`, { statut: 'annule' });
      await reservationRdvSyncService.syncRdvStatus(id, 'annule');
      await syncTacheForCommande(id, 'annule');
      toast({ title: '❌ Réservation annulée', description: 'La réservation a été annulée', className: "bg-app-red text-white" });
      fetchCommandes();
    } catch (error) {
      console.error('Error cancelling overdue:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'annuler', className: "bg-app-red text-white", variant: 'destructive' });
    }
  }, []);

  /** Reporter une réservation en retard → ouvre la modale Reporter */
  const handleOverduePostpone = useCallback((id: string) => {
    setShowOverdueModal(false);
    setOverdueProcessedIds(prev => new Set(prev).add(id));
    setReporterCommandeId(id);
    setReporterModalOpen(true);
  }, []);

  const extractStartTime = (horaire?: string) => {
    const [heure] = String(horaire || '').split('-').map(part => part?.trim());
    return heure || '';
  };

  const getOneHourLater = (heureDebut?: string) => {
    const safeHeureDebut = extractStartTime(heureDebut) || '09:00';
    const [hours, minutes] = safeHeureDebut.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    return `${endHours.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // Mémos de filtrage
  // =========================================================================

  // ---------------------------------------------------------------------------
  // Verrouillage automatique lié à la confirmation des RDV (24h → 1h → annulé)
  // ---------------------------------------------------------------------------
  const [confirmationEntries, setConfirmationEntries] = useState<ConfirmationRdvEntry[]>([]);
  const [lockTick, setLockTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      confirmationRdvApi.getAll()
        .then(d => { if (!cancelled) setConfirmationEntries(d); })
        .catch(() => {});
    };
    load();
    const id = setInterval(() => { setLockTick(t => t + 1); load(); }, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Auto-annuler côté serveur les commandes qui passent en "cancelled"
  useEffect(() => {
    commandes.forEach(c => {
      const s = computeLockStateForCommande(c as any, confirmationEntries);
      autoCancelCommandeIfNeeded(c as any, s);
    });
  }, [commandes, confirmationEntries, lockTick]);

  const lockedCommandeIds = useMemo(() => {
    const ids = new Set<string>();
    commandes.forEach(c => {
      if (computeLockStateForCommande(c as any, confirmationEntries) === 'locked') {
        ids.add(c.id);
      }
    });
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandes, confirmationEntries, lockTick]);

  const filteredCommandes = useMemo(() => {
    // Masquer uniquement les commandes en état 'hidden' (≤ 1h avant RDV, auto-annulées)
    const commandesVisibles = commandes.filter(c => {
      const s = computeLockStateForCommande(c as any, confirmationEntries);
      return s !== 'hidden';
    });

    const commandesToFilter = commandeSearch.length >= 3 
      ? commandesVisibles 
      : commandesVisibles.filter(c => c.statut !== 'valide' && c.statut !== 'annule');
    
    let filtered = commandesToFilter;
    if (commandeSearch.length >= 3) {
      const searchLower = commandeSearch.toLowerCase();
      filtered = commandesToFilter.filter(commande => 
        commande.clientNom.toLowerCase().includes(searchLower) ||
        commande.clientPhone.includes(searchLower) ||
        commande.produits.some(p => p.nom.toLowerCase().includes(searchLower))
      );
    }
    
    return [...filtered].sort((a, b) => {
      const dateStrA = a.type === 'commande' ? a.dateArrivagePrevue || '' : a.dateEcheance || '';
      const dateStrB = b.type === 'commande' ? b.dateArrivagePrevue || '' : b.dateEcheance || '';
      const dateA = new Date(dateStrA);
      const dateB = new Date(dateStrB);
      const dateDiff = sortDateAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      if (dateDiff === 0) {
        const horaireA = a.horaire || '23:59';
        const horaireB = b.horaire || '23:59';
        return sortDateAsc ? horaireA.localeCompare(horaireB) : horaireB.localeCompare(horaireA);
      }
      return dateDiff;
    });
  }, [commandes, commandeSearch, sortDateAsc, confirmationEntries, lockTick]);

  const filteredClients = useMemo(() => {
    if (clientSearch.length < 3) return [];
    return clients.filter(client => client.nom.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clientSearch, clients]);

  const currentClientCaracteristique = useMemo(
    () => computeClientCaracteristique(clientNom, clients, sales, commandes),
    [clientNom, clients, sales, commandes]
  );

  const filteredProducts = useMemo(() => {
    if (productSearch.length < 3) return [];
    // Calculer la quantité réservée par produit (par nom) dans les commandes actives
    const reservedQuantityByName = new Map<string, number>();
    commandes.forEach(commande => {
      if (editingCommande && commande.id === editingCommande.id) return;
      if (commande.statut === 'valide' || commande.statut === 'annule') return;
      commande.produits.forEach(produit => {
        const key = produit.nom.toLowerCase();
        reservedQuantityByName.set(key, (reservedQuantityByName.get(key) || 0) + produit.quantite);
      });
    });
    return products.filter((product: any) => {
      const matchesSearch = product.description.toLowerCase().includes(productSearch.toLowerCase());
      if (!matchesSearch) return false;
      const reservedQty = reservedQuantityByName.get(product.description.toLowerCase()) || 0;
      const availableQty = (product.quantity || 0) - reservedQty;
      const pendingQty = Array.isArray(product.achats)
        ? product.achats.reduce((sum: number, a: any) => (a && a.disponible === false ? sum + (Number(a.quantity) || 0) : sum), 0)
        : 0;
      // Visible si dispo >= 1 OU indisponible (en attente) >= 1
      return availableQty >= 1 || pendingQty >= 1;
    });
  }, [productSearch, products, commandes, editingCommande]);

  const commandesForExportDate = useMemo(() => {
    if (!exportDate) return [];
    return commandes.filter(c => {
      const dateStr = c.type === 'commande' ? c.dateArrivagePrevue : c.dateEcheance;
      return dateStr === exportDate;
    }).sort((a, b) => (a.horaire || '23:59').localeCompare(b.horaire || '23:59'));
  }, [commandes, exportDate]);

  // =========================================================================
  // Gestion des notifications
  // =========================================================================

  const checkNotifications = useCallback(() => {
    const now = new Date();
    commandes.forEach((commande) => {
      if (commande.type === 'commande' && commande.statut === 'arrive' && !commande.notificationEnvoyee) {
        toast({ title: '📦 Produit arrivé!', description: `Contacter ${commande.clientNom} (${commande.clientPhone})` });
        updateNotificationStatus(commande.id);
      }
      if (commande.type === 'reservation' && commande.dateEcheance) {
        const echeance = new Date(commande.dateEcheance);
        if (now >= echeance && !commande.notificationEnvoyee) {
          toast({ title: '⏰ Réservation échue!', description: `Demander à ${commande.clientNom} s'il veut toujours ce produit` });
          updateNotificationStatus(commande.id);
        }
      }
    });
  }, [commandes]);

  const updateNotificationStatus = async (id: string) => {
    try {
      await api.put(`/api/commandes/${id}`, { notificationEnvoyee: true });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  // =========================================================================
  // Gestion de la sélection client/produit
  // =========================================================================

  const handleClientSelect = useCallback((client: Client) => {
    const phones = client.phones && client.phones.length > 0 ? client.phones : (client.phone ? [client.phone] : []);
    setClientNom(client.nom);
    setClientPhones(phones);
    setClientPhone(phones[0] || '');
    setClientAddress(client.adresse);
    setClientVille(((client as any).ville || '').trim());
    setClientSearch(client.nom);
    setShowClientSuggestions(false);
  }, []);

  // Calculer la quantité disponible d'un produit (stock - réservations actives)
  const getAvailableQuantityForProduct = useCallback((productDescription: string): number => {
    const product = products.find(p => p.description.toLowerCase() === productDescription.toLowerCase());
    if (!product) return 0;
    let reservedQty = 0;
    commandes.forEach(c => {
      if (editingCommande && c.id === editingCommande.id) return;
      if (c.statut === 'valide' || c.statut === 'annule') return;
      if (c.type !== 'reservation') return;
      c.produits.forEach(p => {
        if (p.nom.toLowerCase() === productDescription.toLowerCase()) {
          reservedQty += p.quantite;
        }
      });
    });
    return Math.max(0, product.quantity - reservedQty);
  }, [products, commandes, editingCommande]);

  // Quantité en attente (achats "indisponible" pas encore réceptionnés)
  const getPendingQuantityForProduct = useCallback((productDescription: string): number => {
    const product: any = products.find(p => p.description.toLowerCase() === productDescription.toLowerCase());
    if (!product || !Array.isArray(product.achats)) return 0;
    return product.achats.reduce((sum: number, a: any) => {
      if (a && a.disponible === false) return sum + (Number(a.quantity) || 0);
      return sum;
    }, 0);
  }, [products]);

  const [availableQuantityForSelected, setAvailableQuantityForSelected] = useState<number | null>(null);

  const handleProductSelect = useCallback((product: Product) => {
    setProduitNom(product.description);
    setPrixUnitaire(product.purchasePrice.toString());
    setProductSearch(product.description);
    setShowProductSuggestions(false);
    setSelectedProduct(product);
    const availQty = getAvailableQuantityForProduct(product.description);
    const pendingQty = getPendingQuantityForProduct(product.description);
    // On autorise à commander jusqu'à dispo + en attente d'arrivage
    setAvailableQuantityForSelected(availQty + pendingQty);
  }, [getAvailableQuantityForProduct, getPendingQuantityForProduct]);

  // =========================================================================
  // Validation et reset
  // =========================================================================

  const isFormValid = useCallback(() => {
    const hasDate = type === 'commande'
      ? dateArrivagePrevue.trim() !== ''
      : (ulterieurConfig ? true : dateEcheance.trim() !== '');
    return clientNom.trim() !== '' && clientPhone.trim() !== '' && clientAddress.trim() !== '' &&
      produitsListe.length > 0 && hasDate;
  }, [clientNom, clientPhone, clientAddress, produitsListe, type, dateArrivagePrevue, dateEcheance, ulterieurConfig]);

  const resetForm = useCallback(() => {
    setClientNom(''); setClientPhone(''); setClientAddress(''); setClientVille('');
    setProduitNom(''); setPrixUnitaire(''); setQuantite('1'); setPrixVente('');
    setDateArrivagePrevue(''); setDateEcheance(''); setHoraire(''); setHoraireFin('');
    setType('commande'); setClientSearch(''); setProductSearch('');
    setProduitsListe([]); setEditingCommande(null); setSelectedProduct(null); setEditingProductIndex(null);
    setAvailableQuantityForSelected(null);
    setProductReduction(''); setProductReductionType('');
    setProductDeliveryLocation(''); setProductDeliveryFee('0'); setProductBaseDeliveryFee(null);
    setUlterieurConfig(null);
  }, []);

  const resetProductFields = useCallback(() => {
    setProduitNom(''); setPrixUnitaire(''); setQuantite('1'); setPrixVente('');
    setProductSearch(''); setEditingProductIndex(null); setSelectedProduct(null); setAvailableQuantityForSelected(null);
    setProductReduction(''); setProductReductionType('');
    setProductDeliveryLocation(''); setProductDeliveryFee('0'); setProductBaseDeliveryFee(null);
  }, []);

  // =========================================================================
  // Gestion du panier de produits
  // =========================================================================

  const handleAddProduit = useCallback(() => {
    if (!produitNom.trim() || !prixUnitaire.trim() || !quantite.trim() || !prixVente.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs du produit', className: "bg-app-red text-white", variant: 'destructive' });
      return;
    }
    const quantiteInt = parseInt(quantite);
    const existingProduct = products.find(p => p.description.toLowerCase() === produitNom.toLowerCase());
    if (existingProduct) {
      const availableQty = getAvailableQuantityForProduct(produitNom);
      const pendingQty = getPendingQuantityForProduct(produitNom);
      const totalPossible = availableQty + pendingQty;
      if (totalPossible <= 0) {
        toast({ title: 'Stock insuffisant', description: `${produitNom} n'a plus de stock disponible ni de nouvel achat en cours`, className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
      if (quantiteInt > totalPossible) {
        toast({ title: 'Quantité insuffisante', description: `Disponible: ${availableQty} · En attente d'arrivage: ${pendingQty} · Total possible: ${totalPossible}`, className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
      if (quantiteInt > availableQty && pendingQty > 0) {
        const usePending = quantiteInt - availableQty;
        toast({ title: 'ℹ️ Utilise un nouvel achat en attente', description: `Disponible immédiat: ${availableQty} · À réceptionner: ${usePending}. Il faudra marquer ce nouvel achat comme "disponible" avant de pouvoir cliquer "Arrivé".` });
      }
    }

    const redVal = parseFloat(productReduction || '0') || 0;
    const redType = productReductionType || '';
    const delLoc = (productDeliveryLocation || '').trim();
    const delFee = parseFloat(productDeliveryFee || '0') || 0;
    const nouveauProduit: CommandeProduit = {
      nom: produitNom,
      prixUnitaire: parseFloat(prixUnitaire),
      quantite: quantiteInt,
      prixVente: parseFloat(prixVente),
      ...(redVal > 0 && redType ? { reduction: redVal, reductionType: redType } : {}),
      ...(delLoc ? { deliveryLocation: delLoc } : {}),
      ...(delFee || delLoc ? { deliveryFee: delFee } : {}),
      ...(productBaseDeliveryFee !== null ? { baseDeliveryFee: productBaseDeliveryFee } : {}),
    };
    if (editingProductIndex !== null) {
      const nouveauxProduits = [...produitsListe];
      nouveauxProduits[editingProductIndex] = nouveauProduit;
      setProduitsListe(nouveauxProduits);
      toast({ title: 'Produit modifié', description: `${nouveauProduit.nom} a été mis à jour` });
    } else {
      setProduitsListe([...produitsListe, nouveauProduit]);
      toast({ title: 'Produit ajouté', description: `${nouveauProduit.nom} ajouté au panier` });
    }
    resetProductFields();
  }, [produitNom, prixUnitaire, quantite, prixVente, products, editingProductIndex, produitsListe, resetProductFields, getAvailableQuantityForProduct, getPendingQuantityForProduct, productReduction, productReductionType, productDeliveryLocation, productDeliveryFee, productBaseDeliveryFee]);

  const handleEditProduit = useCallback((index: number) => {
    const produit = produitsListe[index];
    setProduitNom(produit.nom); setPrixUnitaire(produit.prixUnitaire.toString());
    setQuantite(produit.quantite.toString()); setPrixVente(produit.prixVente.toString());
    setProductSearch(produit.nom); setEditingProductIndex(index);
    const productFromList = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
    setSelectedProduct(productFromList || null);
    setProductReduction(produit.reduction ? String(produit.reduction) : '');
    setProductReductionType((produit.reductionType as any) || '');
    setProductDeliveryLocation(produit.deliveryLocation || '');
    setProductDeliveryFee(produit.deliveryFee !== undefined ? String(produit.deliveryFee) : '0');
    setProductBaseDeliveryFee(produit.baseDeliveryFee !== undefined ? produit.baseDeliveryFee : null);
  }, [produitsListe, products]);

  const handleRemoveProduit = useCallback((index: number) => {
    setProduitsListe(prev => prev.filter((_, i) => i !== index));
    if (editingProductIndex === index) resetProductFields();
    else if (editingProductIndex !== null && editingProductIndex > index) setEditingProductIndex(editingProductIndex - 1);
    toast({ title: 'Produit retiré', description: 'Le produit a été retiré du panier' });
  }, [editingProductIndex, resetProductFields]);

  // =========================================================================
  // Soumission du formulaire
  // =========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs et ajouter au moins un produit', className: "bg-app-red text-white", variant: 'destructive' });
      return;
    }
    // Vérifier doublon : même produit, même client, même date pour les réservations
    if (type === 'reservation' && !editingCommande) {
      const dateToCheck = dateEcheance;
      const isDuplicate = commandes.some(c => {
        if (c.statut === 'valide' || c.statut === 'annule') return false;
        if (c.type !== 'reservation') return false;
        if (c.clientNom.toLowerCase() !== clientNom.toLowerCase()) return false;
        if (c.dateEcheance !== dateToCheck) return false;
        return c.produits.some(cp => produitsListe.some(pl => pl.nom.toLowerCase() === cp.nom.toLowerCase()));
      });
      if (isDuplicate) {
        toast({ title: 'Doublon détecté', description: 'Ce client a déjà une réservation avec ce produit à cette date', className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
    }
    // Calcul de la caractéristique du client (avant éventuelle création)
    const caracBefore = computeClientCaracteristique(clientNom, clients, sales, commandes);
    const caracLabel = caracBefore?.label || 'Nouveau client';
    const commandeData: Partial<Commande> = { clientNom, clientPhone, clientAddress, type, produits: produitsListe, dateCommande: new Date().toISOString(), statut: type === 'commande' ? 'en_route' : 'en_attente', clientCaracteristique: caracLabel };
    if (type === 'commande') commandeData.dateArrivagePrevue = dateArrivagePrevue;
    else commandeData.dateEcheance = dateEcheance;
    if (horaire) commandeData.horaire = horaire;
    if (horaireFin) commandeData.horaireFin = horaireFin;

    // ✅ Réservation ultérieure : override
    if (type === 'reservation' && ulterieurConfig) {
      commandeData.statut = 'ulterieur';
      (commandeData as any).reservationUlterieure = true;
      (commandeData as any).expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      if (ulterieurConfig.mode === 'date' && ulterieurConfig.date) {
        (commandeData as any).ulterieurDate = ulterieurConfig.date;
        commandeData.dateEcheance = ulterieurConfig.date;
      } else {
        commandeData.dateEcheance = '';
      }
      commandeData.horaire = '';
      commandeData.horaireFin = '';
    }


    try {
      const existingClient = clients.find(c => c.nom.toLowerCase() === clientNom.toLowerCase());
      const villeTrim = (clientVille || '').trim();
      if (!existingClient) {
        await api.post('/api/clients', { nom: clientNom, phone: clientPhone, adresse: clientAddress, ville: villeTrim });
        await fetchClients();
      } else if (villeTrim && villeTrim !== ((existingClient as any).ville || '').trim()) {
        try {
          await api.put(`/api/clients/${(existingClient as any).id}`, {
            nom: existingClient.nom,
            phones: (existingClient as any).phones || ((existingClient as any).phone ? [(existingClient as any).phone] : []),
            addresses: (existingClient as any).addresses || ((existingClient as any).adresse ? [(existingClient as any).adresse] : []),
            ville: villeTrim,
          });
          await fetchClients();
        } catch (e) { console.error('Erreur maj ville client:', e); }
      }
      for (const produit of produitsListe) {
        const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
        if (!existingProduct) { await api.post('/api/products', { description: produit.nom, purchasePrice: produit.prixUnitaire, quantity: produit.quantite }); }
      }
      await fetchProducts();

      if (editingCommande) {
        // Dé-réserver les anciens produits qui ne sont plus dans la liste
        if (editingCommande.type === 'reservation') {
          for (const oldProduit of editingCommande.produits) {
            const stillInList = produitsListe.some(p => p.nom.toLowerCase() === oldProduit.nom.toLowerCase());
            if (!stillInList) {
              const existingProduct = products.find(p => p.description.toLowerCase() === oldProduit.nom.toLowerCase());
              if (existingProduct) {
                try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non' }); } catch (err) { console.error('Erreur dé-réservation ancien produit:', err); }
              }
            }
          }
        }
        await api.put(`/api/commandes/${editingCommande.id}`, commandeData);
        if (type === 'rdv') {
          const rdvPayload: any = {
            clientNom,
            clientTelephone: clientPhone,
            telephone: clientPhone,
            lieu: clientAddress,
            tacheNom: produitsListe[0]?.nom || 'Prestation',
            date: dateEcheance,
            heureDebut: horaire,
            heureFin: horaireFin || getOneHourLater(horaire),
          };
          try {
            await rdvTachesApi.updateByCommande(editingCommande.id, rdvPayload);
          } catch (err) { console.error('Erreur mise à jour RDV-tâche lié:', err); }
        }
        // Marquer les nouveaux produits comme réservés si c'est une réservation
        if (type === 'reservation') {
          for (const produit of produitsListe) {
            const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
            if (existingProduct) {
              try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'oui' }); } catch (err) { console.error('Erreur marquage réservation produit:', err); }
            }
          }
        }
        if (type === 'reservation' && dateEcheance && horaire) {
          try { await rdvFromReservationService.updateRdvFromCommande({ ...editingCommande, ...commandeData } as Commande); } catch (err) { console.error('Erreur mise à jour RDV:', err); }
        }
        toast({ title: 'Succès', description: 'Commande modifiée avec succès', className: "bg-app-green text-white" });
      } else {
        const response = await api.post('/api/commandes', commandeData);
        const newCommande = response.data as Commande;
        // Marquer les produits comme réservés si c'est une réservation
        if (type === 'reservation') {
          for (const produit of produitsListe) {
            const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
            if (existingProduct) {
              try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'oui' }); } catch (err) { console.error('Erreur marquage réservation produit:', err); }
            }
          }
        }
        if (type === 'reservation' && !ulterieurConfig && dateEcheance && horaire) { setPendingReservationForRdv(newCommande); setShowRdvConfirmDialog(true); }
        toast({ title: 'Succès', description: 'Commande ajoutée avec succès', className: "bg-app-green text-white" });
      }
      fetchCommandes(); resetForm(); setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving commande:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder la commande', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Édition d'une commande
  // =========================================================================

  const handleEdit = useCallback((commande: Commande) => {
    setEditingCommande(commande); setClientNom(commande.clientNom); setClientPhone(commande.clientPhone);
    setClientAddress(commande.clientAddress); setType(commande.type); setProduitsListe(commande.produits);
    setDateArrivagePrevue(commande.dateArrivagePrevue || ''); setDateEcheance(commande.dateEcheance || '');
    setHoraire(commande.horaire || ''); setHoraireFin(commande.horaireFin || ''); setClientSearch(commande.clientNom);
    // Pré-remplir la ville depuis la fiche client si disponible
    const existingClient = clients.find(c => c.nom.toLowerCase() === commande.clientNom.toLowerCase());
    setClientVille(((existingClient as any)?.ville || '').trim());
    if ((commande as any).reservationUlterieure) {
      setUlterieurConfig({
        mode: (commande as any).ulterieurDate ? 'date' : 'inconnu',
        date: (commande as any).ulterieurDate,
      });
    } else {
      setUlterieurConfig(null);
    }
    setIsDialogOpen(true);
  }, [clients]);

  // =========================================================================
  // Suppression
  // =========================================================================

  const handleDelete = async (id: string) => {
    try {
      const commande = commandes.find(c => c.id === id);
      try { await api.delete(`/api/rdv/by-commande/${id}`); } catch (err) { console.error('Erreur suppression RDV lié:', err); }
      try { await api.delete(`/api/taches/by-commande/${id}`); } catch (err) { console.error('Erreur suppression tâches liées:', err); }
      if (commande?.type === 'rdv') {
        try { await rdvTachesApi.deleteByCommande(id); } catch (err) { console.error('Erreur suppression RDV-tâche lié:', err); }
      }
      await api.delete(`/api/commandes/${id}`);
      toast({ title: 'Succès', description: 'Commande supprimée', className: "bg-app-green text-white" });
      fetchCommandes(); setDeleteId(null);
    } catch (error) {
      console.error('Error deleting commande:', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer la commande', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Gestion des statuts
  // =========================================================================

  const handleStatusChange = async (id: string, newStatus: CommandeStatut | 'reporter') => {
    const commande = commandes.find(c => c.id === id);
    if (!commande) return;

    // ✅ Réservation ultérieure → transition vers "en_attente" ouvre la modale de planification
    if (commande.statut === 'ulterieur' && newStatus === 'en_attente') {
      setUlterieurTransitionId(id);
      return;
    }


    // Blocage : passage à "Arrivé" impossible si un produit n'a pas assez de stock RÉELLEMENT disponible
    if (newStatus === 'arrive' && commande.type === 'commande') {
      const manquants: string[] = [];
      for (const p of commande.produits) {
        const prod: any = products.find(pr => pr.description.toLowerCase() === p.nom.toLowerCase());
        const stockDispo = prod ? Number(prod.quantity) || 0 : 0;
        if (stockDispo < p.quantite) {
          const enAttente = prod && Array.isArray(prod.achats)
            ? prod.achats.reduce((s: number, a: any) => s + (a && a.disponible === false ? (Number(a.quantity) || 0) : 0), 0)
            : 0;
          manquants.push(`${p.nom}: besoin ${p.quantite}, dispo ${stockDispo}, en attente ${enAttente}`);
        }
      }
      if (manquants.length > 0) {
        toast({
          title: '🚫 Arrivée impossible',
          description: `Marquez d'abord le nouvel achat comme "disponible" dans Produits. — ${manquants.join(' · ')}`,
          className: "bg-app-red text-white",
          variant: 'destructive',
        });
        return;
      }
      // ✅ Stock OK → ouvrir la modale de planification (RDV + tâche liés)
      setArriveePlanifId(id);
      return;
    }


    // Blocage : validation d'une commande uniquement après "Arrivé"
    if (newStatus === 'valide' && commande.type === 'commande' && commande.statut !== 'arrive') {
      toast({
        title: '🚫 Validation impossible',
        description: 'Cliquez d\'abord sur "Arrivé" une fois que tous les produits sont disponibles.',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return;
    }

    if (newStatus === 'valide') { setValidatingId(id); return; }
    if (newStatus === 'annule') { setCancellingId(id); return; }
    if (newStatus === 'reporter') {
      const currentDate = commande.type === 'commande' ? commande.dateArrivagePrevue : commande.dateEcheance;
      setReporterDate(currentDate || ''); setReporterHoraire(commande.horaire || '');
      setReporterHoraireFin(commande.horaireFin || '');
      setReporterCommandeId(id); setReporterModalOpen(true); return;
    }
    if (commande.statut === 'valide' && commande.saleId) {
      try {
        await api.delete(`/api/sales/${commande.saleId}`);
        await api.put(`/api/commandes/${id}`, { statut: newStatus, saleId: null });
        toast({ title: 'Succès', description: 'Statut mis à jour et vente annulée', className: "bg-app-green text-white" });
        await Promise.all([fetchCommandes(), fetchProducts()]); return;
      } catch (error) { console.error('Error reverting validation:', error); toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' }); return; }
    }
    try {
      await api.put(`/api/commandes/${id}`, { statut: newStatus });
      if (commande.type === 'reservation') {
        await reservationRdvSyncService.syncRdvStatus(id, newStatus as CommandeStatut);
        // Synchroniser la tâche associée
        await syncTacheForCommande(id, newStatus as CommandeStatut);
      }
      toast({ title: 'Succès', description: 'Statut mis à jour', className: "bg-app-green text-white" }); fetchCommandes();
    } catch (error) { console.error('Error updating status:', error); toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // Helper: synchroniser une tâche associée à une commande selon le nouveau statut
  const syncTacheForCommande = async (commandeId: string, statut: CommandeStatut, newDate?: string, newHoraire?: string) => {
    try {
      if (statut === 'valide') {
        const now = new Date();
        const currentHeureFin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        await api.put(`/api/taches/by-commande/${commandeId}`, {
          completed: true,
          heureFin: currentHeureFin,
          descriptionPrefixToRemove: '[ANNULÉ] '
        });
      } else if (statut === 'annule') {
        await api.put(`/api/taches/by-commande/${commandeId}`, {
          completed: true,
          descriptionPrefix: '[ANNULÉ] '
        });
      } else if (statut === 'reporter' && newDate) {
        const heureDebut = extractStartTime(newHoraire) || '09:00';
        await api.put(`/api/taches/by-commande/${commandeId}`, {
          date: newDate,
          heureDebut,
          heureFin: getOneHourLater(heureDebut),
          completed: false,
          descriptionPrefixToRemove: '[ANNULÉ] '
        });
      }
    } catch (tacheErr) { console.log('Tâche associée non synchronisée:', tacheErr); }
  };

  // =========================================================================
  // Confirmation de planification d'arrivée : passe la commande à "arrivé"
  // + crée un RDV (rdv-taches) + une tâche liés (statut planifié)
  // =========================================================================
  const confirmArriveePlanification = async (payload: { date: string; heureDebut: string; heureFin: string }) => {
    if (!arriveePlanifId) return;
    const commande = commandes.find(c => c.id === arriveePlanifId);
    if (!commande) return;
    const { date, heureDebut, heureFin } = payload;
    const produitsLabel = commande.produits.map(p => `${p.nom} × ${p.quantite}`).join(', ');
    try {
      // 1) Update commande
      await api.put(`/api/commandes/${commande.id}`, {
        statut: 'arrive',
        dateArrivagePrevue: date,
        horaire: `${heureDebut}-${heureFin}`,
        horaireFin: heureFin,
      });
      // 2) Créer RDV lié (rdv-taches.json)
      try {
        await rdvTachesApi.create({
          personneId: '', personneNom: '',
          clientId: '', clientNom: commande.clientNom,
          clientTelephone: commande.clientPhone,
          telephone: commande.clientPhone,
          tacheId: '', tacheNom: `Commande — ${produitsLabel}`,
          lieu: commande.clientAddress || '',
          date, heureDebut, heureFin,
          commentaires: `Créé automatiquement depuis la commande ${commande.id}`,
          commandeId: commande.id,
          statut: 'planifie',
        } as any);
      } catch (rdvErr) { console.warn('Création RDV lié impossible:', rdvErr); }
      // 2bis) Créer aussi une entrée dans rdv.json pour intégration ConfirmationRdvButton (verrouillage 24h/1h)
      try {
        const produitsRdv = commande.produits.map(p => ({
          nom: p.nom, quantite: p.quantite,
          prixUnitaire: p.prixUnitaire, prixVente: p.prixVente,
        }));
        await rdvApiService.create({
          titre: `Commande — ${produitsLabel}`.substring(0, 80),
          description: `Créé automatiquement depuis la commande ${commande.id}`,
          clientNom: commande.clientNom,
          clientTelephone: commande.clientPhone,
          clientAdresse: commande.clientAddress,
          date, heureDebut, heureFin,
          lieu: commande.clientAddress,
          statut: 'planifie',
          produits: produitsRdv,
          commandeId: commande.id,
        } as any);
      } catch (rdvJsonErr) { console.warn('Création RDV (rdv.json) impossible:', rdvJsonErr); }
      // 3) Créer tâche liée
      try {
        await tacheApi.create({
          date, heureDebut, heureFin,
          description: `[Commande] ${commande.clientNom} — ${produitsLabel}`,
          importance: 'pertinent',
          travailleurId: '', travailleurNom: '',
          commandeId: commande.id,
          completed: false,
        } as any);
      } catch (tacheErr) { console.warn('Création tâche liée impossible:', tacheErr); }

      toast({ title: '✅ Commande arrivée', description: 'RDV + tâche planifiés automatiquement.', className: 'bg-app-green text-white' });
      setArriveePlanifId(null);
      await fetchCommandes();
    } catch (err) {
      console.error('confirmArriveePlanification error:', err);
      toast({ title: 'Erreur', description: "Impossible d'enregistrer l'arrivée", className: 'bg-app-red text-white', variant: 'destructive' });
    }
  };



  // =========================================================================
  // Confirmation d'annulation
  // =========================================================================

  const confirmCancellation = async () => {
    if (!cancellingId) return;
    const commande = commandes.find(c => c.id === cancellingId);
    try {
      if (commande && commande.statut === 'valide' && commande.saleId) await api.delete(`/api/sales/${commande.saleId}`);
      await api.put(`/api/commandes/${cancellingId}`, { statut: 'annule', saleId: null });
      // Dé-réserver tous les produits de cette réservation annulée
      if (commande && commande.type === 'reservation') {
        for (const produit of commande.produits) {
          const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
          if (existingProduct) {
            try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non' }); } catch (err) { console.error('Erreur dé-réservation produit:', err); }
          }
        }
        await reservationRdvSyncService.syncRdvStatus(cancellingId, 'annule');
        await syncTacheForCommande(cancellingId, 'annule');
      }
      if (commande && commande.type === 'rdv') {
        await syncRdvTacheForCommande(commande, { statut: 'annule' });
      }
      // Commande classique (type 'commande' arrivée) → annuler aussi RDV lié + tâche + rdv.json
      if (commande && commande.type === 'commande') {
        try { await rdvTachesApi.updateByCommande(cancellingId, { statut: 'annule' } as any); } catch { /* pas de RDV lié */ }
        try { await reservationRdvSyncService.syncRdvStatus(cancellingId, 'annule'); } catch { /* pas de RDV (rdv.json) */ }
        try { await syncTacheForCommande(cancellingId, 'annule'); } catch { /* pas de tâche liée */ }
      }
      toast({ title: 'Succès', description: 'Commande annulée', className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]); setCancellingId(null);
    } catch (error) { console.error('Error cancelling:', error); toast({ title: 'Erreur', description: "Impossible d'annuler", className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Confirmation de validation
  // =========================================================================

  const confirmValidation = async () => {
    if (!validatingId) return;
    const commandeToValidate = commandes.find(c => c.id === validatingId);
    if (!commandeToValidate) return;
    try {
      for (const p of commandeToValidate.produits) {
        const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (existingProduct && existingProduct.quantity < p.quantite) {
          toast({ title: 'Stock insuffisant', description: `Stock disponible pour ${p.nom}: ${existingProduct.quantity} unités`, className: "bg-app-red text-white", variant: 'destructive' }); return;
        }
      }
      const today = new Date().toISOString().split('T')[0];
      const saleProducts = [];
      let totalSellingPrice = 0;
      let totalPurchasePrice = 0;
      for (const p of commandeToValidate.produits) {
        let product = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (!product) { const newProductResponse = await api.post('/api/products', { description: p.nom, purchasePrice: p.prixUnitaire, quantity: p.quantite }); product = newProductResponse.data; }
        const rawSelling = p.prixVente * p.quantite;
        const reduc = (p.reduction || 0) > 0 && p.reductionType
          ? (p.reductionType === 'percent' ? (p.prixVente * (p.reduction as number) / 100) * p.quantite : (p.reduction as number) * p.quantite)
          : 0;
        const sellingPrice = Math.max(0, rawSelling - reduc);
        const purchasePrice = p.prixUnitaire * p.quantite;
        const delFee = Number(p.deliveryFee || 0);
        const delLoc = p.deliveryLocation || "Saint-Denis";
        saleProducts.push({ productId: product.id, description: p.nom, quantitySold: p.quantite, purchasePrice, sellingPrice, profit: sellingPrice - purchasePrice, deliveryFee: delFee, deliveryLocation: delLoc, reduction: p.reduction || 0, reductionType: p.reductionType || '' });
        totalSellingPrice += sellingPrice;
        totalPurchasePrice += purchasePrice;
      }
      const saleData = { date: today, products: saleProducts, totalPurchasePrice, totalSellingPrice, totalProfit: totalSellingPrice - totalPurchasePrice, clientName: commandeToValidate.clientNom, clientAddress: commandeToValidate.clientAddress, clientPhone: commandeToValidate.clientPhone, reste: 0, nextPaymentDate: null };
      if (commandeToValidate.type === 'reservation') {
        await reservationRdvSyncService.syncRdvStatus(validatingId, 'valide');
        await syncTacheForCommande(validatingId, 'valide');
      }
      if (commandeToValidate.type === 'rdv') {
        await syncRdvTacheForCommande(commandeToValidate, { statut: 'valide' });
      }
      // Commande classique arrivée → propager la clôture au RDV + tâche liés
      if (commandeToValidate.type === 'commande') {
        try { await rdvTachesApi.updateByCommande(validatingId, { statut: 'termine' } as any); } catch { /* pas de RDV lié */ }
        try { await reservationRdvSyncService.syncRdvStatus(validatingId, 'valide'); } catch { /* pas de RDV (rdv.json) */ }
        try { await syncTacheForCommande(validatingId, 'valide'); } catch { /* pas de tâche liée */ }
      }

      const saleResponse = await api.post('/api/sales', saleData);
      const createdSale = saleResponse.data;
      try { await api.post('/api/fidelite/rebuild'); } catch { /* rebuild fidelite best-effort */ }
      await api.put(`/api/commandes/${validatingId}`, { statut: 'valide', saleId: createdSale.id });

      // Dé-réserver les produits et déduire la quantité réservée du stock
      if (commandeToValidate.type === 'reservation') {
        for (const p of commandeToValidate.produits) {
          const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
          if (existingProduct) {
            const newQuantity = Math.max(0, existingProduct.quantity - p.quantite);
            try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non', quantity: newQuantity }); } catch (err) { console.error('Erreur dé-réservation/stock produit:', err); }
          }
        }
      }
      toast({ title: 'Succès', description: 'Commande validée et enregistrée comme vente', className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]); setValidatingId(null);
    } catch (error) { console.error('Error validating:', error); toast({ title: 'Erreur', description: 'Impossible de valider', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Gestion du report
  // =========================================================================

  const handleReporterConfirm = async () => {
    if (!reporterCommandeId || !reporterDate) { toast({ title: 'Erreur', description: 'Veuillez sélectionner une date', className: "bg-app-red text-white", variant: 'destructive' }); return; }
    try {
      const commande = commandes.find(c => c.id === reporterCommandeId);
      if (!commande) return;
      // Pour un RDV: vérifier qu'on a heureDebut + heureFin et créneau libre
      if (commande.type === 'rdv') {
        if (!reporterHoraire || !reporterHoraireFin) {
          toast({ title: 'Erreur', description: 'Heure de début et de fin requises', className: 'bg-app-red text-white', variant: 'destructive' });
          return;
        }
        if (reporterRdvBusy.busy) {
          toast({ title: 'Créneau occupé', description: reporterRdvBusy.message || 'Choisissez un autre créneau', className: 'bg-app-red text-white', variant: 'destructive' });
          return;
        }
      }
      const updateData: Record<string, unknown> = { statut: 'reporter', horaire: reporterHoraire || undefined };
      if (commande.type === 'commande') updateData.dateArrivagePrevue = reporterDate;
      else updateData.dateEcheance = reporterDate;
      if (commande.type === 'rdv') updateData.horaireFin = reporterHoraireFin;
      await api.put(`/api/commandes/${reporterCommandeId}`, updateData);
      if (commande.type === 'reservation') {
        try {
          await reservationRdvSyncService.syncRdvReport(reporterCommandeId, reporterDate, extractStartTime(reporterHoraire) || '09:00');
        } catch (rdvError) { console.log('RDV non trouvé:', rdvError); }
        await syncTacheForCommande(reporterCommandeId, 'reporter', reporterDate, extractStartTime(reporterHoraire) || '09:00');
      }
      if (commande.type === 'rdv') {
        await syncRdvTacheForCommande(commande, {
          statut: 'reporter',
          date: reporterDate,
          heureDebut: reporterHoraire,
          heureFin: reporterHoraireFin,
        });
      }
      // Commande classique (type 'commande') → reporter aussi RDV + tâche + rdv.json
      if (commande.type === 'commande') {
        const hd = extractStartTime(reporterHoraire) || '09:00';
        const hf = reporterHoraireFin || getOneHourLater(hd);
        try { await reservationRdvSyncService.syncRdvReport(reporterCommandeId, reporterDate, hd); } catch { /* pas de RDV */ }
        try { await rdvTachesApi.updateByCommande(reporterCommandeId, { date: reporterDate, heureDebut: hd, heureFin: hf, statut: 'reporte' } as any); } catch { /* pas de RDV tâche lié */ }
        try { await syncTacheForCommande(reporterCommandeId, 'reporter', reporterDate, reporterHoraire); } catch { /* pas de tâche liée */ }
      }
      toast({ title: 'Succès', description: `Reporté au ${new Date(reporterDate).toLocaleDateString('fr-FR')}${reporterHoraire ? ' à ' + reporterHoraire : ''}`, className: "bg-app-green text-white" });
      fetchCommandes(); setReporterModalOpen(false); setReporterCommandeId(null); setReporterDate(''); setReporterHoraire(''); setReporterHoraireFin('');
    } catch (error) { console.error('Error updating date:', error); toast({ title: 'Erreur', description: 'Impossible de reporter', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Gestion de la création RDV depuis réservation
  // =========================================================================

  const handleCreateRdvFromReservation = async (titre: string, description: string) => {
    if (!pendingReservationForRdv) return;
    setIsRdvLoading(true);
    try {
      const heureDebut = pendingReservationForRdv.horaire || '09:00';
      let heureFin: string;
      if (pendingReservationForRdv.horaireFin) {
        heureFin = pendingReservationForRdv.horaireFin;
      } else {
        const [hours, minutes] = heureDebut.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        heureFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      const rdvData = {
        titre: titre || `Réservation pour ${pendingReservationForRdv.clientNom}`,
        description: description || '', clientNom: pendingReservationForRdv.clientNom,
        clientTelephone: pendingReservationForRdv.clientPhone, clientAdresse: pendingReservationForRdv.clientAddress,
        date: pendingReservationForRdv.dateEcheance, heureDebut, heureFin,
        lieu: pendingReservationForRdv.clientAddress, statut: 'planifie',
        notes: `Créé depuis une réservation`,
        produits: pendingReservationForRdv.produits.map(p => ({ nom: p.nom, quantite: p.quantite, prixUnitaire: p.prixUnitaire, prixVente: p.prixVente })),
        commandeId: pendingReservationForRdv.id,
      };
      await api.post('/api/rdv', rdvData);
      toast({ title: '📅 Rendez-vous créé', description: `Le RDV a été créé pour le ${pendingReservationForRdv.dateEcheance}`, className: "bg-app-green text-white" });

      // Also create as tache - check for time conflicts first
      const tacheData = {
        date: pendingReservationForRdv.dateEcheance || '',
        heureDebut,
        heureFin,
        description: titre || `RDV: ${pendingReservationForRdv.clientNom}`,
        importance: 'pertinent' as const,
        travailleurId: '',
        travailleurNom: '',
        commandeId: pendingReservationForRdv.id,
      };

      try {
        await tacheApi.create(tacheData);
        toast({ title: '📋 Tâche créée', description: 'La tâche correspondante a été ajoutée au calendrier', className: "bg-app-green text-white" });
      } catch (tacheErr: any) {
        if (tacheErr?.response?.status === 409) {
          // Time conflict - check what task conflicts
          const conflictData = tacheErr.response.data;
          const conflictTache = conflictData.conflict;
          
          // Try to find the conflicting tache
          try {
            const existingTaches = await tacheApi.getByDate(tacheData.date);
            const conflicting = existingTaches.data.find((t: any) => {
              const tStart = t.heureDebut.split(':').map(Number);
              const tEnd = t.heureFin.split(':').map(Number);
              const tStartMin = tStart[0] * 60 + tStart[1];
              const tEndMin = tEnd[0] * 60 + tEnd[1];
              const newStartMin = heureDebut.split(':').map(Number);
              const newEndMin = heureFin.split(':').map(Number);
              const nStart = newStartMin[0] * 60 + newStartMin[1];
              const nEnd = newEndMin[0] * 60 + newEndMin[1];
              return nStart <= tEndMin && nEnd >= tStartMin;
            });

            if (conflicting && conflicting.importance !== 'pertinent') {
              setConflictingTache(conflicting);
              setPendingTacheData(tacheData);
              setShowTacheConflictModal(true);
            } else {
              toast({ title: '⚠️ Conflit horaire', description: conflictData.error || 'Ce créneau est déjà occupé par une tâche non déplaçable', className: "bg-app-red text-white", variant: 'destructive' });
            }
          } catch {
            toast({ title: '⚠️ Conflit horaire', description: conflictData.error || 'Ce créneau est déjà occupé', className: "bg-app-red text-white", variant: 'destructive' });
          }
        } else {
          console.error('Erreur création tâche:', tacheErr);
        }
      }
    } catch (err) { console.error('Erreur création RDV:', err); toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous', className: "bg-app-red text-white", variant: 'destructive' }); }
    finally { setIsRdvLoading(false); setShowRdvFormModal(false); setPendingReservationForRdv(null); }
  };

  const handleRescheduleTacheAndCreate = async (tacheId: string, newDate: string, newHeureDebut: string, newHeureFin: string) => {
    try {
      // Reschedule conflicting tache
      await tacheApi.update(tacheId, { date: newDate, heureDebut: newHeureDebut, heureFin: newHeureFin });
      toast({ title: '✅ Tâche déplacée', description: 'La tâche conflictuelle a été déplacée', className: "bg-app-green text-white" });

      // Now create the new tache
      if (pendingTacheData) {
        try {
          await tacheApi.create(pendingTacheData);
          toast({ title: '📋 Tâche créée', description: 'La tâche RDV a été ajoutée au calendrier', className: "bg-app-green text-white" });
        } catch (err) {
          console.error('Erreur création tâche après reschedule:', err);
          toast({ title: 'Erreur', description: 'Impossible de créer la tâche après le déplacement', className: "bg-app-red text-white", variant: 'destructive' });
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Impossible de déplacer la tâche';
      toast({ title: 'Erreur', description: msg, className: "bg-app-red text-white", variant: 'destructive' });
    } finally {
      setShowTacheConflictModal(false);
      setConflictingTache(null);
      setPendingTacheData(null);
    }
  };

  const handleSkipTacheConflict = () => {
    setShowTacheConflictModal(false);
    setConflictingTache(null);
    setPendingTacheData(null);
    toast({ title: 'ℹ️ Tâche non créée', description: 'Le RDV a été créé sans tâche associée' });
  };

  const handleDeclineRdv = useCallback(() => { setShowRdvConfirmDialog(false); setPendingReservationForRdv(null); }, []);
  const handleAcceptRdv = useCallback(() => { setShowRdvConfirmDialog(false); setShowRdvFormModal(true); }, []);
  const handleCloseRdvModal = useCallback(() => { setShowRdvFormModal(false); setPendingReservationForRdv(null); }, []);

  // Confirmation de bascule "ulterieur" → "en_attente"
  const confirmUlterieurTransition = useCallback(async (payload: { dateEcheance: string; horaire: string; horaireFin: string }) => {
    if (!ulterieurTransitionId) return;
    const commande = commandes.find(c => c.id === ulterieurTransitionId);
    if (!commande) return;
    try {
      await api.put(`/api/commandes/${ulterieurTransitionId}`, {
        statut: 'en_attente',
        dateEcheance: payload.dateEcheance,
        horaire: payload.horaire,
        horaireFin: payload.horaireFin,
        reservationUlterieure: false,
        expiresAt: null,
        ulterieurDate: null,
      });
      const updated = { ...commande, ...payload, statut: 'en_attente' as CommandeStatut };
      setUlterieurTransitionId(null);
      await fetchCommandes();
      toast({ title: '✅ Réservation planifiée', description: 'La réservation est passée en attente', className: 'bg-app-green text-white' });
      // Proposer la création du RDV lié
      setPendingReservationForRdv(updated as Commande);
      setShowRdvConfirmDialog(true);
    } catch (e) {
      console.error('Erreur bascule ulterieur:', e);
      toast({ title: 'Erreur', description: 'Impossible de planifier la réservation', className: 'bg-app-red text-white', variant: 'destructive' });
    }
  }, [ulterieurTransitionId, commandes]);

  // =========================================================================
  // Options de statut
  // =========================================================================

  const getStatusOptions = useCallback((commandeType: 'commande' | 'reservation' | 'rdv') => {
    if (commandeType === 'commande') {
      return [
        { value: 'en_route', label: '📦 En Route' }, { value: 'arrive', label: '✅ Arrivé' },
        { value: 'valide', label: '💎 Validé' }, { value: 'annule', label: '❌ Annulé' }, { value: 'reporter', label: '📅 Reporter' },
      ];
    }
    return [
      { value: 'ulterieur', label: '⏳ Ultérieur' },
      { value: 'en_attente', label: '⏳ En Attente' }, { value: 'valide', label: '💎 Validé' },
      { value: 'annule', label: '❌ Annulé' }, { value: 'reporter', label: '📅 Reporter' },
    ];
  }, []);

  // =========================================================================
  // Export PDF
  // =========================================================================

  const handleExportPDF = useCallback(() => {
    if (commandesForExportDate.length === 0) {
      toast({ title: 'Aucune donnée', description: 'Aucune commande ou réservation pour cette date', className: "bg-app-red text-white", variant: 'destructive' }); return;
    }
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const dateFormatted = new Date(exportDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.text('Commandes & Réservations', 105, 20, { align: 'center' });
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateFormatted}`, 105, 28, { align: 'center' });
    doc.text(`Total: ${commandesForExportDate.length} entrée(s)`, 105, 35, { align: 'center' });
    const tableData = commandesForExportDate.map(c => {
      const produits = c.produits.map(p => `${p.nom} (x${p.quantite})`).join('\n');
      const prixDetail = c.produits.map(p => `${p.prixVente}€ x ${p.quantite}`).join('\n');
      const total = c.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2);
      const dateEch = c.type === 'commande' ? new Date(c.dateArrivagePrevue || '').toLocaleDateString('fr-FR') : new Date(c.dateEcheance || '').toLocaleDateString('fr-FR');
      return [`${c.clientNom}\n${c.clientAddress}`, c.clientPhone, produits, `${prixDetail}\n\nTotal: ${total}€`, `${dateEch}\n${c.horaire || '-'}`];
    });
    autoTable(doc, {
      startY: 42, head: [['Client', 'Contact', 'Produit', 'Prix', 'Date/Horaire']], body: tableData,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 25 }, 2: { cellWidth: 45 }, 3: { cellWidth: 35 }, 4: { cellWidth: 30 } },
      alternateRowStyles: { fillColor: [245, 243, 255] }
    });
    doc.save(`commandes_${exportDate}.pdf`);
    toast({ title: 'Succès', description: 'Export PDF effectué', className: "bg-app-green text-white" });
    setExportDialogOpen(false); setExportDate('');
  }, [commandesForExportDate, exportDate]);

  return {
    // Données
    commandes, clients, products, sales, isLoading,
    currentClientCaracteristique,
    filteredCommandes, filteredClients, filteredProducts, commandesForExportDate,
    lockedCommandeIds,
    // États formulaire
    isDialogOpen, setIsDialogOpen, editingCommande,
    clientNom, setClientNom, clientPhone, setClientPhone, clientPhones, clientAddress, setClientAddress, clientVille, setClientVille,
    clientSearch, setClientSearch, showClientSuggestions, setShowClientSuggestions,
    type, setType, dateArrivagePrevue, setDateArrivagePrevue, dateEcheance, setDateEcheance, horaire, setHoraire, horaireFin, setHoraireFin,
    produitNom, setProduitNom, prixUnitaire, setPrixUnitaire, quantite, setQuantite, prixVente, setPrixVente,
    productSearch, setProductSearch, showProductSuggestions, setShowProductSuggestions,
    selectedProduct, produitsListe, editingProductIndex, availableQuantityForSelected,
    // Nouveaux champs produit
    productReduction, setProductReduction,
    productReductionType, setProductReductionType,
    productDeliveryLocation, setProductDeliveryLocation,
    productDeliveryFee, setProductDeliveryFee,
    productBaseDeliveryFee, setProductBaseDeliveryFee,
    // États recherche/tri
    commandeSearch, setCommandeSearch, sortDateAsc, setSortDateAsc,
    // États modales
    deleteId, setDeleteId, validatingId, setValidatingId, cancellingId, setCancellingId,
    exportDialogOpen, setExportDialogOpen, exportDate, setExportDate,
    reporterModalOpen, setReporterModalOpen, reporterDate, setReporterDate, reporterHoraire, setReporterHoraire,
    reporterHoraireFin, setReporterHoraireFin, reporterRdvBusy, reporterCommandeId,
    showRdvConfirmDialog, showRdvFormModal, pendingReservationForRdv, isRdvLoading,
    showTacheConflictModal, conflictingTache,
    // États modale réservation en retard
    showOverdueModal, overdueReservation,
    handleOverdueValidate, handleOverdueCancel, handleOverduePostpone,
    // Handlers
    handleClientSelect, handleProductSelect,
    handleAddProduit, handleEditProduit, handleRemoveProduit,
    handleSubmit, handleEdit, handleDelete,
    handleStatusChange, confirmValidation, confirmCancellation,
    handleReporterConfirm, handleExportPDF,
    handleCreateRdvFromReservation, handleDeclineRdv, handleAcceptRdv, handleCloseRdvModal,
    handleRescheduleTacheAndCreate, handleSkipTacheConflict,
    getStatusOptions, resetForm,
    // Planification d'arrivée
    arriveePlanifId, setArriveePlanifId, confirmArriveePlanification,
    // Réservation ultérieure
    ulterieurConfig, setUlterieurConfig,
    ulterieurModalOpen, setUlterieurModalOpen,
    ulterieurTransitionId, setUlterieurTransitionId,
    confirmUlterieurTransition,
  };
};

export default useCommandesLogic;
