/**
 * ProfileTabsNav — Boutons de navigation entre les onglets
 * Profil / Paramètres / Sécurité (avec visibilité conditionnelle).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, Shield, User } from 'lucide-react';

const premiumBtnClass = 'group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold';

export type ProfileTab = 'profil' | 'parametres' | 'securite';

interface Props {
  activeTab: ProfileTab;
  setActiveTab: (t: ProfileTab) => void;
  canSeeSettings: boolean;
  isAdminPrincipal: boolean;
}

const ProfileTabsNav: React.FC<Props> = ({ activeTab, setActiveTab, canSeeSettings, isAdminPrincipal }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 }}
    className="flex justify-center gap-3"
  >
    <Button
      onClick={() => setActiveTab('profil')}
      className={`${premiumBtnClass} ${
        activeTab === 'profil'
          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-violet-400/30 shadow-lg shadow-violet-500/25'
          : 'bg-white/50 dark:bg-white/5 border-violet-200/30 dark:border-violet-800/20 text-foreground hover:bg-violet-50 dark:hover:bg-white/10'
      }`}
    >
      <User className="w-4 h-4 mr-2" /> Profil
    </Button>

    {canSeeSettings && (
      <Button
        onClick={() => setActiveTab('parametres')}
        className={`${premiumBtnClass} ${
          activeTab === 'parametres'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/30 shadow-lg shadow-amber-500/25'
            : 'bg-white/50 dark:bg-white/5 border-violet-200/30 dark:border-violet-800/20 text-foreground hover:bg-amber-50 dark:hover:bg-white/10'
        }`}
      >
        <Settings className="w-4 h-4 mr-2" /> Paramètres
      </Button>
    )}

    {isAdminPrincipal && (
      <Button
        onClick={() => setActiveTab('securite')}
        className={`${premiumBtnClass} ${
          activeTab === 'securite'
            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400/30 shadow-lg shadow-red-500/25'
            : 'bg-white/50 dark:bg-white/5 border-violet-200/30 dark:border-violet-800/20 text-foreground hover:bg-red-50 dark:hover:bg-white/10'
        }`}
      >
        <Shield className="w-4 h-4 mr-2" /> Sécurité
      </Button>
    )}
  </motion.div>
);

export default ProfileTabsNav;
