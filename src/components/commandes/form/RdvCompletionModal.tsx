/**
 * Modal de complétion RDV (rdv-taches.json) — extraite de CommandeFormDialog
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarClock } from 'lucide-react';

interface PersonneOption { id: string; nom: string; prenom: string; phone?: string; }
interface TacheOption { id: string; nom: string; }

export interface RdvCompletionModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;

  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  rdvDate: string;
  horaire: string;
  computedHeureFin: string;

  personneQuery: string;
  setPersonneQuery: (v: string) => void;
  setRdvPersonneNom: (v: string) => void;
  showPersonneList: boolean;
  setShowPersonneList: (v: boolean) => void;
  personneOptions: PersonneOption[];

  tacheQuery: string;
  setTacheQuery: (v: string) => void;
  setRdvTacheNom: (v: string) => void;
  rdvTacheNom: string;
  showTacheList: boolean;
  setShowTacheList: (v: boolean) => void;
  tacheOptions: TacheOption[];

  rdvCommentaires: string;
  setRdvCommentaires: (v: string) => void;

  rdvStatut: 'planifie' | 'confirme' | 'reporte';
  setRdvStatut: (v: 'planifie' | 'confirme' | 'reporte') => void;

  submittingRdv: boolean;
  onSubmit: () => void;
}

const RdvCompletionModal: React.FC<RdvCompletionModalProps> = (props) => {
  const {
    open, onOpenChange,
    clientNom, clientPhone, clientAddress, rdvDate, horaire, computedHeureFin,
    personneQuery, setPersonneQuery, setRdvPersonneNom, showPersonneList, setShowPersonneList, personneOptions,
    tacheQuery, setTacheQuery, setRdvTacheNom, rdvTacheNom, showTacheList, setShowTacheList, tacheOptions,
    rdvCommentaires, setRdvCommentaires,
    rdvStatut, setRdvStatut,
    submittingRdv, onSubmit,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 dark:from-gray-900 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-300/60 dark:border-emerald-700/60 rounded-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span className="break-words">Compléter le rendez-vous</span>
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Les informations client, date et horaires sont déjà enregistrées. Complétez le reste pour créer le RDV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">👤 Client</div>
              <div className="font-semibold break-words">{clientNom}</div>
              <div className="text-xs break-all">{clientPhone}</div>
              <div className="text-xs break-words">{clientAddress}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
              <div className="text-xs text-muted-foreground mb-1">📅 Créneau</div>
              <div className="font-semibold break-words">{rdvDate}</div>
              <div className="text-xs">{horaire} → {computedHeureFin || horaire}</div>
            </div>
          </div>

          <div className="relative">
            <Label className="text-sm font-semibold">👥 Personne responsable</Label>
            <Input className="mt-1" value={personneQuery}
              onChange={(e) => { setPersonneQuery(e.target.value); setShowPersonneList(true); setRdvPersonneNom(e.target.value); }}
              onFocus={() => setShowPersonneList(true)}
              placeholder="Tapez au moins 3 caractères du nom..."
            />
            {showPersonneList && personneQuery.trim().length >= 3 && personneOptions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-52 overflow-auto rounded-xl border bg-white dark:bg-gray-900 shadow-xl">
                {personneOptions.map((p) => {
                  const full = `${p.prenom || ''} ${p.nom || ''}`.trim();
                  return (
                    <button type="button" key={p.id}
                      onClick={() => { setRdvPersonneNom(full); setPersonneQuery(full); setShowPersonneList(false); }}
                      className="block w-full text-left px-3 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors break-words"
                    >
                      {full} {p.phone ? `— ${p.phone}` : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <Label className="text-sm font-semibold">✂️ Tâche</Label>
            <Input className="mt-1" value={tacheQuery}
              onChange={(e) => { setTacheQuery(e.target.value); setShowTacheList(true); setRdvTacheNom(e.target.value); }}
              onFocus={() => setShowTacheList(true)}
              placeholder="Tapez 1 caractère pour voir la liste..."
            />
            {showTacheList && tacheOptions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-52 overflow-auto rounded-xl border bg-white dark:bg-gray-900 shadow-xl">
                {tacheOptions.map((t) => (
                  <button type="button" key={t.id}
                    onClick={() => { setRdvTacheNom(t.nom); setTacheQuery(t.nom); setShowTacheList(false); }}
                    className="block w-full text-left px-3 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors break-words"
                  >
                    {t.nom}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">📝 Commentaires</Label>
            <Textarea className="mt-1 resize-none" value={rdvCommentaires}
              onChange={(e) => setRdvCommentaires(e.target.value)}
              placeholder="Commentaires éventuels" rows={4}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">🚦 Statut</Label>
            <Select value={rdvStatut} onValueChange={(v: any) => setRdvStatut(v)}>
              <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planifie">Planifié</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="reporte">Reporté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
            <Button type="button" onClick={onSubmit} disabled={submittingRdv || !rdvTacheNom}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              Créer le RDV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RdvCompletionModal;
