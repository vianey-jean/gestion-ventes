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
  Trash2
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

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRdvs = rdvs.filter(r => r.date === today);
    const confirmedRdvs = rdvs.filter(r => r.statut === 'confirme');
    const pendingRdvs = rdvs.filter(r => r.statut === 'planifie');
    const cancelledRdvs = rdvs.filter(r => r.statut === 'annule');

    return {
      today: todayRdvs.length,
      confirmed: confirmedRdvs.length,
      pending: pendingRdvs.length,
      cancelled: cancelledRdvs.length,
      total: rdvs.length,
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8 px-4 mb-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-primary" />
                  Gestion des Rendez-vous
                </h1>
                <p className="text-muted-foreground mt-1">
                  Planifiez et gérez vos rendez-vous clients - {format(new Date(), 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <Button onClick={() => handleOpenForm()} size="lg" className="shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau rendez-vous
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 pb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ce mois</p>
                      <p className="text-2xl font-bold text-green-600">{currentMonthRdvs.length}</p>
                    </div>
                    <CalendarCheck className="h-8 w-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search Bar with Suggestions */}
          <div ref={searchRef} className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                className="pl-12 h-14 text-lg rounded-xl border-2 border-primary/20 focus:border-primary bg-background/80 backdrop-blur-sm shadow-lg"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 bg-primary/5 border-b border-primary/10">
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchSuggestions.length} résultat(s) pour "{searchQuery}"
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searchSuggestions.map((rdv) => (
                      <motion.div
                        key={rdv.id}
                        whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                        onClick={() => handleSuggestionClick(rdv)}
                        className="p-4 cursor-pointer border-b border-primary/10 last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-white text-xs", statusColors[rdv.statut])}>
                                {statusLabels[rdv.statut]}
                              </Badge>
                              <span className="font-semibold">{rdv.titre}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {rdv.clientNom}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(parseISO(rdv.date), 'd MMM', { locale: fr })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {rdv.heureDebut}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenForm(rdv);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-100"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/20 rounded-xl shadow-2xl z-50 p-6 text-center"
                >
                  <CalendarX className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Aucun rendez-vous trouvé pour "{searchQuery}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabs: Calendar / List */}
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Liste ({currentMonthRdvs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <RdvCalendar
                rdvs={upcomingRdvs}
                onRdvClick={(rdv) => handleOpenForm(rdv)}
                onSlotClick={(date, time) => handleOpenForm(undefined, date, time)}
                onRdvDrop={handleRdvDrop}
                onRdvDelete={confirmDelete}
                highlightRdvId={highlightRdvId}
                highlightDate={highlightDate}
                onHighlightComplete={handleHighlightComplete}
              />
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-6">
                {currentMonthRdvs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">Aucun rendez-vous ce mois-ci</h3>
                      <p className="text-muted-foreground mt-1">
                        Créez votre premier rendez-vous pour commencer
                      </p>
                      <Button onClick={() => handleOpenForm()} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau rendez-vous
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Grid 4 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {paginatedRdvs.map((rdv, index) => {
                        const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                        return (
                          <motion.div
                            key={rdv.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card 
                              className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/30 overflow-hidden group"
                              onClick={() => handleOpenForm(rdv)}
                            >
                              {/* Header with status color */}
                              <div className={cn(
                                "h-2",
                                statusColors[rdv.statut]
                              )} />
                              
                              <CardContent className="p-4">
                                {/* Number badge */}
                                <div className="flex items-start justify-between mb-3">
                                  <Badge variant="outline" className="text-xs font-bold">
                                    #{globalIndex}
                                  </Badge>
                                  <Badge className={cn("text-white text-xs", statusColors[rdv.statut])}>
                                    {statusLabels[rdv.statut]}
                                  </Badge>
                                </div>

                                {/* Title */}
                                <h3 className="font-bold text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                  {rdv.titre}
                                </h3>

                                {/* Client info */}
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
                                    <span>{format(parseISO(rdv.date), 'd MMM yyyy', { locale: fr })}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>{rdv.heureDebut} - {rdv.heureFin}</span>
                                  </div>

                                  {rdv.lieu && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span className="truncate">{rdv.lieu}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenForm(rdv);
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Modifier
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="icon"
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "w-10 h-10",
                                currentPage === page && "bg-primary text-primary-foreground"
                              )}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        <span className="ml-4 text-sm text-muted-foreground">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, currentMonthRdvs.length)} sur {currentMonthRdvs.length}
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
