
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MonthlyResetHandler: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const checkAndResetMonthlyData = async () => {
      if (!user) return;

      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const lastResetKey = `lastReset_${user.id}`;
        const lastReset = localStorage.getItem(lastResetKey);
        
        if (lastReset) {
          const lastResetDate = new Date(lastReset);
          const lastResetMonth = lastResetDate.getMonth();
          const lastResetYear = lastResetDate.getFullYear();
          
          if (currentMonth !== lastResetMonth || currentYear !== lastResetYear) {
            await axios.post(`${AUTH_BASE_URL}/api/depenses/reset-monthly`, {}, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            localStorage.setItem(lastResetKey, currentDate.toISOString());
          }
        } else {
          localStorage.setItem(lastResetKey, currentDate.toISOString());
        }
      } catch (error) {
        console.error('Erreur lors du reset mensuel:', error);
      }
    };

    checkAndResetMonthlyData();
  }, [user]);

  return null;
};

export default MonthlyResetHandler;
