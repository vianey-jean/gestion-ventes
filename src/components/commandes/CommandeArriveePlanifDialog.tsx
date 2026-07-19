/**
 * CommandeArriveePlanifDialog
 * Modale de planification à afficher quand une commande passe au statut "Arrivé".
 * Affiche les infos de la commande + choix date/heureDebut/heureFin + créneaux libres.
 * Ne se valide que si le créneau est libre côté commandes ∩ RDV ∩ tâches.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import availabilityApi, { type BusySlot, type FreeSlot } from '@/services/api/availabilityApi';
import type { Commande } from '@/types/commande';
import { CalendarClock, CheckCircle2, AlertTriangle, Loader2, Package, User, MapPin, Phone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  commande: Commande | null;
  onClose: () => void;
  onConfirm: (payload: { date: string; heureDebut: string; heureFin: string }) => Promise<void> | void;
}

const todayISO = () => new Date().toISOString().split('T')[0];

const CommandeArriveePlanifDialog: React.FC<Props> = ({ isOpen, commande, onClose, onConfirm }) => {
  const [date, setDate] = useState<string>('');
  const [heureDebut, setHeureDebut] = useState<string>('09:00');
  const [heureFin, setHeureFin] = useState<string>('10:00');
  const [busy, setBusy] = useState<BusySlot[]>([]);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [conflicts, setConflicts] = useState<BusySlot[]>([]);

  useEffect(() => {
    if (!isOpen || !commande) return;
    setDate(commande.dateArrivagePrevue || commande.dateEcheance || todayISO());
    if (commande.horaire && commande.horaire.includes('-')) {
      const [a, b] = commande.horaire.split('-').map(s => s.trim());
      setHeureDebut(a || '09:00'); setHeureFin(b || '10:00');
    } else {
      setHeureDebut(commande.horaire || '09:00');
      setHeureFin(commande.horaireFin || '10:00');
    }
    setAvailable(null); setConflicts([]);
  }, [isOpen, commande]);

  // Fetch busy/free when date changes
  useEffect(() => {
    if (!isOpen || !date) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await availabilityApi.getSlots(date, commande?.id);
        if (cancelled) return;
        setBusy(data.busy || []);
        setFreeSlots(data.freeSlots || []);
      } catch {
        if (!cancelled) { setBusy([]); setFreeSlots([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, date, commande?.id]);

  // Live availability check on time change
  useEffect(() => {
    if (!isOpen || !date || !heureDebut || !heureFin) return;
    if (heureFin <= heureDebut) { setAvailable(false); setConflicts([]); return; }
    let cancelled = false;
    setChecking(true);
    (async () => {
      try {
        const { data } = await availabilityApi.check(date, heureDebut, heureFin, commande?.id);
        if (cancelled) return;
        setAvailable(data.available);
        setConflicts(data.conflicts || []);
      } catch {
        if (!cancelled) { setAvailable(null); setConflicts([]); }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, date, heureDebut, heureFin, commande?.id]);

  const total = useMemo(() => (
    commande?.produits?.reduce((s, p) => s + (p.prixVente || 0) * (p.quantite || 0), 0) || 0
  ), [commande]);

  const handleValidate = async () => {
    if (!commande) return;
    if (heureFin <= heureDebut) {
      toast({ title: 'Horaire invalide', description: "L'heure de fin doit être après l'heure de début.", variant: 'destructive' });
      return;
    }
    if (available === false) {
      toast({ title: 'Créneau occupé', description: 'Ce créneau est déjà pris. Choisissez un autre horaire.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({ date, heureDebut, heureFin });
    } finally {
      setSubmitting(false);
    }
  };

  if (!commande) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarClock className="w-6 h-6 text-purple-600" />
            Planifier l'arrivée de la commande
          </DialogTitle>
          <DialogDescription>
            Vérification simultanée des disponibilités : Commandes · Rendez-vous · Tâches
          </DialogDescription>
        </DialogHeader>

        {/* Résumé commande */}
        <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 space-y-2">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1"><User className="w-4 h-4" /> <span className="font-semibold">{commande.clientNom}</span></div>
            {commande.clientPhone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {commande.clientPhone}</div>}
            {commande.clientAddress && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {commande.clientAddress}</div>}
          </div>
          <div className="text-sm space-y-1">
            {commande.produits.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-medium">{p.nom}</span>
                <span className="text-muted-foreground">× {p.quantite}</span>
                <span className="ml-auto font-semibold">{(p.prixVente * p.quantite).toFixed(2)} €</span>
              </div>
            ))}
            <div className="pt-2 border-t flex justify-between font-bold">
              <span>Total</span><span>{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Sélecteurs date/heure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Heure début</Label>
            <Input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} />
          </div>
          <div>
            <Label>Heure fin</Label>
            <Input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
          </div>
        </div>

        {/* Disponibilité */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            {checking ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Vérification…</>
            ) : available === true ? (
              <><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="text-green-700">Créneau libre pour commandes, RDV et tâches.</span></>
            ) : available === false ? (
              <><AlertTriangle className="w-4 h-4 text-red-600" /> <span className="text-red-700">Créneau occupé</span></>
            ) : <span className="text-muted-foreground">Choisissez une date et un horaire.</span>}
          </div>
          {available === false && conflicts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {conflicts.map((c, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {c.source === 'commande' ? '📦' : c.source === 'rdv' ? '📅' : '📝'} {c.start}–{c.end} · {c.label}
                </Badge>
              ))}
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Créneaux libres ce jour-là :</div>
            <div className="flex flex-wrap gap-1.5">
              {freeSlots.length === 0 && <span className="text-xs text-muted-foreground">Aucun créneau libre.</span>}
              {freeSlots.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setHeureDebut(s.start); setHeureFin(s.end); }}
                  className="text-xs px-2 py-1 rounded-md border bg-green-50 hover:bg-green-100 text-green-700 border-green-200 transition"
                >
                  {s.start} – {s.end}
                </button>
              ))}
            </div>
            {busy.length > 0 && (
              <>
                <div className="text-xs text-muted-foreground mt-2 mb-1">Occupé :</div>
                <div className="flex flex-wrap gap-1.5">
                  {busy.map((b, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-md border bg-red-50 text-red-700 border-red-200">
                      {b.source === 'commande' ? '📦' : b.source === 'rdv' ? '📅' : '📝'} {b.start}–{b.end}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button
            onClick={handleValidate}
            disabled={submitting || checking || available === false || heureFin <= heureDebut}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enregistrement…</> : 'Confirmer l\'arrivée & planifier RDV + Tâche'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommandeArriveePlanifDialog;
