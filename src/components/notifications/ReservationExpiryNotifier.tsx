/**
 * ReservationExpiryNotifier
 * ---------------------------------------------------------------
 * Interroge /api/commandes/expiring-soon toutes les heures (et à la connexion)
 * pour afficher une notification orange sur les réservations ultérieures
 * qui expirent dans moins de 24h.
 */
import React from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api/api';
import { Hourglass } from 'lucide-react';

const HOUR_MS = 60 * 60 * 1000;

const formatLeft = (ms: number) => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  return `${m}min`;
};

const ReservationExpiryNotifier: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const shownRef = React.useRef<Map<string, number>>(new Map());

  const check = React.useCallback(async () => {
    try {
      const resp: any = await api.get('/api/commandes/expiring-soon');
      const items: any[] = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      const now = Date.now();
      for (const c of items) {
        const key = String(c.id);
        const last = shownRef.current.get(key) || 0;
        if (now - last < HOUR_MS) continue; // 1 fois par heure
        const msLeft = new Date(c.expiresAt).getTime() - now;
        if (msLeft <= 0) continue;
        shownRef.current.set(key, now);
        const produits = (c.produits || []).map((p: any) => p.nom).join(', ');
        toast(
          `⏳ Réservation ultérieure - ${c.clientNom}`,
          {
            description: `${produits || 'Produits'} sera supprimée dans ${formatLeft(msLeft)}. Modifiez son statut pour la conserver.`,
            duration: 10000,
            className: 'bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 border-2 border-orange-400 text-orange-900 font-semibold shadow-xl',
            icon: <Hourglass className="h-5 w-5 text-orange-600" />,
          }
        );
      }
    } catch {
      // silencieux
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    check();
    const id = setInterval(check, HOUR_MS);
    return () => clearInterval(id);
  }, [isAuthenticated, check]);

  return null;
};

export default ReservationExpiryNotifier;
