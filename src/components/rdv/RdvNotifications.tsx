import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellRing, 
  Calendar, 
  Clock, 
  CheckCircle,
  X,
  Phone,
  MapPin,
  Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { rdvNotificationsApi, RdvNotification } from '@/services/api/rdvNotificationsApi';

interface RdvNotificationsProps {
  onCheckNotifications?: () => void;
}

const RdvNotifications: React.FC<RdvNotificationsProps> = ({
  onCheckNotifications,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<RdvNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousCountRef = useRef<number>(0);
  
  // Modal pour voir le détail d'un RDV
  const [selectedNotification, setSelectedNotification] = useState<RdvNotification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rdvNotificationsApi.getUnread();
      setNotifications(data);
      
      // Vérifier si le nombre a augmenté pour afficher un toast
      if (data.length > previousCountRef.current && previousCountRef.current > 0) {
        toast({
          title: '🔔 Nouvelle notification RDV',
          description: `${data.length - previousCountRef.current} nouveau(x) rendez-vous`,
          duration: 5000,
        });
      }
      
      previousCountRef.current = data.length;
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Vérifier et créer des notifications pour les RDV dans 24h
  const checkAndCreateNotifications = useCallback(async () => {
    try {
      const result = await rdvNotificationsApi.checkAndCreate();
      if (result.created > 0) {
        toast({
          title: '🔔 Nouvelles notifications',
          description: `${result.created} rendez-vous dans moins de 24h`,
          duration: 5000,
        });
        await loadNotifications();
      }
    } catch (error) {
      console.error('Erreur vérification notifications:', error);
    }
  }, [toast, loadNotifications]);

  // Configurer SSE pour la synchronisation en temps réel
  useEffect(() => {
    loadNotifications();
    checkAndCreateNotifications();
    
    // Configurer SSE pour les mises à jour en temps réel
    const setupSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`${API_BASE_URL}/api/sync/events`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE RDV Notifications connecté');
      };

      eventSource.addEventListener('data-changed', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Écouter les changements sur rdvNotifications et rdv
          if (data.type === 'rdvNotifications' || data.type === 'rdv') {
            // Recharger les notifications
            loadNotifications();
          }
        } catch (error) {
          console.error('Erreur parsing SSE:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        // Reconnecter après 5 secondes
        setTimeout(setupSSE, 5000);
      };
    };

    setupSSE();
    
    // Vérifier toutes les 5 minutes (backup si SSE ne fonctionne pas)
    const interval = setInterval(() => {
      checkAndCreateNotifications();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [loadNotifications, checkAndCreateNotifications, API_BASE_URL]);

  // Quand on clique sur une notification, afficher le détail et marquer comme lu
  const handleNotificationClick = async (notification: RdvNotification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    
    // Marquer la notification comme lue (ne pas supprimer)
    try {
      await rdvNotificationsApi.markAsRead(notification.id);
      // Retirer de la liste affichée (car on affiche seulement les non lus)
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification comme lue:', error);
    }
  };

  // Fermer le modal de détail
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  // Aller à la page RDV avec le rdv à mettre en surbrillance
  const handleGoToRdv = () => {
    if (selectedNotification) {
      // Naviguer vers la page RDV avec l'ID du RDV et sa date pour naviguer à la bonne semaine
      const rdvDate = selectedNotification.rdvDate;
      navigate(`/rdv?highlightRdv=${selectedNotification.rdvId}&date=${rdvDate}`);
    }
    setShowDetailModal(false);
    setIsOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-10 w-10 rounded-xl border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            aria-label={`${unreadCount} notifications`}
          >
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-orange-600" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white bg-red-500 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-orange-600" />
              Notifications RDV
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-muted-foreground">Chargement...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">
                    Aucun rendez-vous dans les prochaines 24h
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-orange-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rendez-vous dans moins de 24h
                </p>
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{notification.rdvTitre}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{notification.rdvClientNom}</span>
                              <span>•</span>
                              <span>{notification.rdvHeureDebut} - {notification.rdvHeureFin}</span>
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {format(parseISO(notification.rdvDate), 'EEEE d MMM', { locale: fr })}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 text-orange-600 hover:bg-orange-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {notification.rdvClientTelephone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Phone className="h-3 w-3" />
                          <span>{notification.rdvClientTelephone}</span>
                        </div>
                      )}
                      
                      {notification.rdvLieu && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{notification.rdvLieu}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal détail du RDV */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-orange-500/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              {selectedNotification?.rdvTitre}
            </DialogTitle>
            <DialogDescription>
              Rendez-vous dans moins de 24 heures
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4 py-4">
              {/* Client Info */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">
                      {format(parseISO(selectedNotification.rdvDate), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Horaire</div>
                    <div className="font-semibold">
                      {selectedNotification.rdvHeureDebut} - {selectedNotification.rdvHeureFin}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-semibold">{selectedNotification.rdvClientNom}</div>
                    {selectedNotification.rdvClientTelephone && (
                      <a 
                        href={`tel:${selectedNotification.rdvClientTelephone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedNotification.rdvClientTelephone}
                      </a>
                    )}
                  </div>
                </div>
                
                {selectedNotification.rdvLieu && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Lieu</div>
                      <div className="font-semibold">{selectedNotification.rdvLieu}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseDetail}
                >
                  <X className="h-4 w-4 mr-2" />
                  Fermer
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  onClick={handleGoToRdv}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir le calendrier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RdvNotifications;
