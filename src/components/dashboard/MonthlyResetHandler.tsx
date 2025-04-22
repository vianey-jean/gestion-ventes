
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

/**
 * Composant qui vérifie si c'est la fin du mois pour réinitialiser les dépenses.
 * Ce composant ne rend rien, il exécute seulement la logique de vérification.
 */
const MonthlyResetHandler = () => {
  const { toast } = useToast();

  // Fonction qui vérifie si c'est le dernier jour du mois à la fin de la journée
  const checkEndOfMonth = () => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const isLastDay = now.getDate() === lastDayOfMonth;
    const isEndOfDay = now.getHours() >= 23 && now.getMinutes() >= 59;
    
    return isLastDay && isEndOfDay;
  };

  // Fonction pour réinitialiser les dépenses du mois
  const resetMonthlyExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/depenses/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast({
          title: "Réinitialisation automatique",
          description: "Les dépenses du mois ont été réinitialisées (fin de mois)",
          className: "bg-app-blue text-white",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des dépenses:", error);
    }
  };

  useEffect(() => {
    // Vérifie immédiatement au chargement du composant
    if (checkEndOfMonth()) {
      resetMonthlyExpenses();
    }
    
    // Configure un intervalle pour vérifier régulièrement (toutes les heures)
    const intervalId = setInterval(() => {
      if (checkEndOfMonth()) {
        resetMonthlyExpenses();
      }
    }, 60 * 60 * 1000); // Vérifie toutes les heures
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Ce composant ne rend rien
  return null;
};

export default MonthlyResetHandler;
