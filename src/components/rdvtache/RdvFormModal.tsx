/**
 * RdvFormModal.tsx - Formulaire d'ajout / édition d'un RDV-tâche.
 * Recherche travailleur (3 chars), recherche client (3 chars), choix tâche depuis catalogue,
 * lieu / téléphone auto-remplis depuis le client, créneaux libres du jour, statut.
 */
import React, { useState, useEffect, useMemo } from 'react';
import PremiumLoading from '@/components/ui/premium-loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarHeart, User, Users, Scissors, MapPin, Phone, Clock, MessageSquare, Flag, X, Calendar as CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import travailleurApi, { Travailleur } from '@/services/api/travailleurApi';
import clientApiService from '@/services/api/clientApi';
import { Client } from '@/types/client';
import rdvTachesApi, { RdvTache, RdvTacheStatut, FreeSlot, RdvProduit } from '@/services/api/rdvTachesApi';
import { TacheRdvCatalog } from '@/services/api/tachesRdvApi';
import RdvProductSection from './RdvProductSection';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  catalog: TacheRdvCatalog[];
  editing: RdvTache | null;
  defaultDate?: string;
  onSubmit: (data: Omit<RdvTache, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
}

const today = () => new Date().toISOString().split('T')[0];

const STATUTS: { value: RdvTacheStatut; label: string }[] = [
  { value: 'planifie', label: '📅 Planifié' },
  { value: 'confirme', label: '✅ Confirmé' },
  { value: 'annule', label: '❌ Annulé' },
  { value: 'reporte', label: '🔄 Reporté' },
  { value: 'termine', label: '🏁 Terminé' },
];

const RdvFormModal: React.FC<Props> = ({ open, onOpenChange, catalog, editing, defaultDate, onSubmit }) => {
  const [personneSearch, setPersonneSearch] = useState('');
  const [personneResults, setPersonneResults] = useState<Travailleur[]>([]);
  const [personne, setPersonne] = useState<{ id: string; nom: string } | null>(null);

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  const [tacheId, setTacheId] = useState<string>('');
  const [lieu, setLieu] = useState('');
  const [telephone, setTelephone] = useState('');
  const [date, setDate] = useState(today());
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [statut, setStatut] = useState<RdvTacheStatut>('planifie');
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCreate, setConfirmCreate] = useState(false);

  // Produits liés au RDV
  const [produits, setProduits] = useState<RdvProduit[]>([]);
  const [askProduct, setAskProduct] = useState(false);      // demande "voulez-vous ajouter un produit ?"
  const [showProducts, setShowProducts] = useState(false);  // affichage de la section produits
  const [productPromptDone, setProductPromptDone] = useState(false);

  // Reset form when (re)open
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setPersonne(editing.personneId || editing.personneNom ? { id: editing.personneId || '', nom: editing.personneNom || '' } : null);
      setPersonneSearch(editing.personneNom || '');
      setClient(editing.clientId ? { id: editing.clientId, nom: editing.clientNom, phone: editing.clientTelephone || '', phones: [], adresse: editing.lieu || '', addresses: [], dateCreation: '' } : null);
      setClientSearch(editing.clientNom || '');
      setTacheId(editing.tacheId || '');
      setLieu(editing.lieu || '');
      setTelephone(editing.telephone || editing.clientTelephone || '');
      setDate(editing.date);
      setHeureDebut(editing.heureDebut);
      setHeureFin(editing.heureFin);
      setCommentaires(editing.commentaires || '');
      setStatut(editing.statut);
      setProduits(Array.isArray(editing.produits) ? editing.produits : []);
      setShowProducts((editing.produits || []).length > 0);
      setProductPromptDone(true);
      setAskProduct(false);
    } else {
      setPersonne(null); setPersonneSearch(''); setPersonneResults([]);
      setClient(null); setClientSearch(''); setClientResults([]);
      setTacheId(''); setLieu(''); setTelephone('');
      setDate(defaultDate || today());
      setHeureDebut(''); setHeureFin(''); setCommentaires(''); setStatut('planifie');
      setProduits([]); setShowProducts(false); setAskProduct(false); setProductPromptDone(false);
    }
  }, [open, editing, defaultDate]);

  // Search travailleurs (3+ chars)
  useEffect(() => {
    if (!personneSearch || personneSearch.trim().length < 3) { setPersonneResults([]); return; }
    if (personne && `${personne.nom}`.toLowerCase() === personneSearch.toLowerCase()) return;
    const t = setTimeout(async () => {
      try {
        const res = await travailleurApi.search(personneSearch.trim());
        setPersonneResults(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
      } catch { setPersonneResults([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [personneSearch, personne]);

  // Load all clients once when opened
  const [allClients, setAllClients] = useState<Client[]>([]);
  useEffect(() => {
    if (!open) return;
    clientApiService.getAll().then(r => setAllClients(Array.isArray(r) ? r : [])).catch(() => setAllClients([]));
  }, [open]);

  // Filter clients (3+ chars) client-side
  useEffect(() => {
    if (!clientSearch || clientSearch.trim().length < 3) { setClientResults([]); return; }
    if (client && client.nom.toLowerCase() === clientSearch.toLowerCase()) return;
    const q = clientSearch.trim().toLowerCase();
    const filtered = allClients.filter(c =>
      (c.nom || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.phones || []).some(p => (p || '').toLowerCase().includes(q))
    ).slice(0, 8);
    setClientResults(filtered);
  }, [clientSearch, client, allClients]);

  // Load free slots when date changes
  useEffect(() => {
    if (!open || !date) { setFreeSlots([]); return; }
    setSlotsLoading(true);
    rdvTachesApi.getFreeSlots(date)
      .then(r => setFreeSlots(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFreeSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date, open]);

  const handleSelectClient = (c: Client) => {
    setClient(c);
    setClientSearch(c.nom);
    setClientResults([]);
    if (!lieu) setLieu(c.adresse || (c.addresses && c.addresses[0]) || '');
    if (!telephone) setTelephone(c.phone || (c.phones && c.phones[0]) || '');
  };

  const handleSelectPersonne = (t: Travailleur) => {
    const fullName = `${t.prenom} ${t.nom}`.trim();
    setPersonne({ id: t.id, nom: fullName });
    setPersonneSearch(fullName);
    setPersonneResults([]);
  };

  const selectedTache = useMemo(() => catalog.find(c => c.id === tacheId), [catalog, tacheId]);

  const validate = (): string | null => {
    if (!clientSearch.trim()) return 'Veuillez sélectionner ou saisir un client';
    if (!tacheId) return 'Veuillez choisir une tâche';
    if (!date) return 'Date requise';
    if (!heureDebut || !heureFin) return 'Heures de début et fin requises';
    if (heureFin <= heureDebut) return "L'heure de fin doit être après l'heure de début";
    return null;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    // Auto: si édition et date modifiée → statut "reporté"
    let finalStatut = statut;
    if (editing && editing.date !== date && statut !== 'termine' && statut !== 'annule') {
      finalStatut = 'reporte';
    }
    setSubmitting(true);
    try {
      const payload: Omit<RdvTache, 'id' | 'createdAt' | 'updatedAt'> = {
        personneId: personne?.id || '',
        personneNom: personne?.nom || personneSearch.trim(),
        clientId: client?.id || '',
        clientNom: client?.nom || clientSearch.trim(),
        clientTelephone: client?.phone || '',
        tacheId,
        tacheNom: selectedTache?.nom || '',
        lieu: lieu.trim(),
        telephone: telephone.trim(),
        date,
        heureDebut,
        heureFin,
        commentaires: commentaires.trim(),
        statut: finalStatut,
        produits,
        clientAdresse: client?.adresse || lieu.trim(),
      };
      await onSubmit(payload, editing?.id);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClickPrimary = () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    if (editing) {
      handleSubmit();
    } else {
      setConfirmCreate(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-pink-900/30 to-fuchsia-900/20 border border-white/10 shadow-2xl rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-3">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30">
            <CalendarHeart className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            {editing ? '✨ Modifier le RDV' : '✨ Nouveau Rendez-vous'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Personne */}
          <div className="space-y-1.5 relative">
            <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Users className="h-3.5 w-3.5 text-pink-400" /> Personne (travailleur)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <Input value={personneSearch}
                onChange={e => { setPersonneSearch(e.target.value); setPersonne(null); }}
                placeholder="Saisir 3 caractères pour rechercher..."
                className="pl-9 bg-white/10 border border-white/20 focus:border-pink-400 rounded-xl text-white placeholder:text-white/40" />
            </div>
            {personneResults.length > 0 && !personne && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl max-h-44 overflow-y-auto">
                {personneResults.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => handleSelectPersonne(t)}
                    className="w-full text-left px-3 py-2 hover:bg-pink-500/20 text-white text-xs border-b border-white/5 last:border-0">
                    <User className="h-3 w-3 inline mr-2 text-pink-400" />{t.prenom} {t.nom}
                    {t.role === 'administrateur' && <span className="ml-2 text-[10px] text-amber-400">👑 Admin</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Client */}
          <div className="space-y-1.5 relative">
            <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><User className="h-3.5 w-3.5 text-rose-400" /> Client *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <Input value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setClient(null); }}
                placeholder="Saisir 3 caractères pour rechercher..."
                className="pl-9 bg-white/10 border border-white/20 focus:border-rose-400 rounded-xl text-white placeholder:text-white/40" />
            </div>
            {clientResults.length > 0 && !client && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl max-h-44 overflow-y-auto">
                {clientResults.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => handleSelectClient(c)}
                    className="w-full text-left px-3 py-2 hover:bg-rose-500/20 text-white text-xs border-b border-white/5 last:border-0">
                    <User className="h-3 w-3 inline mr-2 text-rose-400" />{c.nom}
                    {c.phone && <span className="ml-2 text-[10px] text-white/50">📞 {c.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tâche */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Scissors className="h-3.5 w-3.5 text-fuchsia-400" /> Tâche *</Label>
            <Select
              value={tacheId}
              onValueChange={(v) => {
                setTacheId(v);
                if (!productPromptDone && !showProducts) setAskProduct(true);
              }}
            >
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white">
                <SelectValue placeholder={catalog.length === 0 ? 'Aucune tâche — utilisez "Ajouter tâche"' : 'Sélectionner une tâche'} />
              </SelectTrigger>
              <SelectContent>
                {catalog.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Demande d'ajout de produit */}
          {askProduct && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-pink-400/30 space-y-2 animate-fade-in">
              <p className="text-xs font-bold text-white">🛍️ Voulez-vous ajouter un produit à ce rendez-vous ?</p>
              <div className="flex gap-2">
                <Button type="button" size="sm"
                  onClick={() => { setShowProducts(true); setAskProduct(false); setProductPromptDone(true); }}
                  className="flex-1 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl">
                  ✅ Oui
                </Button>
                <Button type="button" size="sm" variant="outline"
                  onClick={() => { setAskProduct(false); setProductPromptDone(true); }}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                  ❌ Non
                </Button>
              </div>
            </div>
          )}

          {/* Section produits */}
          {showProducts && (
            <RdvProductSection produits={produits} onChange={setProduits} />
          )}
          {!showProducts && !askProduct && (
            <Button type="button" variant="outline" size="sm"
              onClick={() => { setShowProducts(true); setProductPromptDone(true); }}
              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/15 rounded-xl text-xs">
              🛍️ Ajouter des produits
            </Button>
          )}



          {/* Lieu + Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-400" /> Lieu</Label>
              <Input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Adresse / lieu du RDV"
                className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-blue-400" /> Téléphone</Label>
              <Input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06.." type="tel"
                className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40" />
            </div>
          </div>

          {/* Date / heures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5 text-cyan-400" /> Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-emerald-400" /> Début *</Label>
              <Input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} min="04:00" max="23:59"
                className="bg-white/10 border border-white/20 focus:border-emerald-400 rounded-xl text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-red-400" /> Fin *</Label>
              <Input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} min="04:00" max="23:59"
                className="bg-white/10 border border-white/20 focus:border-red-400 rounded-xl text-white" />
            </div>
          </div>

          {/* Créneaux libres */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/80 flex items-center gap-2">⏰ Créneaux libres du {date}</Label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white/5 border border-white/10 rounded-xl">
              {slotsLoading && (
                <div className="w-full py-2 flex justify-center">
                  <PremiumLoading size="sm" text="Chargement des créneaux..." />
                </div>
              )}
              {!slotsLoading && freeSlots.length === 0 && <span className="text-[11px] text-white/40">Aucun créneau libre</span>}
              {!slotsLoading && freeSlots.map((s, i) => (
                <button key={i} type="button"
                  onClick={() => { setHeureDebut(s.start); setHeureFin(s.end); }}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:scale-105 transition-all">
                  {s.start} → {s.end}
                </button>
              ))}
            </div>
          </div>

          {/* Commentaires + Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-violet-400" /> Commentaires</Label>
              <Textarea value={commentaires} onChange={e => setCommentaires(e.target.value)}
                placeholder="Notes complémentaires"
                className="bg-white/10 border border-white/20 focus:border-violet-400 rounded-xl text-white placeholder:text-white/40 min-h-[60px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80 flex items-center gap-2"><Flag className="h-3.5 w-3.5 text-yellow-400" /> Statut</Label>
              <Select value={statut} onValueChange={(v) => setStatut(v as RdvTacheStatut)}>
                <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleClickPrimary} disabled={submitting}
              className="flex-1 bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-all rounded-xl">
              {submitting ? '⏳ ...' : (editing ? '💾 Sauvegarder' : '✅ Créer le RDV')}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>

        {/* Confirmation création */}
        {confirmCreate && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-3xl">
            <div className="bg-gradient-to-br from-slate-900 to-pink-900/40 border border-pink-400/40 rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl">
              <h3 className="text-base font-black text-white mb-2">✨ Confirmer la création</h3>
              <p className="text-xs text-white/70 mb-5">Voulez-vous vraiment enregistrer ce rendez-vous dans la base de données ?</p>
              <div className="flex gap-2">
                <Button
                  onClick={async () => { setConfirmCreate(false); await handleSubmit(); }}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl"
                >
                  ✅ Oui, créer
                </Button>
                <Button
                  onClick={() => setConfirmCreate(false)}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                >
                  ❌ Non
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RdvFormModal;
