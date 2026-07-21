/**
 * ProfileHero — En-tête héroïque animé de la page profil
 * (aurores animées, badge, titre, statuts).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Crown, Heart, Settings, Shield, Sparkles, User, Zap } from 'lucide-react';

const ProfileHero: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: -25, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
    className="relative overflow-hidden text-center py-12 sm:py-14 rounded-3xl bg-black border border-white/10 shadow-[0_50px_140px_-40px_rgba(168,85,247,0.6)] mb-4"
  >
    {/* Aurora */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 left-1/4 w-[420px] h-[420px] bg-violet-500/30 blur-[140px] rounded-full"
      />
      <motion.div
        animate={{ x: [0, -35, 20, 0], y: [0, 30, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-24 right-1/4 w-[420px] h-[420px] bg-fuchsia-500/25 blur-[150px] rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-500/10 blur-[180px] rounded-full"
      />
    </div>

    {/* Grid overlay */}
    <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

    <motion.div
      className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent blur-sm"
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
    />

    <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 opacity-20">
      <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full" />
      <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-violet-300 rounded-full" />
      <div className="absolute bottom-16 left-1/3 w-1 h-1 bg-fuchsia-300 rounded-full" />
    </motion.div>

    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />

    {/* Badge */}
    <motion.div
      whileHover={{ scale: 1.06, y: -2 }}
      className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 mb-6 shadow-[0_20px_60px_rgba(168,85,247,0.35)]"
    >
      <motion.div animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
        <Crown className="w-4 h-4 text-yellow-400" />
      </motion.div>
      <span className="text-xs font-bold text-violet-100 tracking-widest">PROFIL UTILISATEUR</span>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity }}>
        <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
      </motion.div>
      <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
    </motion.div>

    {/* Title */}
    <motion.h1
      initial={{ opacity: 0, y: 35, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 bg-clip-text text-transparent tracking-tight"
    >
      <motion.span
        animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="inline-block mr-3 align-middle"
      >
        <User className="inline h-10 w-10 sm:h-12 sm:w-12 text-violet-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
      </motion.span>
      Mon Profil
    </motion.h1>

    <p className="relative z-10 mt-5 text-sm sm:text-base text-violet-100/70 max-w-xl mx-auto">
      Gérez vos informations, sécurité et préférences avec une expérience fluide et moderne.
    </p>

    <div className="relative z-10 mt-6 flex items-center justify-center gap-6 text-xs text-violet-200/70">
      <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-300" />Sécurisé</motion.div>
      <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-300" />Actif</motion.div>
      <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2"><Heart className="w-4 h-4 text-fuchsia-300" />Personnalisé</motion.div>
      <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2"><Settings className="w-4 h-4 text-violet-300" />Contrôle total</motion.div>
    </div>
  </motion.div>
);

export default ProfileHero;
