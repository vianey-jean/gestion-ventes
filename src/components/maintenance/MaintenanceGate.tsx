/**
 * MaintenanceGate — Vérifie le statut de maintenance du site.
 * 
 * Si le site est en maintenance ET que l'utilisateur connecté n'est pas un
 * administrateur principal, on affiche la MaintenancePage à la place du contenu.
 * 
 * Polling périodique (60s) pour rester synchronisé même sans rafraîchissement.
 */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import PremiumLoading from '@/components/ui/premium-loading';

const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
const POLL_INTERVAL_MS = 60_000;

interface MaintenanceGateProps {
  children: React.ReactNode;
}

const MaintenanceGate: React.FC<MaintenanceGateProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [maintenant, setMaintenant] = useState(false);
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${AUTH_BASE_URL}/api/maintenance/status`);
      setMaintenant(!!res.data?.maintenant);
      setMessage(res.data?.message || '');
    } catch {
      // En cas d'erreur réseau, on laisse passer (fail-open) pour éviter de bloquer
      setMaintenant(false);
    } finally {
      setChecked(true);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Si maintenance activée et utilisateur connecté qui n'est PAS admin principal,
  // on le déconnecte automatiquement.
  useEffect(() => {
    if (maintenant && user && (user as any).role !== 'administrateur principale') {
      logout();
    }
  }, [maintenant, user, logout]);

  if (!checked) {
    return <PremiumLoading text="Vérification du statut..." size="lg" overlay={true} variant="default" />;
  }

  const isAdminPrincipal = user && (user as any).role === 'administrateur principale';

  if (maintenant && !isAdminPrincipal) {
    return (
      <Suspense fallback={<PremiumLoading text="Chargement..." size="lg" overlay={true} variant="default" />}>
        <MaintenancePage message={message} onAuthenticated={fetchStatus} />
      </Suspense>
    );
  }

  return <>{children}</>;
};

export default MaintenanceGate;
