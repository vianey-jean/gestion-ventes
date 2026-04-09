import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Building2, Search, User, X, AlertTriangle, Calendar, CalendarRange, CalendarDays, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Travailleur } from '@/services/api/travailleurApi';
import { Entreprise } from '@/services/api/entrepriseApi';
import pointageApi, { PointageEntry } from '@/services/api/pointageApi';
import avanceApi, { Avance } from '@/services/api/avanceApi';
import { useToast } from '@/hooks/use-toast';

interface AvanceModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  travailleurs: Travailleur[];
  entreprises: Entreprise[];
  premiumBtnClass: string;
  mirrorShine: string;
}

type Mode = 'week' | 'month' | 'year';

interface WeekGroup {
  key: string;
  label: string;
  start: Date;
  end: Date;
  pointages: PointageEntry[];
  total: number;
}

interface MonthGroup {
  key: string;
  label: string;
  month: number;
  year: number;
  pointages: PointageEntry[];
  total: number;
}

// Parse date string to Date without timezone issues
const parseDate = (dateStr: string): Date => {
  const parts = dateStr.split('T')[0].split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

// Get Monday of the week for a given date
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Get Sunday of the week for a given date
const getSunday = (d: Date): Date => {
  const monday = getMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

// Format date as "dd/mm"
const fmtShort = (d: Date) => {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Format date as "lundi dd mois"
const fmtDay = (d: Date) => {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const AvanceModal: React.FC<AvanceModalProps> = ({
  open, onOpenChange, travailleurs, entreprises, premiumBtnClass, mirrorShine
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('week');
  const [travSearch, setTravSearch] = useState('');
  const [travId, setTravId] = useState('');
  const [travNom, setTravNom] = useState('');
  const [showTravDropdown, setShowTravDropdown] = useState(false);
  const [entrepriseId, setEntrepriseId] = useState('');
  const [montantAvance, setMontantAvance] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data
  const [allPointages, setAllPointages] = useState<PointageEntry[]>([]);
  const [allAvances, setAllAvances] = useState<Avance[]>([]);

  // Selections
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [selectedPointageIds, setSelectedPointageIds] = useState<Set<string>>(new Set());

  const now = new Date();
  const currentYear = now.getFullYear();

  useEffect(() => {
    if (!open) {
      setTravSearch(''); setTravId(''); setTravNom('');
      setEntrepriseId(''); setMontantAvance(''); setConfirmSave(false);
      setMode('week'); setAllPointages([]); setAllAvances([]);
      setSelectedWeeks(new Set()); setSelectedMonths(new Set()); setSelectedPointageIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowTravDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredTravailleurs = travSearch.length >= 3
    ? travailleurs.filter(t => {
      const q = travSearch.toLowerCase();
      return `${t.prenom} ${t.nom}`.toLowerCase().includes(q) || `${t.nom} ${t.prenom}`.toLowerCase().includes(q);
    })
    : [];

  const hasEntrepriseFilter = entrepriseId && entrepriseId !== 'all';

  // Load all data when travailleur is selected
  useEffect(() => {
    if (!travId) { setAllPointages([]); setAllAvances([]); return; }
    const load = async () => {
      setLoadingData(true);
      try {
        // Fetch current year and previous year (for week overlap at year boundary)
        const [ptCur, ptPrev, avAll] = await Promise.all([
          pointageApi.getByYear(currentYear),
          pointageApi.getByYear(currentYear - 1),
          avanceApi.getAll()
        ]);
        const allPt = [...(ptPrev.data || []), ...(ptCur.data || [])];
        // Deduplicate
        const seen = new Set<string>();
        const deduped = allPt.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        setAllPointages(deduped);
        setAllAvances(avAll.data || []);
      } catch {
        setAllPointages([]); setAllAvances([]);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [travId, currentYear]);

  // Reset selections when mode/entreprise changes
  useEffect(() => {
    setSelectedWeeks(new Set());
    setSelectedMonths(new Set());
    setSelectedPointageIds(new Set());
    setMontantAvance('');
    setConfirmSave(false);
  }, [mode, entrepriseId, travId]);

  // Get pointage IDs already taken by avances for this worker
  const takenPointageIds = useMemo(() => {
    const ids = new Set<string>();
    allAvances
      .filter(a => a.travailleurId === travId)
      .forEach(a => {
        if (a.pointageIds && Array.isArray(a.pointageIds)) {
          a.pointageIds.forEach(id => ids.add(id));
        }
      });
    return ids;
  }, [allAvances, travId]);

  // Available (untaken) pointages for this worker, filtered by enterprise
  const availablePointages = useMemo(() => {
    let pts = allPointages.filter(p => p.travailleurId === travId && !takenPointageIds.has(p.id));
    if (hasEntrepriseFilter) pts = pts.filter(p => p.entrepriseId === entrepriseId);
    return pts.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  }, [allPointages, travId, takenPointageIds, hasEntrepriseFilter, entrepriseId]);

  // Group by weeks
  const weekGroups = useMemo((): WeekGroup[] => {
    const map = new Map<string, WeekGroup>();
    availablePointages.forEach(p => {
      const d = parseDate(p.date);
      const monday = getMonday(d);
      const sunday = getSunday(d);
      const key = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${fmtDay(monday)} → ${fmtDay(sunday)}`,
          start: monday,
          end: sunday,
          pointages: [],
          total: 0,
        });
      }
      const g = map.get(key)!;
      g.pointages.push(p);
      g.total += p.montantTotal || 0;
    });
    return Array.from(map.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [availablePointages]);

  // Group by months
  const monthGroups = useMemo((): MonthGroup[] => {
    const map = new Map<string, MonthGroup>();
    availablePointages.forEach(p => {
      const d = parseDate(p.date);
      // Use week-based month assignment: the month of the Monday of that week
      const monday = getMonday(d);
      const m = monday.getMonth() + 1;
      const y = monday.getFullYear();
      const key = `${y}-${m.toString().padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${monthNames[m - 1]} ${y}`,
          month: m,
          year: y,
          pointages: [],
          total: 0,
        });
      }
      const g = map.get(key)!;
      g.pointages.push(p);
      g.total += p.montantTotal || 0;
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [availablePointages]);

  // Compute selected pointage IDs based on mode
  const effectiveSelectedIds = useMemo((): Set<string> => {
    if (mode === 'week') {
      const ids = new Set<string>();
      weekGroups.filter(g => selectedWeeks.has(g.key)).forEach(g => g.pointages.forEach(p => ids.add(p.id)));
      return ids;
    }
    if (mode === 'month') {
      const ids = new Set<string>();
      monthGroups.filter(g => selectedMonths.has(g.key)).forEach(g => g.pointages.forEach(p => ids.add(p.id)));
      return ids;
    }
    // year mode - direct selection
    return selectedPointageIds;
  }, [mode, selectedWeeks, selectedMonths, selectedPointageIds, weekGroups, monthGroups]);

  const selectedTotal = useMemo(() => {
    return availablePointages
      .filter(p => effectiveSelectedIds.has(p.id))
      .reduce((s, p) => s + (p.montantTotal || 0), 0);
  }, [availablePointages, effectiveSelectedIds]);

  const montantNum = parseFloat(montantAvance) || 0;
  const depassement = montantNum > selectedTotal;
  const resteApres = selectedTotal - montantNum;

  const toggleWeek = useCallback((key: string) => {
    setSelectedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const toggleMonth = useCallback((key: string) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const togglePointage = useCallback((id: string) => {
    setSelectedPointageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAllYear = useCallback(() => {
    setSelectedPointageIds(new Set(availablePointages.map(p => p.id)));
  }, [availablePointages]);

  const deselectAllYear = useCallback(() => {
    setSelectedPointageIds(new Set());
  }, []);

  const handleSave = async () => {
    if (!travId || montantNum <= 0 || depassement || effectiveSelectedIds.size === 0) return;
    setLoading(true);
    try {
      const entNom = entreprises.find(e => e.id === entrepriseId)?.nom || '';
      await avanceApi.create({
        travailleurId: travId,
        travailleurNom: travNom,
        entrepriseId: hasEntrepriseFilter ? entrepriseId : '',
        entrepriseNom: entNom,
        montant: montantNum,
        totalPointage: selectedTotal,
        resteApresAvance: resteApres,
        pointageIds: Array.from(effectiveSelectedIds),
        mois: now.getMonth() + 1,
        annee: currentYear,
      });
      toast({ title: '✅ Avance enregistrée', description: `${travNom} - ${montantNum.toFixed(2)}€` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmSave(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/20 to-orange-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Banknote className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            💰 Prise d'Avance
          </DialogTitle>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="flex gap-1.5 mb-2">
          {([
            { key: 'week' as Mode, icon: CalendarDays, label: 'Semaine', active: 'from-green-500 to-emerald-500' },
            { key: 'month' as Mode, icon: Calendar, label: 'Mois', active: 'from-amber-500 to-orange-500' },
            { key: 'year' as Mode, icon: CalendarRange, label: 'Année', active: 'from-purple-500 to-indigo-500' },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setMode(tab.key)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all",
                mode === tab.key ? `bg-gradient-to-r ${tab.active} text-white shadow-lg` : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10")}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Travailleur search */}
          <div className="space-y-2" ref={dropdownRef}>
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" /> Personne (min. 3 caractères)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input value={travSearch}
                onChange={e => {
                  setTravSearch(e.target.value);
                  setTravId(''); setTravNom('');
                  if (e.target.value.length >= 3) setShowTravDropdown(true);
                  else setShowTravDropdown(false);
                }}
                placeholder="Nom et prénom..."
                className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40 pl-10"
              />
              {showTravDropdown && filteredTravailleurs.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-slate-800/95 backdrop-blur-2xl border border-white/20 shadow-2xl">
                  {filteredTravailleurs.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => {
                        setTravId(t.id);
                        setTravNom(`${t.prenom} ${t.nom}`);
                        setTravSearch(`${t.prenom} ${t.nom}`);
                        setShowTravDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                        {t.prenom[0]}{t.nom[0]}
                      </div>
                      <div className="text-sm font-bold text-white">{t.prenom} {t.nom}</div>
                    </button>
                  ))}
                </div>
              )}
              {travNom && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{travNom}</span>
                  <button onClick={() => { setTravId(''); setTravNom(''); setTravSearch(''); }}
                    className="ml-auto text-white/50 hover:text-white"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Entreprise select */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" /> Entreprise (optionnel)
            </Label>
            <Select value={entrepriseId} onValueChange={setEntrepriseId}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white">
                <SelectValue placeholder="Toutes les entreprises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {entreprises.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Selection area */}
          {travId && (
            <div className="space-y-3">
              {loadingData ? (
                <p className="text-white/50 text-sm text-center animate-pulse py-4">Chargement des pointages...</p>
              ) : (
                <>
                  {/* WEEK MODE */}
                  {mode === 'week' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Sélectionnez les semaines</p>
                      {weekGroups.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-3">Aucun pointage disponible</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {weekGroups.map(g => {
                            const selected = selectedWeeks.has(g.key);
                            return (
                              <button key={g.key} onClick={() => toggleWeek(g.key)}
                                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                                  selected ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10")}>
                                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0",
                                  selected ? "bg-emerald-500" : "bg-white/10 border border-white/20")}>
                                  {selected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white/90 truncate">{g.label}</p>
                                  <p className="text-[10px] text-white/50">{g.pointages.length} pointage(s)</p>
                                </div>
                                <span className="text-sm font-black text-emerald-400">{g.total.toFixed(2)}€</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MONTH MODE */}
                  {mode === 'month' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Sélectionnez les mois</p>
                      {monthGroups.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-3">Aucun pointage disponible</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {monthGroups.map(g => {
                            const selected = selectedMonths.has(g.key);
                            return (
                              <button key={g.key} onClick={() => toggleMonth(g.key)}
                                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                                  selected ? "bg-amber-500/20 border border-amber-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10")}>
                                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0",
                                  selected ? "bg-amber-500" : "bg-white/10 border border-white/20")}>
                                  {selected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white/90">{g.label}</p>
                                  <p className="text-[10px] text-white/50">{g.pointages.length} pointage(s) restant(s)</p>
                                </div>
                                <span className="text-sm font-black text-amber-400">{g.total.toFixed(2)}€</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* YEAR MODE */}
                  {mode === 'year' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Pointages disponibles</p>
                        <div className="flex gap-1">
                          <button onClick={selectAllYear} className="text-[10px] font-bold text-purple-400 hover:text-purple-300 px-2 py-0.5 rounded bg-purple-500/10">Tout</button>
                          <button onClick={deselectAllYear} className="text-[10px] font-bold text-white/40 hover:text-white/60 px-2 py-0.5 rounded bg-white/5">Aucun</button>
                        </div>
                      </div>
                      {availablePointages.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-3">Aucun pointage disponible</p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                          {availablePointages.map(p => {
                            const selected = selectedPointageIds.has(p.id);
                            const d = parseDate(p.date);
                            const entName = p.entrepriseNom || entreprises.find(e => e.id === p.entrepriseId)?.nom || '';
                            return (
                              <button key={p.id} onClick={() => togglePointage(p.id)}
                                className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all",
                                  selected ? "bg-purple-500/20 border border-purple-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10")}>
                                <div className={cn("w-4 h-4 rounded flex items-center justify-center flex-shrink-0",
                                  selected ? "bg-purple-500" : "bg-white/10 border border-white/20")}>
                                  {selected && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-white/80">{fmtDay(d)}</p>
                                  {entName && <p className="text-[10px] text-white/40 truncate">{entName}</p>}
                                </div>
                                <span className="text-xs font-black text-purple-400">{(p.montantTotal || 0).toFixed(2)}€</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  {effectiveSelectedIds.size > 0 && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">{effectiveSelectedIds.size} pointage(s) sélectionné(s)</span>
                        <span className="text-lg font-black text-emerald-400">{selectedTotal.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Avance amount */}
          {effectiveSelectedIds.size > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-amber-400" /> Montant de l'avance
              </Label>
              <Input type="number" min="0" max={selectedTotal}
                value={montantAvance}
                onChange={e => setMontantAvance(e.target.value)}
                placeholder="0.00"
                className={cn("bg-white/10 border rounded-xl text-white text-lg font-bold", depassement ? "border-red-500" : "border-white/20")}
              />
              {depassement && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" /> Le montant dépasse le disponible ({selectedTotal.toFixed(2)}€)
                </div>
              )}
              {montantNum > 0 && !depassement && (
                <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-300">Reste après avance</span>
                  <span className="text-sm font-black text-emerald-400">{resteApres.toFixed(2)}€</span>
                </div>
              )}
            </div>
          )}

          {/* Confirm */}
          {confirmSave ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <p className="text-sm font-bold text-amber-300">⚠️ Confirmer l'enregistrement de cette avance de {montantNum.toFixed(2)}€ pour {travNom} ?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmSave(false)}
                  className="flex-1 rounded-xl border-white/20 font-bold  !text-gray-600 hover:!bg-red-500 hover:!text-white"
                >
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={loading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                  {loading ? '⏳...' : '✅ Confirmer'}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmSave(true)}
              disabled={!travId || montantNum <= 0 || depassement || loading || effectiveSelectedIds.size === 0}
              className={cn(premiumBtnClass, "w-full bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)] disabled:opacity-50")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">
                💰 Enregistrer l'avance
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvanceModal;
