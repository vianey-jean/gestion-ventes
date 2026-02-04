import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RdvCalendar, RdvForm, RdvCard } from '@/components/rdv';
import { ConfirmDialog } from '@/components/shared';
import { useRdv } from '@/hooks/useRdv';
import { RDV, RDVFormData } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PremiumLoading from '@/components/ui/premium-loading';
import { 
  Plus, 
  Calendar, 
  List, 
  Search,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Sparkles,
  Crown,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const RdvPage: React.FC = () => {
  const { rdvs, loading, createRdv, updateRdv, deleteRdv, markAsNotified, checkConflicts } = useRdv();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RDV | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rdvToDelete, setRdvToDelete] = useState<RDV | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();
  const [conflicts, setConflicts] = useState<RDV[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Pour le highlight du RDV depuis les notifications
  const [highlightRdvId, setHighlightRdvId] = useState<string | null>(null);
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer les params URL pour highlight du RDV depuis notification
  useEffect(() => {
    const rdvIdToHighlight = searchParams.get('highlightRdv');
    const dateToHighlight = searchParams.get('date');
    if (rdvIdToHighlight) {
      setHighlightRdvId(rdvIdToHighlight);
      setHighlightDate(dateToHighlight);
      setActiveTab('calendar');
    }
  }, [searchParams]);

  // Callback quand le highlight est terminé
  const handleHighlightComplete = useCallback(() => {
    setHighlightRdvId(null);
    setHighlightDate(null);
    // Nettoyer l'URL
    searchParams.delete('highlightRdv');
    searchParams.delete('date');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Stats du mois en cours uniquement (réinitialisé chaque mois)
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Filtrer uniquement les RDV du mois en cours
    const currentMonthOnly = rdvs.filter(rdv => {
      const rdvDate = parseISO(rdv.date);
      return isSameMonth(rdvDate, now);
    });
    
    const todayRdvs = currentMonthOnly.filter(r => r.date === today);
    const confirmedRdvs = currentMonthOnly.filter(r => r.statut === 'confirme');
    const pendingRdvs = currentMonthOnly.filter(r => r.statut === 'planifie');
    const cancelledRdvs = currentMonthOnly.filter(r => r.statut === 'annule');

    return {
      today: todayRdvs.length,
      confirmed: confirmedRdvs.length,
      pending: pendingRdvs.length,
      cancelled: cancelledRdvs.length,
      total: currentMonthOnly.length,
    };
  }, [rdvs]);

  // RDV du mois en cours (visibles - exclure annulés)
  const currentMonthRdvs = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return rdvs
      .filter(rdv => {
        const rdvDate = parseISO(rdv.date);
        return isSameMonth(rdvDate, now) && rdv.statut !== 'annule';
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.heureDebut.localeCompare(b.heureDebut);
      });
  }, [rdvs]);

  // Suggestions de recherche (mois en cours, après 3 caractères)
  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 3) return [];
    
    const query = searchQuery.toLowerCase();
    return currentMonthRdvs.filter(rdv =>
      rdv.titre.toLowerCase().includes(query) ||
      rdv.clientNom.toLowerCase().includes(query) ||
      rdv.description?.toLowerCase().includes(query) ||
      rdv.lieu?.toLowerCase().includes(query)
    ).slice(0, 10); // Limiter à 10 suggestions
  }, [currentMonthRdvs, searchQuery]);

  // Pagination des RDV du mois en cours
  const totalPages = Math.ceil(currentMonthRdvs.length / ITEMS_PER_PAGE);
  const paginatedRdvs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentMonthRdvs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentMonthRdvs, currentPage]);

  // RDV à venir (pour le calendrier)
  const upcomingRdvs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rdvs
      .filter(r => r.date >= today && r.statut !== 'annule')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.heureDebut.localeCompare(b.heureDebut);
      });
  }, [rdvs]);

  // Handlers
  const handleOpenForm = useCallback((rdv?: RDV, date?: string, time?: string) => {
    setSelectedRdv(rdv || null);
    setDefaultDate(date);
    setDefaultTime(time);
    setConflicts([]);
    setIsFormOpen(true);
    setShowSearchSuggestions(false);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedRdv(null);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setConflicts([]);
  }, []);

  const handleSubmit = useCallback(async (data: RDVFormData) => {
    // Vérifier les conflits
    const existingConflicts = await checkConflicts(
      data.date,
      data.heureDebut,
      data.heureFin,
      selectedRdv?.id
    );

    if (existingConflicts.length > 0) {
      setConflicts(existingConflicts);
    }

    if (selectedRdv) {
      await updateRdv(selectedRdv.id, data);
    } else {
      await createRdv(data);
    }
    handleCloseForm();
  }, [selectedRdv, updateRdv, createRdv, checkConflicts, handleCloseForm]);

  const handleDelete = useCallback(async () => {
    if (rdvToDelete) {
      await deleteRdv(rdvToDelete.id);
      setDeleteDialogOpen(false);
      setRdvToDelete(null);
    }
  }, [rdvToDelete, deleteRdv]);

  const confirmDelete = useCallback((rdv: RDV) => {
    setRdvToDelete(rdv);
    setDeleteDialogOpen(true);
  }, []);

  const handleRdvDrop = useCallback(async (rdv: RDV, newDate: string, newTime: string) => {
    const [startH, startM] = rdv.heureDebut.split(':').map(Number);
    const [endH, endM] = rdv.heureFin.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    const [newH, newM] = newTime.split(':').map(Number);
    const newEndMinutes = newH * 60 + newM + durationMinutes;
    const newEndH = Math.floor(newEndMinutes / 60);
    const newEndM = newEndMinutes % 60;
    const newHeureFin = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}`;

    await updateRdv(rdv.id, {
      date: newDate,
      heureDebut: newTime,
      heureFin: newHeureFin,
    });
  }, [updateRdv]);

  const handleSuggestionClick = (rdv: RDV) => {
    handleOpenForm(rdv);
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  const formatRdvDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  // Grouper les RDV par date
  const groupedRdvs = useMemo(() => {
    const groups: Record<string, RDV[]> = {};
    upcomingRdvs.forEach(rdv => {
      if (!groups[rdv.date]) groups[rdv.date] = [];
      groups[rdv.date].push(rdv);
    });
    return groups;
  }, [upcomingRdvs]);

  const statusColors: Record<string, string> = {
    planifie: 'bg-blue-500',
    confirme: 'bg-green-500',
    annule: 'bg-red-500',
    termine: 'bg-gray-500',
  };

  const statusLabels: Record<string, string> = {
    planifie: 'Planifié',
    confirme: 'Confirmé',
    annule: 'Annulé',
    termine: 'Terminé',
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
          <PremiumLoading 
            text="Chargement des rendez-vous..." 
            size="xl" 
            variant="dashboard"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
        {/* Hero Section Premium */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative overflow-hidden
          bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15
          backdrop-blur-2xl
          py-12 px-4 mb-10
          border-b border-white/30 dark:border-white/10
          shadow-[0_30px_80px_-20px_rgba(168,85,247,0.45)]
        "
      >
        {/* BACKGROUND LUXE */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-400/30 to-purple-500/30 rounded-full blur-[140px]" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* TITRE */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="
                    relative p-4 rounded-3xl
                    bg-gradient-to-br from-amber-400 via-purple-500 to-blue-500
                    shadow-[0_20px_50px_-10px_rgba(245,158,11,0.7)]
                    before:absolute before:inset-0 before:rounded-3xl
                    before:bg-white/20 before:blur-xl
                  "
                >
                  <Crown className="h-9 w-9 text-white drop-shadow-lg" />
                </div>

                <h1
                  className="
                    text-3xl md:text-4xl font-extrabold
                    bg-gradient-to-r from-amber-400 via-purple-400 to-blue-400
                    bg-clip-text text-transparent
                    tracking-tight
                  "
                >
                  Gestion des Rendez-vous
                </h1>

                <Sparkles className="h-6 w-6 text-amber-400 animate-pulse drop-shadow-md" />
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/30 backdrop-blur-md shadow">
                  <CalendarDays className="h-4 w-4 text-purple-600" />
                </span>
                Planifiez et gérez vos rendez-vous clients —
                <span className="font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent capitalize">
                  {format(new Date(), 'MMMM yyyy', { locale: fr })}
                </span>
              </p>
            </div>

            {/* BOUTON ULTRA LUXE */}
            <Button
              onClick={() => handleOpenForm()}
              size="lg"
              className="
                group relative overflow-hidden
                px-8 py-6 text-base md:text-lg font-semibold
                rounded-2xl
                bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500
                hover:from-amber-600 hover:via-purple-600 hover:to-blue-600
                text-white
                shadow-[0_25px_60px_-15px_rgba(168,85,247,0.7)]
                transition-all duration-300
                hover:scale-105
              "
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="relative h-5 w-5 mr-3 drop-shadow-lg group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative tracking-wide">
                Nouveau rendez-vous
              </span>
            </Button>

          </div>
        </div>
      </motion.div>


        <div className="max-w-7xl mx-auto px-4 pb-8">
          {/* Stats Cards Premium */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 mb-10">
          {/* AUJOURD’HUI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.04, y: -8 }}
          >
            <Card
              className="
                relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-blue-600/5
                backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_25px_60px_-15px_rgba(59,130,246,0.6)]
                transition-all duration-500
              "
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl" />

              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                      Aujourd&apos;hui
                    </p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
                      {stats.today}
                    </p>
                  </div>

                  <div
                    className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-blue-500 to-blue-700
                      shadow-[0_15px_40px_rgba(59,130,246,0.7)]
                    "
                  >
                    <Clock className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CE MOIS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.04, y: -8 }}
          >
            <Card
              className="
                relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-emerald-600/5
                backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_25px_60px_-15px_rgba(16,185,129,0.6)]
                transition-all duration-500
              "
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/30 rounded-full blur-3xl" />

              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">
                      Ce mois
                    </p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-700 bg-clip-text text-transparent">
                      {currentMonthRdvs.length}
                    </p>
                  </div>

                  <div
                    className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-emerald-500 to-emerald-700
                      shadow-[0_15px_40px_rgba(16,185,129,0.7)]
                    "
                  >
                    <TrendingUp className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EN ATTENTE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04, y: -8 }}
          >
            <Card
              className="
                relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-amber-500/25 via-orange-400/10 to-orange-600/5
                backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_25px_60px_-15px_rgba(245,158,11,0.6)]
                transition-all duration-500
              "
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/30 rounded-full blur-3xl" />

              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
                      En attente
                    </p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                      {stats.pending}
                    </p>
                  </div>

                  <div
                    className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-amber-500 to-orange-600
                      shadow-[0_15px_40px_rgba(245,158,11,0.7)]
                    "
                  >
                    <CalendarCheck className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* TOTAL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.04, y: -8 }}
          >
            <Card
              className="
                relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-purple-500/25 via-fuchsia-400/10 to-purple-700/5
                backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_25px_60px_-15px_rgba(168,85,247,0.7)]
                transition-all duration-500
              "
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl" />

              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-purple-500 font-semibold">
                      Total du mois
                    </p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                      {stats.total}
                    </p>
                  </div>

                  <div
                    className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-purple-500 to-purple-700
                      shadow-[0_15px_40px_rgba(168,85,247,0.8)]
                    "
                  >
                    <Crown className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>


          {/* Search Bar with Suggestions */}
        <div ref={searchRef} className="relative mb-8">
          <div className="relative group">
            {/* Glow background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/30 via-purple-500/20 to-indigo-500/30 blur-xl opacity-40 group-focus-within:opacity-70 transition-opacity" />

            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary drop-shadow-md" />

            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 3) {
                  setShowSearchSuggestions(true);
                } else {
                  setShowSearchSuggestions(false);
                }
              }}
              onFocus={() => {
                if (searchQuery.length >= 3) {
                  setShowSearchSuggestions(true);
                }
              }}
              placeholder="Rechercher un rendez-vous (min. 3 caractères)..."
              className="
                relative z-10 pl-14 h-16 text-lg
                rounded-2xl
                bg-background/80 backdrop-blur-xl
                border border-white/30 dark:border-white/10
                shadow-[0_15px_50px_-10px_rgba(139,92,246,0.45)]
                focus:border-primary
                focus:ring-2 focus:ring-primary/30
                transition-all
              "
            />
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className="
                  absolute top-full left-0 right-0 mt-3
                  rounded-3xl overflow-hidden z-50
                  bg-background/90 backdrop-blur-2xl
                  border border-white/30 dark:border-white/10
                  shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]
                "
              >
                <div className="px-5 py-3 bg-gradient-to-r from-primary/10 to-purple-500/5 border-b border-white/10">
                  <p className="text-sm font-medium text-muted-foreground">
                    ✨ {searchSuggestions.length} résultat(s) pour{" "}
                    <span className="font-semibold text-primary">"{searchQuery}"</span>
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
                  {searchSuggestions.map((rdv) => (
                    <motion.div
                      key={rdv.id}
                      whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
                      onClick={() => handleSuggestionClick(rdv)}
                      className="p-5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-white text-xs px-3 py-1 rounded-full shadow-md",
                              statusColors[rdv.statut]
                            )}>
                              {statusLabels[rdv.statut]}
                            </Badge>
                            <span className="font-semibold text-base">
                              {rdv.titre}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4 text-primary" />
                              {rdv.clientNom}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              {format(parseISO(rdv.date), 'd MMM', { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" />
                              {rdv.heureDebut}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-9 w-9 rounded-xl transition-all",
                              rdv.statut === 'confirme'
                                ? "opacity-40 cursor-not-allowed"
                                : "text-blue-600 hover:bg-blue-500/15 hover:scale-110"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (rdv.statut !== 'confirme') {
                                handleOpenForm(rdv);
                              }
                            }}
                            disabled={rdv.statut === 'confirme'}
                            title={
                              rdv.statut === 'confirme'
                                ? "Impossible de modifier un rendez-vous confirmé"
                                : "Modifier"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-500/15 hover:scale-110 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(rdv);
                              setShowSearchSuggestions(false);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results message */}
          <AnimatePresence>
            {showSearchSuggestions && searchQuery.length >= 3 && searchSuggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className="
                  absolute top-full left-0 right-0 mt-3 z-50
                  rounded-3xl p-8 text-center
                  bg-background/90 backdrop-blur-2xl
                  border border-red-500/30
                  shadow-[0_30px_80px_-20px_rgba(220,38,38,0.6)]
                "
              >
                <CalendarX className="h-14 w-14 mx-auto text-red-600 mb-3 drop-shadow-lg" />
                <p className="text-red-700 font-semibold text-lg">
                  Aucun rendez-vous trouvé pour "{searchQuery}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


          {/* Tabs: Calendar / List */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setCurrentPage(1);
          }}
          className="space-y-8"
        >
          {/* ================= TABS HEADER ================= */}
          <TabsList
            className="
              grid w-full max-w-md grid-cols-2
              rounded-2xl p-1
              bg-background/60 backdrop-blur-xl
              border border-white/30 dark:border-white/10
              shadow-[0_15px_40px_-10px_rgba(0,0,0,0.35)]
            "
          >
            <TabsTrigger
              value="calendar"
              className="
                flex items-center gap-2 rounded-xl
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-violet-500
                data-[state=active]:to-fuchsia-500
                data-[state=active]:text-white
                data-[state=active]:shadow-lg
                transition-all
              "
            >
              <Calendar className="h-4 w-4" />
              Calendrier
            </TabsTrigger>

            <TabsTrigger
              value="list"
              className="
                flex items-center gap-2 rounded-xl
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-indigo-500
                data-[state=active]:to-purple-500
                data-[state=active]:text-white
                data-[state=active]:shadow-lg
                transition-all
              "
            >
              <List className="h-4 w-4" />
              Liste ({currentMonthRdvs.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= CALENDAR ================= */}
          <TabsContent value="calendar" className="animate-in fade-in-50">
            <RdvCalendar
              rdvs={rdvs}
              onRdvClick={(rdv) => handleOpenForm(rdv)}
              onSlotClick={(date, time) => handleOpenForm(undefined, date, time)}
              onRdvDrop={handleRdvDrop}
              onRdvDelete={confirmDelete}
              highlightRdvId={highlightRdvId}
              highlightDate={highlightDate}
              onHighlightComplete={handleHighlightComplete}
            />
          </TabsContent>

          {/* ================= LIST ================= */}
          <TabsContent value="list" className="animate-in fade-in-50">
            <div className="space-y-8">
              {currentMonthRdvs.length === 0 ? (
                <Card
                  className="
                    rounded-3xl
                    bg-background/70 backdrop-blur-xl
                    border border-white/30 dark:border-white/10
                    shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]
                  "
                >
                  <CardContent className="py-14 text-center">
                    <Calendar className="h-14 w-14 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Aucun rendez-vous ce mois-ci</h3>
                    <p className="text-muted-foreground mt-1">
                      Créez votre premier rendez-vous pour commencer
                    </p>
                    <Button
                      onClick={() => handleOpenForm()}
                      className="
                        mt-6
                        bg-gradient-to-r from-violet-500 to-fuchsia-500
                        text-white
                        shadow-lg shadow-violet-500/30
                        hover:scale-105 transition-all
                      "
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau rendez-vous
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* ================= GRID ================= */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paginatedRdvs.map((rdv, index) => {
                      const globalIndex =
                        (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                      return (
                        <motion.div
                          key={rdv.id}
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="
                              h-full cursor-pointer overflow-hidden rounded-3xl
                              bg-background/70 backdrop-blur-xl
                              border border-white/30 dark:border-white/10
                              shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]
                              hover:shadow-[0_30px_80px_-20px_rgba(139,92,246,0.6)]
                              hover:-translate-y-2 transition-all duration-500
                              group
                            "
                            onClick={() => handleOpenForm(rdv)}
                          >
                            {/* Status bar */}
                            <div className={cn("h-1.5", statusColors[rdv.statut])} />

                            <CardContent className="p-5">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-bold rounded-full"
                                >
                                  #{globalIndex}
                                </Badge>

                                <Badge
                                  className={cn(
                                    "text-white text-xs rounded-full shadow",
                                    statusColors[rdv.statut]
                                  )}
                                >
                                  {statusLabels[rdv.statut]}
                                </Badge>
                              </div>

                              {/* Title */}
                              <h3 className="font-bold text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                {rdv.titre}
                              </h3>

                              {/* Infos */}
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-primary" />
                                  <span className="truncate">{rdv.clientNom}</span>
                                </div>

                                {rdv.clientTelephone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span>{rdv.clientTelephone}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>
                                    {format(parseISO(rdv.date), 'd MMM yyyy', {
                                      locale: fr,
                                    })}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>
                                    {rdv.heureDebut} - {rdv.heureFin}
                                  </span>
                                </div>

                                {rdv.lieu && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="truncate">{rdv.lieu}</span>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 mt-5 pt-4 border-t border-white/20">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={cn(
                                    "flex-1 rounded-xl",
                                    rdv.statut === 'confirme'
                                      ? "opacity-40 cursor-not-allowed"
                                      : "text-blue-600 border-blue-300 hover:bg-blue-500/10"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (rdv.statut !== 'confirme') {
                                      handleOpenForm(rdv);
                                    }
                                  }}
                                  disabled={rdv.statut === 'confirme'}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Modifier
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl text-red-600 border-red-300 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(rdv);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ================= PAGINATION ================= */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <Button
                              key={page}
                              size="icon"
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "w-10 h-10 rounded-xl",
                                currentPage === page &&
                                  "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                              )}
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-xl"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <span className="ml-4 text-sm text-muted-foreground">
                        {((currentPage - 1) * ITEMS_PER_PAGE) + 1} –{" "}
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          currentMonthRdvs.length
                        )}{" "}
                        sur {currentMonthRdvs.length}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        </div>

        {/* Form Dialog */}
        <RdvForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          rdv={selectedRdv}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          conflicts={conflicts}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Supprimer le rendez-vous"
          description={`Êtes-vous sûr de vouloir supprimer le rendez-vous "${rdvToDelete?.titre}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleDelete}
          variant="danger"
        />
      </div>
    </Layout>
  );
};

export default RdvPage;
