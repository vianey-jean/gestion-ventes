import React, { useState, useEffect } from 'react';
import { X, Share2, Filter, User, Calendar, Building2, AlertTriangle, Plus, Copy, Check, KeyRound, LinkIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import travailleurApi, { Travailleur } from '@/services/api/travailleurApi';
import entrepriseApi, { Entreprise } from '@/services/api/entrepriseApi';
import shareLinksApi, { ShareLink } from '@/services/api/shareLinksApi';

type DateFilterMode = 'jours' | 'semaines' | 'mois' | 'annees';
type ShareType = 'pointage' | 'taches';

interface SelectiveShareModalProps {
  open: boolean;
  onClose: () => void;
  type: ShareType;
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_OF_WEEK = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const SelectiveShareModal: React.FC<SelectiveShareModalProps> = ({ open, onClose, type }) => {
  const { toast } = useToast();

  // Data
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);

  // Filters
  const [selectedPersonne, setSelectedPersonne] = useState<string>('all'); // 'all' or travailleur id
  const [dateMode, setDateMode] = useState<DateFilterMode>('mois');
  const [selectAll, setSelectAll] = useState(true);

  // Date selections
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayInput, setDayInput] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]); // 'YYYY-Wxx'
  const [weekYear, setWeekYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]); // 0-11
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear());
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // Pointage-specific
  const [selectedEntreprises, setSelectedEntreprises] = useState<string[]>([]); // 'all' handled separately
  const [allEntreprises, setAllEntreprises] = useState(true);

  // Taches-specific
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'pertinent' | 'optionnel'>('all');

  // Link count
  const [linkCount, setLinkCount] = useState(1);

  // Generated links
  const [generatedLinks, setGeneratedLinks] = useState<ShareLink[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [step, setStep] = useState<'filters' | 'count' | 'result'>('filters');

  useEffect(() => {
    if (open) {
      loadData();
      setStep('filters');
      setGeneratedLinks([]);
      setSelectAll(true);
      setSelectedPersonne('all');
      setDateMode('mois');
      setAllEntreprises(true);
      setImportanceFilter('all');
      setLinkCount(1);
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [travRes, entRes] = await Promise.all([
        travailleurApi.getAll(),
        entrepriseApi.getAll()
      ]);
      setTravailleurs(travRes.data);
      setEntreprises(entRes.data);
    } catch {
      // ignore
    }
  };

  const buildFilters = () => {
    const filters: any = {
      type,
      personne: selectedPersonne,
    };

    if (selectAll) {
      filters.dateFilter = { mode: 'all' };
    } else {
      if (dateMode === 'jours') {
        filters.dateFilter = { mode: 'jours', days: selectedDays };
      } else if (dateMode === 'semaines') {
        filters.dateFilter = { mode: 'semaines', weeks: selectedWeeks, year: weekYear };
      } else if (dateMode === 'mois') {
        filters.dateFilter = { mode: 'mois', months: selectedMonths, year: selectedMonthYear };
      } else if (dateMode === 'annees') {
        filters.dateFilter = { mode: 'annees', years: selectedYears };
      }
    }

    if (type === 'pointage') {
      filters.entreprises = allEntreprises ? 'all' : selectedEntreprises;
    }
    if (type === 'taches') {
      filters.importance = importanceFilter;
    }

    return filters;
  };

  const handleValidate = () => {
    setStep('count');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const filters = buildFilters();
      const links: ShareLink[] = [];
      for (let i = 0; i < linkCount; i++) {
        const res = await shareLinksApi.generate(type, filters);
        const d = res.data;
        links.push({
          id: Date.now().toString() + i,
          token: d.token,
          accessCode: d.accessCode,
          type,
          createdAt: d.createdAt
        });
      }
      setGeneratedLinks(links);
      setStep('result');
      toast({ title: `✅ ${linkCount} lien(s) créé(s)` });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (link: ShareLink) => {
    const url = `${window.location.origin}/shared/${link.token}`;
    const text = `🔗 Lien: ${url}\n🔑 Code d'accès: ${link.accessCode}`;
    navigator.clipboard.writeText(text);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✅ Lien et code copiés !' });
  };

  const addDay = () => {
    if (dayInput && !selectedDays.includes(dayInput)) {
      setSelectedDays(prev => [...prev, dayInput]);
      setDayInput('');
    }
  };

  const toggleMonth = (m: number) => {
    setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleYear = (y: number) => {
    setSelectedYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]);
  };

  const toggleEntreprise = (id: string) => {
    setSelectedEntreprises(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getWeeksOfYear = (y: number) => {
    const weeks: string[] = [];
    for (let w = 1; w <= 52; w++) {
      weeks.push(`${y}-W${String(w).padStart(2, '0')}`);
    }
    return weeks;
  };

  const toggleWeek = (w: string) => {
    setSelectedWeeks(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 p-5 max-w-xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-violet-400" />
            <h3 className="font-bold text-white text-sm">
              Partage sélectif — {type === 'pointage' ? 'Pointage' : 'Tâches'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {step === 'filters' && (
            <>
              {/* Personne */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-400" /> Personne
                </label>
                <select
                  value={selectedPersonne}
                  onChange={e => setSelectedPersonne(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-violet-500 focus:outline-none"
                >
                  <option value="all" className="bg-slate-800">Toutes les personnes</option>
                  {travailleurs.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-800">
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Période
                </label>

                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={e => setSelectAll(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    Toutes les dates
                  </label>
                </div>

                {!selectAll && (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(['jours', 'semaines', 'mois', 'annees'] as DateFilterMode[]).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setDateMode(mode)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                            dateMode === mode
                              ? 'bg-violet-500 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          )}
                        >
                          {mode === 'jours' ? 'Jours' : mode === 'semaines' ? 'Semaines' : mode === 'mois' ? 'Mois' : 'Années'}
                        </button>
                      ))}
                    </div>

                    {/* Jours */}
                    {dateMode === 'jours' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={dayInput}
                            onChange={e => setDayInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          />
                          <button onClick={addDay} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {selectedDays.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedDays.map(d => (
                              <span key={d} className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-[10px] font-bold flex items-center gap-1">
                                {d}
                                <button onClick={() => setSelectedDays(prev => prev.filter(x => x !== d))}>
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Semaines */}
                    {dateMode === 'semaines' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-white/50">Année:</span>
                          <select
                            value={weekYear}
                            onChange={e => setWeekYear(Number(e.target.value))}
                            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          >
                            {yearOptions.map(y => <option key={y} value={y} className="bg-slate-800">{y}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                          {getWeeksOfYear(weekYear).map(w => {
                            const weekNum = w.split('-W')[1];
                            return (
                              <button
                                key={w}
                                onClick={() => toggleWeek(w)}
                                className={cn(
                                  'px-1.5 py-1 rounded text-[10px] font-bold transition-all',
                                  selectedWeeks.includes(w)
                                    ? 'bg-violet-500 text-white'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                )}
                              >
                                S{weekNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Mois */}
                    {dateMode === 'mois' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-white/50">Année:</span>
                          <select
                            value={selectedMonthYear}
                            onChange={e => setSelectedMonthYear(Number(e.target.value))}
                            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          >
                            {yearOptions.map(y => <option key={y} value={y} className="bg-slate-800">{y}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {MONTHS.map((m, i) => (
                            <button
                              key={i}
                              onClick={() => toggleMonth(i)}
                              className={cn(
                                'px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                                selectedMonths.includes(i)
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                              )}
                            >
                              {m.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Années */}
                    {dateMode === 'annees' && (
                      <div className="flex flex-wrap gap-2">
                        {yearOptions.map(y => (
                          <button
                            key={y}
                            onClick={() => toggleYear(y)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-bold transition-all',
                              selectedYears.includes(y)
                                ? 'bg-violet-500 text-white'
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            )}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Entreprises (pointage only) */}
              {type === 'pointage' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400" /> Entreprises
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={allEntreprises}
                      onChange={e => setAllEntreprises(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    Toutes les entreprises
                  </label>
                  {!allEntreprises && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {entreprises.map(e => (
                        <button
                          key={e.id}
                          onClick={() => toggleEntreprise(e.id)}
                          className={cn(
                            'px-3 py-2 rounded-lg text-xs font-bold transition-all text-left',
                            selectedEntreprises.includes(e.id)
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                          )}
                        >
                          {e.nom}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Importance (taches only) */}
              {type === 'taches' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Importance
                  </label>
                  <div className="flex gap-2">
                    {([
                      { value: 'all', label: 'Toutes', color: 'bg-violet-500' },
                      { value: 'pertinent', label: '🔴 Pertinentes', color: 'bg-red-500' },
                      { value: 'optionnel', label: '🟢 Optionnelles', color: 'bg-emerald-500' },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setImportanceFilter(opt.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                          importanceFilter === opt.value
                            ? `${opt.color} text-white`
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleValidate}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 mt-2"
              >
                Valider les filtres
              </button>
            </>
          )}

          {step === 'count' && (
            <div className="space-y-4">
              <p className="text-sm text-white/70 text-center">Combien de liens souhaitez-vous créer ?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setLinkCount(Math.max(1, linkCount - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors"
                >
                  -
                </button>
                <span className="text-3xl font-black text-violet-400 w-12 text-center">{linkCount}</span>
                <button
                  onClick={() => setLinkCount(linkCount + 1)}
                  className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] text-white/40 text-center">Chaque lien aura son propre code d'accès unique</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('filters')}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {generating ? 'Création...' : 'Générer'}
                </button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 text-center mb-2">
                {generatedLinks.length} lien(s) créé(s) avec succès. Copiez et partagez-les.
              </p>
              {generatedLinks.map(link => (
                <div key={link.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-white/60 font-mono break-all bg-white/5 rounded-lg px-2 py-1.5 mb-2">
                    {`${window.location.origin}/shared/${link.token}`}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-bold text-amber-400 font-mono tracking-widest">{link.accessCode}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(link)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copier
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all mt-2"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectiveShareModal;
