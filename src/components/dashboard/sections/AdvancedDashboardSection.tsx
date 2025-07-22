
import React from 'react';
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard';

const AdvancedDashboardSection: React.FC = () => {
  return (
    <section 
      aria-labelledby="advanced-dashboard-title"
      className="space-y-6"
    >
      <h2 id="advanced-dashboard-title" className="text-2xl font-bold text-gray-900 dark:text-white">
        Tableau de Bord Avancé
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Analyses détaillées et insights business pour optimiser vos ventes
      </p>
      
      <AdvancedDashboard />
    </section>
  );
};

export default AdvancedDashboardSection;
