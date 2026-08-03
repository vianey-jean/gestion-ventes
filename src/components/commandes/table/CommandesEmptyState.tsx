/**
 * CommandesEmptyState — état vide (mobile & desktop) du tableau des commandes.
 */
import React from 'react';
import { Sparkles, PackageOpen } from 'lucide-react';

interface Props {
  lastActivityLabel: string;
  variant?: 'mobile' | 'desktop';
}

const CommandesEmptyState: React.FC<Props> = ({ lastActivityLabel, variant = 'mobile' }) => {
  const isDesktop = variant === 'desktop';
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden ${isDesktop ? '' : 'px-8 py-28'}`}>
      {/* Halo Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute h-96 w-96 rounded-full bg-fuchsia-500/10 animate-pulse" />
        <div className="absolute h-[450px] w-[450px] rounded-full bg-violet-500/10" />
        <div className="absolute h-[520px] w-[520px] rounded-full border border-purple-400/10" />
      </div>

      {/* Premium Glass Card */}
      <div className={`relative rounded-[40px] border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 shadow-[0_40px_140px_rgba(168,85,247,.20)] ${isDesktop ? 'px-14 py-14' : 'w-full max-w-3xl px-10 py-14'}`}>
        {/* Icon Luxury */}
        <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 opacity-40 animate-pulse" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/40 dark:border-purple-500/20 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 shadow-[0_30px_90px_rgba(168,85,247,.35)]">
            <PackageOpen className="h-16 w-16 text-purple-500 animate-[float_4s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/40 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 px-5 py-2">
            <Sparkles className="h-4 w-4 text-fuchsia-500" />
            <span className="text-sm font-semibold tracking-wide text-purple-700 dark:text-purple-300">
              {isDesktop ? 'Tableau intelligent' : 'Gestion des commandes'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
            Aucune commande disponible
          </span>
        </h3>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg leading-8 text-muted-foreground">
          {isDesktop ? 'Votre tableau est actuellement vide.' : 'Votre espace commandes est actuellement vide.'}
          <br />
          Les nouvelles commandes apparaîtront automatiquement ici dès leur création.
        </p>

        {/* Premium Info Cards */}
        <div className={`mt-12 grid gap-5 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
          <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6">
            <div className="text-3xl font-black text-purple-600">0</div>
            <p className="mt-2 text-sm text-muted-foreground">Commandes actives</p>
          </div>
          <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6">
            <div className="text-2xl sm:text-3xl font-black text-fuchsia-600 break-words">{lastActivityLabel}</div>
            <p className="mt-2 text-sm text-muted-foreground">Dernière activité</p>
          </div>
          <div className="rounded-3xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-6">
            <div className="text-3xl font-black text-indigo-600">✓</div>
            <p className="mt-2 text-sm text-muted-foreground">Synchronisé</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandesEmptyState;
