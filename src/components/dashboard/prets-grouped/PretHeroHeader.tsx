/**
 * Hero Header de la page Prêts Produits
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

interface PretHeroHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

const PretHeroHeader: React.FC<PretHeroHeaderProps> = ({
  title = 'Prêts Produits',
  subtitle = 'Gérez vos prêts par personne avec élégance',
  badge = 'Gestion Premium des Prêts',
}) => (
  <div className="text-center mb-12">
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6 border border-purple-200/50 dark:border-purple-800/50"
    >
      <CreditCard className="h-5 w-5 mr-2 animate-pulse" />
      {badge}
    </motion.div>

    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
      {title}
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

export default PretHeroHeader;
