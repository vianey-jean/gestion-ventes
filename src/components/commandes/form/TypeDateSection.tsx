/**
 * Section Type & Planification — extraite de CommandeFormDialog
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Zap, CalendarClock, Plus, Trash2 } from 'lucide-react';

export interface TypeDateSectionProps {
  type: 'commande' | 'reservation' | 'rdv';
  setType: (v: 'commande' | 'reservation' | 'rdv') => void;
  localRdvMode: boolean;
  setLocalRdvMode: (v: boolean) => void;

  ulterieurConfig?: { mode: 'date' | 'inconnu'; date?: string } | null;
  onOpenUlterieurModal?: () => void;

  rdvDate: string;
  setRdvDate: (v: string) => void;

  dateArrivagePrevue: string;
  setDateArrivagePrevue: (v: string) => void;
  dateEcheance: string;
  setDateEcheance: (v: string) => void;

  horaire: string;
  setHoraire: (v: string) => void;
  horaireFin: string;
  setHoraireFin?: (v: string) => void;
  showHeureFin: boolean;
  setShowHeureFin: (v: boolean) => void;
}

const TypeDateSection: React.FC<TypeDateSectionProps> = ({
  type, setType, localRdvMode, setLocalRdvMode,
  ulterieurConfig, onOpenUlterieurModal,
  rdvDate, setRdvDate,
  dateArrivagePrevue, setDateArrivagePrevue,
  dateEcheance, setDateEcheance,
  horaire, setHoraire, horaireFin, setHoraireFin, showHeureFin, setShowHeureFin,
}) => {
  return (
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
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={localRdvMode ? 'rdv' : type}
                onValueChange={(value: string) => {
                  if (value === 'rdv') { setLocalRdvMode(true); setType('rdv'); }
                  else { setLocalRdvMode(false); setType(value as 'commande' | 'reservation'); }
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
            {type === 'reservation' && !localRdvMode && onOpenUlterieurModal && (
              <button
                type="button"
                onClick={onOpenUlterieurModal}
                title="Réservation ultérieure"
                className={`relative shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg group ${
                  ulterieurConfig
                    ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white ring-2 ring-orange-300 animate-pulse'
                    : 'bg-white/70 dark:bg-gray-900/70 border-2 border-amber-300 text-amber-600 hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100'
                }`}
              >
                <CalendarClock className="h-5 w-5" />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-amber-900 text-white text-[10px] px-2 py-1 rounded-md shadow-xl">
                  Réservation ultérieure
                </span>
              </button>
            )}
          </div>
        </div>

        {localRdvMode ? (
          <div>
            <Label htmlFor="rdvDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              📅 Date du RDV
            </Label>
            <Input id="rdvDate" type="date" value={rdvDate}
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
            <Input id="dateArrivagePrevue" type="date" value={dateArrivagePrevue}
              onChange={(e) => setDateArrivagePrevue(e.target.value)}
              className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
              required
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="dateEcheance" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              📅 Date d'échéance {ulterieurConfig && <span className="text-xs text-amber-600">(verrouillée — mode ultérieur)</span>}
            </Label>
            <Input
              id="dateEcheance"
              type="date"
              value={ulterieurConfig ? (ulterieurConfig.date || '') : dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
              disabled={!!ulterieurConfig}
              className={`border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm ${ulterieurConfig ? 'opacity-60 cursor-not-allowed bg-amber-50 dark:bg-amber-950/30' : ''}`}
              required={!ulterieurConfig}
            />
            {ulterieurConfig && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {ulterieurConfig.mode === 'date'
                  ? `Réservation ultérieure au ${new Date(ulterieurConfig.date!).toLocaleDateString('fr-FR')} — modifiable via la bascule "En attente".`
                  : `Réservation ultérieure sans date — expire dans 10 jours si non basculée.`}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="horaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ⏰ Horaire (optionnel) {ulterieurConfig && <span className="text-xs text-amber-600">(verrouillé)</span>}
          </Label>
          {!showHeureFin && !ulterieurConfig && (
            <Button type="button" size="sm" variant="outline"
              onClick={() => setShowHeureFin(true)}
              className="h-7 px-2 border-green-400 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
              title="Définir une heure de fin personnalisée"
            >
              <Plus className="w-4 h-4 mr-1" /> Heure fin
            </Button>
          )}
        </div>
        <div className={showHeureFin ? 'grid grid-cols-2 gap-3' : ''}>
          <Input id="horaire" type="time" value={horaire}
            onChange={(e) => setHoraire(e.target.value)}
            disabled={!!ulterieurConfig}
            className={`border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm ${ulterieurConfig ? 'opacity-60 cursor-not-allowed bg-amber-50 dark:bg-amber-950/30' : ''}`}
            placeholder="Heure de début"
          />
          {showHeureFin && (
            <div className="relative">
              <Input id="horaireFin" type="time" value={horaireFin}
                onChange={(e) => setHoraireFin?.(e.target.value)}
                disabled={!!ulterieurConfig}
                className={`border-2 border-emerald-400 dark:border-emerald-600 focus:border-emerald-500 bg-white dark:bg-gray-900 shadow-sm pr-9 ${ulterieurConfig ? 'opacity-60 cursor-not-allowed bg-amber-50 dark:bg-amber-950/30' : ''}`}
                placeholder="Heure de fin"
              />
              {!ulterieurConfig && (
                <button
                  type="button"
                  onClick={() => { setHoraireFin?.(''); setShowHeureFin(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  title="Retirer (auto +1h)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        {!showHeureFin && horaire && !ulterieurConfig && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Heure de fin auto: +1h après {horaire}
          </p>
        )}
        {ulterieurConfig && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Horaire à définir lors du passage au statut « En attente ».
          </p>
        )}
      </div>
    </div>
  );
};

export default TypeDateSection;
