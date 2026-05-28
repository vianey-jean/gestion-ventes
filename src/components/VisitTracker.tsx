/**
 * VisitTracker.tsx — Petit composant invisible qui enregistre une visite
 * dans l'historique des connexions (une fois par session navigateur).
 */
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useVisitLogger from '@/hooks/use-visit-logger';

const VisitTracker: React.FC = () => {
  const { user, isLoading } = useAuth();
  // On attend la fin du chargement initial pour savoir si l'utilisateur est auth
  useVisitLogger(isLoading ? null : (user as any));
  return null;
};

export default VisitTracker;
