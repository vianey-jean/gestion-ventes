
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Printer,
  Calendar,
  Zap,
  Award,
  Sparkles,
  Search,
  FileDown,
  CheckCircle2,
  XCircle,
  Command,
} from 'lucide-react';
import { Commande } from '@/types/commande';

interface CommandesSearchBarProps {
  commandeSearch: string;
  setCommandeSearch: (value: string) => void;
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;
  exportDate: string;
  setExportDate: (date: string) => void;
  commandesForExportDate: Commande[];
  handleExportPDF: () => void;
  onNewCommande: () => void;
}

const CommandesSearchBar: React.FC<CommandesSearchBarProps> = ({
  commandeSearch,
  setCommandeSearch,
  exportDialogOpen,
  setExportDialogOpen,
  exportDate,
  setExportDate,
  commandesForExportDate,
  handleExportPDF,
  onNewCommande,
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-4 shadow-[0_20px_70px_-25px_rgba(88,28,135,0.35)]  transition-all duration-500 sm:p-5 lg:p-6 dark:border-white/10 dark:bg-gray-950/70">
      
      {/* Background decorative effects */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-500/10 " />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-pink-500/10 " />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-indigo-500/5 " />

      <div className="relative flex w-full flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        
        {/* =========================
            TITLE SECTION
        ========================== */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Premium Icon */}
            <div className="group relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 opacity-60  transition-all duration-500 group-hover:opacity-90 group-hover:" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 shadow-[0_12px_35px_-8px_rgba(139,92,246,0.8)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-14 sm:w-14">
                <Award className="h-5 w-5 text-white drop-shadow-lg transition-transform duration-500 group-hover:scale-110 sm:h-7 sm:w-7" />

                <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-pulse text-yellow-300 sm:h-4 sm:w-4" />
              </div>
            </div>

            {/* Title */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl md:text-3xl lg:text-4xl">
                  Commandes Premium
                </h1>

                <span className="hidden items-center gap-1 rounded-full border border-purple-200/70 bg-purple-50/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 shadow-sm sm:inline-flex dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                  <Sparkles className="h-3 w-3" />
                  Pro
                </span>
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <span>Gestion d'élite de vos commandes</span>
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            ACTIONS SECTION
        ========================== */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4 xl:w-auto xl:flex-row xl:items-center">
          
          {/* =========================
              SEARCH
          ========================== */}
          <div className="group relative w-full xl:w-80">
            
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 opacity-0 transition duration-500 group-focus-within:opacity-100" />

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-purple-500 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-purple-600" />

              <Input
                value={commandeSearch}
                onChange={(e) => setCommandeSearch(e.target.value)}
                placeholder="Rechercher une commande..."
                className="h-11 w-full rounded-2xl border border-purple-200/80 bg-white/80 pl-10 pr-16 text-sm shadow-[0_8px_25px_-12px_rgba(139,92,246,0.5)]  transition-all duration-300 placeholder:text-muted-foreground/60 hover:border-purple-300 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.45)] focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-purple-800/70 dark:bg-gray-900/80 dark:focus:bg-gray-900"
              />

              {/* Character counter */}
              {commandeSearch.length > 0 && commandeSearch.length < 3 && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-600 transition-all duration-300 animate-in fade-in zoom-in-95 dark:bg-purple-950/50 dark:text-purple-300">
                  {3 - commandeSearch.length} car.
                </div>
              )}

              {/* Valid search indicator */}
              {commandeSearch.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              )}
            </div>
          </div>

          {/* =========================
              BUTTONS
          ========================== */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
            
            {/* =========================
                EXPORT BUTTON
            ========================== */}
            <Dialog
              open={exportDialogOpen}
              onOpenChange={(open) => {
                setExportDialogOpen(open);
                if (!open) setExportDate('');
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="group relative h-11 w-full overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-3 text-xs font-bold text-white shadow-[0_12px_30px_-10px_rgba(59,130,246,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-10px_rgba(79,70,229,0.75)] active:translate-y-0 sm:w-auto sm:px-4 sm:text-sm"
                  size="default"
                >
                  {/* Shine animation */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex items-center justify-center">
                    <Printer className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 sm:mr-2" />

                    <span className="hidden sm:inline">Imprimer</span>
                    <span className="sm:hidden">PDF</span>
                  </span>
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border border-blue-200/60 bg-white/95 p-5 shadow-[0_30px_100px_-25px_rgba(37,99,235,0.45)]  animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 sm:p-6 dark:border-blue-800/50 dark:bg-gray-950/95">
                
                {/* Dialog decorative background */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 " />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/10 " />

                <div className="relative">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <FileDown className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </span>

                      <span>Exporter les commandes</span>
                    </DialogTitle>

                    <DialogDescription className="pt-1 text-xs leading-relaxed sm:text-sm">
                      Sélectionnez une date pour exporter les commandes/réservations en PDF.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-6 space-y-4">
                    
                    {/* Date field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="exportDate"
                        className="flex items-center gap-2 text-sm font-bold"
                      >
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Date à exporter
                      </Label>

                      <div className="group relative">
                        <Input
                          id="exportDate"
                          type="date"
                          value={exportDate}
                          onChange={(e) => setExportDate(e.target.value)}
                          className="h-11 rounded-xl border-2 border-blue-200 bg-white/80 px-3 text-sm shadow-inner transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-blue-800 dark:bg-gray-900"
                        />
                      </div>
                    </div>

                    {/* Export information */}
                    {exportDate && (
                      <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                        <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/50 p-4 shadow-inner dark:border-blue-800 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30">
                          
                          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-400/10 " />

                          <div className="relative space-y-3">
                            
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Date
                              </span>

                              <span className="text-right text-sm font-bold capitalize text-blue-700 dark:text-blue-300">
                                {new Date(exportDate).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            </div>

                            <div className="h-px bg-blue-200/60 dark:bg-blue-800/60" />

                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Nombre
                              </span>

                              <div className="flex items-center gap-2">
                                {commandesForExportDate.length > 0 ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}

                                <span
                                  className={
                                    commandesForExportDate.length > 0
                                      ? 'text-lg font-black text-emerald-600'
                                      : 'text-lg font-black text-red-600'
                                  }
                                >
                                  {commandesForExportDate.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Export button */}
                    {exportDate && commandesForExportDate.length > 0 && (
                      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                        <Button
                          onClick={handleExportPDF}
                          className="group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 font-bold text-white shadow-[0_15px_35px_-12px_rgba(16,185,129,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.75)] active:translate-y-0"
                        >
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                          <span className="relative flex items-center justify-center">
                            <Printer className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                            Exporter en PDF
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* No commande message */}
                    {exportDate && commandesForExportDate.length === 0 && (
                      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-2xl border border-red-200/70 bg-red-50/70 p-3 text-center dark:border-red-900/50 dark:bg-red-950/20">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          Aucune commande disponible pour cette date.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* =========================
                NEW COMMANDE BUTTON
            ========================== */}
            <Button
              onClick={onNewCommande}
              className="group relative h-11 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-3 text-xs font-bold text-white shadow-[0_15px_35px_-10px_rgba(168,85,247,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.85)] active:translate-y-0 sm:w-auto sm:px-4 sm:text-sm"
              size="default"
            >
              {/* Animated shine */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              {/* Background glow */}
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-300/20 to-indigo-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="relative flex items-center justify-center">
                <Zap className="mr-1.5 h-4 w-4 fill-current transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 sm:mr-2" />

                <span className="hidden sm:inline">
                  Nouvelle Commande
                </span>

                <span className="sm:hidden">
                  Nouveau
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom subtle status line */}
      <div className="relative mt-4 hidden items-center justify-between border-t border-gray-200/60 pt-3 text-[10px] text-muted-foreground sm:flex dark:border-gray-800/60">
        <div className="flex items-center gap-2">
          <Command className="h-3 w-3 text-purple-500" />
          <span>Interface de gestion premium</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Système opérationnel</span>
        </div>
      </div>
    </div>
  );
};

export default CommandesSearchBar;

