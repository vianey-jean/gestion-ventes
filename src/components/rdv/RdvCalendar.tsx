import React, { useState, useMemo } from 'react';
import { RDV } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  User,
  MapPin,
  GripVertical,
  Phone,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/shared';

interface RdvCalendarProps {
  rdvs: RDV[];
  onRdvClick: (rdv: RDV) => void;
  onSlotClick: (date: string, time: string) => void;
  onRdvDrop: (rdv: RDV, newDate: string, newTime: string) => void;
  onRdvDelete?: (rdv: RDV) => void;
  onOpenFormWithDateTime?: (rdv: RDV, date: string, time: string) => void;
  highlightRdvId?: string | null;
  highlightDate?: string | null;
  onHighlightComplete?: () => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  planifie: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', border: 'border-blue-400', text: 'text-blue-600' },
  confirme: { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', border: 'border-green-400', text: 'text-green-600' },
  annule: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', border: 'border-red-400', text: 'text-red-600' },
  termine: { bg: 'bg-gradient-to-r from-gray-500 to-slate-600', border: 'border-gray-400', text: 'text-gray-600' },
  reporte: { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', border: 'border-amber-400', text: 'text-amber-600' },
};

const statusLabels: Record<string, string> = {
  planifie: 'Planifié',
  confirme: 'Confirmé',
  annule: 'Annulé',
  termine: 'Terminé',
  reporte: 'Reporté',
};

const RdvCalendar: React.FC<RdvCalendarProps> = ({
  rdvs,
  onRdvClick,
  onSlotClick,
  onRdvDrop,
  onRdvDelete,
  onOpenFormWithDateTime,
  highlightRdvId,
  highlightDate,
  onHighlightComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedRdv, setDraggedRdv] = useState<RDV | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; hour: number } | null>(null);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ rdv: RDV; date: string; time: string } | null>(null);
  const [newTime, setNewTime] = useState('09:00');
  const [newDate, setNewDate] = useState('');
  
  // RDV Detail Modal
  const [selectedRdvDetail, setSelectedRdvDetail] = useState<RDV | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Confirm dialogs
  const [confirmModifyOpen, setConfirmModifyOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rdvToModify, setRdvToModify] = useState<RDV | null>(null);
  const [rdvToDelete, setRdvToDelete] = useState<RDV | null>(null);
  
  // État pour le clignotement du RDV highlight
  const [blinkingRdvId, setBlinkingRdvId] = useState<string | null>(null);
  const [blinkCount, setBlinkCount] = useState(0);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const rdvsByDay = useMemo(() => {
    const map: Record<string, RDV[]> = {};
    rdvs.forEach(rdv => {
      const dateKey = rdv.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(rdv);
    });
    return map;
  }, [rdvs]);

  // Effet pour naviguer à la semaine du RDV quand on reçoit highlightDate
  React.useEffect(() => {
    if (highlightDate) {
      // Naviguer vers la semaine contenant cette date
      const targetDate = parseISO(highlightDate);
      setCurrentDate(targetDate);
    }
  }, [highlightDate]);

  // Effet pour le clignotement quand on reçoit un highlightRdvId
  React.useEffect(() => {
    if (highlightRdvId) {
      setBlinkingRdvId(highlightRdvId);
      setBlinkCount(0);
    }
  }, [highlightRdvId]);

  // Effet pour gérer le clignotement 4 fois
  React.useEffect(() => {
    if (blinkingRdvId && blinkCount < 8) { // 8 = 4 cycles (on/off)
      const timer = setTimeout(() => {
        setBlinkCount(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (blinkCount >= 8) {
      // Après 4 clignotements, garder stable (pas rouge)
      setBlinkingRdvId(null);
      onHighlightComplete?.();
    }
  }, [blinkingRdvId, blinkCount, onHighlightComplete]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, rdv: RDV) => {
    setDraggedRdv(rdv);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rdv.id);
  };

  const handleDragOver = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ date, hour });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    if (draggedRdv) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      setPendingDrop({ rdv: draggedRdv, date, time: timeStr });
      setNewDate(date);
      setNewTime(timeStr);
      setShowTimeDialog(true);
    }
    setDraggedRdv(null);
    setDropTarget(null);
  };

  const confirmTimeChange = () => {
    if (pendingDrop && onOpenFormWithDateTime) {
      // Ouvrir le formulaire avec les nouvelles valeurs pré-remplies
      onOpenFormWithDateTime(pendingDrop.rdv, newDate, newTime);
    } else if (pendingDrop) {
      // Fallback: mise à jour directe
      onRdvDrop(pendingDrop.rdv, newDate, newTime);
    }
    setShowTimeDialog(false);
    setPendingDrop(null);
  };

  const handleRdvClick = (e: React.MouseEvent, rdv: RDV) => {
    e.stopPropagation();
    setSelectedRdvDetail(rdv);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    if (selectedRdvDetail) {
      setRdvToModify(selectedRdvDetail);
      setConfirmModifyOpen(true);
    }
  };

  const confirmModify = () => {
    if (rdvToModify) {
      onRdvClick(rdvToModify);
      setShowDetailModal(false);
    }
    setConfirmModifyOpen(false);
    setRdvToModify(null);
  };

  const handleDeleteFromDetail = () => {
    if (selectedRdvDetail) {
      setRdvToDelete(selectedRdvDetail);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = () => {
    if (rdvToDelete && onRdvDelete) {
      onRdvDelete(rdvToDelete);
      setShowDetailModal(false);
    }
    setConfirmDeleteOpen(false);
    setRdvToDelete(null);
  };

  const getRdvPosition = (rdv: RDV) => {
    const [startHour, startMin] = rdv.heureDebut.split(':').map(Number);
    const [endHour, endMin] = rdv.heureFin.split(':').map(Number);
    
    const top = ((startHour - 8) * 60 + startMin) * (60 / 60);
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60);
    
    return { top: `${top}px`, height: `${Math.max(height, 30)}px` };
  };

  return (
    <Card className="overflow-hidden border-primary/20 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Planning de la semaine</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="border-blue-800 hover:bg-primary/10"
            >
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')} className="border-red-800">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[200px] text-center px-3 py-2 bg-primary/10 rounded-lg">
              {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[6], 'd MMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')} className="border-green-800">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-primary/20">
            <div className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-primary/20 bg-muted/30">
              Heure
            </div>
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 text-center border-r border-primary/20 last:border-r-0 transition-colors",
                  isSameDay(day, new Date()) && "bg-gradient-to-b from-primary/20 to-primary/10"
                )}
              >
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={cn(
                  "text-2xl font-bold mt-1",
                  isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-primary/10 h-[60px]">
                <div className="p-1 text-xs font-medium text-muted-foreground text-center border-r border-primary/20 flex items-start justify-center pt-1 bg-muted/20">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isDropTarget = dropTarget?.date === dateStr && dropTarget?.hour === hour;
                  
                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        "relative border-r border-primary/10 last:border-r-0 cursor-pointer transition-all duration-200",
                        isDropTarget && "bg-primary/30 ring-2 ring-primary ring-inset",
                        isSameDay(day, new Date()) && "bg-primary/5"
                      )}
                      onClick={() => onSlotClick(dateStr, `${hour.toString().padStart(2, '0')}:00`)}
                      onDragOver={(e) => handleDragOver(e, dateStr, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateStr, hour)}
                    />
                  );
                })}
              </div>
            ))}

            {/* RDV Items */}
            {weekDays.map((day, dayIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayRdvs = rdvsByDay[dateStr] || [];
              
              return dayRdvs.map((rdv) => {
                const pos = getRdvPosition(rdv);
                const leftPercent = (dayIdx + 1) * (100 / 8);
                const widthPercent = 100 / 8 - 0.5;
                const colors = statusColors[rdv.statut] || statusColors.planifie;
                
                // Vérifier si ce RDV doit clignoter
                const isBlinking = blinkingRdvId === rdv.id;
                const showRedBlink = isBlinking && blinkCount % 2 === 0;
                
                return (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, rdv)}
                    onClick={(e) => handleRdvClick(e, rdv)}
                    className={cn(
                      "absolute rounded-lg border-l-4 px-2 py-1.5 cursor-grab active:cursor-grabbing",
                      "text-white text-xs overflow-hidden shadow-lg",
                      "transition-all duration-200 hover:shadow-xl hover:z-20 hover:scale-[1.02]",
                      showRedBlink ? "bg-gradient-to-r from-red-600 to-red-700 border-red-400" : colors.bg,
                      showRedBlink ? "border-red-400" : colors.border,
                      isBlinking && "z-30 scale-105"
                    )}
                    style={{
                      top: pos.top,
                      height: pos.height,
                      left: `calc(${leftPercent}% + 3px)`,
                      width: `calc(${widthPercent}% - 6px)`,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 opacity-60 flex-shrink-0" />
                      <span className="font-semibold truncate">{rdv.titre}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 opacity-90">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="text-[10px]">{rdv.heureDebut} - {rdv.heureFin}</span>
                    </div>
                    {rdv.clientNom && (
                      <div className="flex items-center gap-1 mt-0.5 opacity-90 truncate">
                        <User className="h-2.5 w-2.5" />
                        <span className="truncate text-[10px]">{rdv.clientNom}</span>
                      </div>
                    )}
                  </motion.div>
                );
              });
            })}
          </div>
        </div>
      </CardContent>

      {/* Time Change Dialog - Opens form with pre-filled date/time */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Modifier la date et l'horaire
            </DialogTitle>
            <DialogDescription>
              Vous déplacez "{pendingDrop?.rdv.titre}". Ajustez la date et l'heure avant d'enregistrer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newDate">Nouvelle date</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">Nouvelle heure de début</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmTimeChange} className="bg-gradient-to-r from-primary to-primary/80">
              Ouvrir le formulaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RDV Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-primary/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={cn(
                "p-2 rounded-xl",
                selectedRdvDetail && (statusColors[selectedRdvDetail.statut]?.bg || statusColors.planifie.bg)
              )}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              {selectedRdvDetail?.titre}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRdvDetail && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "text-white",
                    statusColors[selectedRdvDetail.statut]?.bg || statusColors.planifie.bg
                  )}
                >
                  {statusLabels[selectedRdvDetail.statut] || 'Inconnu'}
                </Badge>
              </div>

              {/* Client Info */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-semibold">{selectedRdvDetail.clientNom}</div>
                  </div>
                </div>
                {selectedRdvDetail.clientTelephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Téléphone</div>
                      <a href={`tel:${selectedRdvDetail.clientTelephone}`} className="font-semibold text-primary hover:underline">
                        {selectedRdvDetail.clientTelephone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedRdvDetail.lieu && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Lieu</div>
                      <div className="font-semibold">{selectedRdvDetail.lieu}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">
                      {format(parseISO(selectedRdvDetail.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Horaire</div>
                    <div className="font-semibold">
                      {selectedRdvDetail.heureDebut} - {selectedRdvDetail.heureFin}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedRdvDetail.description && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div>{selectedRdvDetail.description}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFromDetail}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
            <Button 
              onClick={handleEditFromDetail}
              className="bg-gradient-to-r from-primary to-primary/80 gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Modify Dialog */}
      <ConfirmDialog
        open={confirmModifyOpen}
        onOpenChange={setConfirmModifyOpen}
        title="Modifier le rendez-vous"
        description={`Êtes-vous sûr de vouloir modifier le rendez-vous "${rdvToModify?.titre}" ?`}
        confirmText="Modifier"
        cancelText="Annuler"
        onConfirm={confirmModify}
        variant="info"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Supprimer le rendez-vous"
        description={`Êtes-vous sûr de vouloir supprimer le rendez-vous "${rdvToDelete?.titre}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        variant="danger"
      />
    </Card>
  );
};

export default RdvCalendar;