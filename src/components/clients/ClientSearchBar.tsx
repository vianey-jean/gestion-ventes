// ClientSearchBar.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Users,
  Sparkles,
  ArrowRight,
  Command,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filteredCount,
}) => {
  const hasSearch = searchQuery.length > 0;
  const validSearch = searchQuery.length >= 3;
  const invalidSearch = hasSearch && !validSearch;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-8 sm:mb-10 md:mb-12 w-full"
    >
      {/* ================= CONTAINER ================= */}
      <div className="relative group">
        {/* Animated luxury border */}
        <motion.div
          className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        {/* Main panel */}
        <div className="relative overflow-hidden rounded-[27px] bg-[#08080c] border border-white/10">
          {/* Decorative grid */}
          <div
            className="
              absolute inset-0
              opacity-[0.07]
              pointer-events-none
              bg-[linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)]
              bg-[size:32px_32px]
            "
          />

          {/* Top animated line */}
          <motion.div
            className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Decorative circles - NO BLUR */}
          <motion.div
            className="absolute -top-24 -right-24 h-56 w-56 rounded-full border border-violet-500/20"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute -bottom-28 -left-20 h-48 w-48 rounded-full border border-fuchsia-500/15"
            animate={{
              scale: [1, 1.12, 1],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* ================= CONTENT ================= */}
          <div className="relative z-10 p-4 sm:p-6 md:p-7 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Title */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotate: 5,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="
                    relative
                    flex h-12 w-12 sm:h-14 sm:w-14
                    shrink-0
                    items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-violet-600
                    via-fuchsia-600
                    to-indigo-600
                    text-white
                    shadow-[0_12px_35px_rgba(139,92,246,0.35)]
                  "
                >
                  <Search className="h-5 w-5 sm:h-6 sm:w-6" />

                  <motion.div
                    className="absolute -right-1 -top-1"
                    animate={{
                      scale: [1, 1.25, 1],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-fuchsia-300" />
                  </motion.div>
                </motion.div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
                      Rechercher un client
                    </h2>

                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-violet-400" />
                    </motion.div>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-white/50">
                    Trouvez rapidement un client dans votre base
                  </p>
                </div>
              </div>

              {/* Counter */}
              <AnimatePresence mode="wait">
                {validSearch ? (
                  <motion.div
                    key="results"
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.85,
                      x: 15,
                    }}
                    className="
                      self-start
                      lg:self-auto
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border border-emerald-400/20
                      bg-emerald-400/10
                      px-4 py-2
                      text-emerald-300
                    "
                  >
                    <motion.span
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />

                    <Users className="h-4 w-4" />

                    <span className="text-xs sm:text-sm font-bold">
                      {filteredCount} résultat
                      {filteredCount > 1 ? 's' : ''}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="command"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="
                      hidden sm:flex
                      items-center
                      gap-2
                      rounded-full
                      border border-white/10
                      bg-white/[0.04]
                      px-3 py-2
                      text-white/40
                    "
                  >
                    <Command className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      Recherche intelligente
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="mt-6 sm:mt-7">
              <div className="relative">
                {/* Search icon */}
                <motion.div
                  animate={{
                    scale: hasSearch ? 1.08 : 1,
                    rotate: hasSearch ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2"
                >
                  <Search
                    className={`h-5 w-5 transition-colors duration-300 ${
                      validSearch
                        ? 'text-fuchsia-400'
                        : invalidSearch
                        ? 'text-orange-400'
                        : 'text-white/40'
                    }`}
                  />
                </motion.div>

                {/* Input */}
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Nom, téléphone, adresse..."
                  className={`
                    h-14 sm:h-16
                    w-full
                    rounded-2xl
                    border-2
                    bg-white/[0.04]
                    pl-12
                    ${hasSearch ? 'pr-14' : 'pr-5'}
                    text-sm sm:text-base
                    font-medium
                    text-white
                    placeholder:text-white/30
                    outline-none
                    transition-all
                    duration-300
                    ${
                      validSearch
                        ? 'border-fuchsia-500/60 bg-fuchsia-500/[0.05] ring-4 ring-fuchsia-500/10'
                        : invalidSearch
                        ? 'border-orange-500/60 bg-orange-500/[0.04] ring-4 ring-orange-500/10'
                        : 'border-white/10 hover:border-violet-500/40 focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10'
                    }
                  `}
                />

                {/* Clear button */}
                <AnimatePresence>
                  {hasSearch && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: -90,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: 90,
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onSearchChange('')}
                        className="
                          h-10 w-10
                          rounded-xl
                          p-0
                          text-white/40
                          hover:bg-white/10
                          hover:text-white
                          transition-all
                        "
                        aria-label="Effacer la recherche"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ================= STATUS ================= */}
              <AnimatePresence mode="wait">
                {validSearch && (
                  <motion.div
                    key="valid"
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mt-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 text-emerald-400">
                      <motion.div
                        animate={{
                          x: [0, 4, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>

                      <span className="text-xs sm:text-sm font-semibold">
                        {filteredCount === 0
                          ? 'Aucun client trouvé'
                          : `${filteredCount} client${
                              filteredCount > 1 ? 's' : ''
                            } trouvé${
                              filteredCount > 1 ? 's' : ''
                            }`}
                      </span>
                    </div>

                    <span className="hidden sm:block text-[11px] text-white/30">
                      Recherche active
                    </span>
                  </motion.div>
                )}

                {invalidSearch && (
                  <motion.div
                    key="invalid"
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mt-4 flex items-center gap-2 text-orange-400"
                  >
                    <Sparkles className="h-4 w-4" />

                    <span className="text-xs sm:text-sm font-semibold">
                      Saisissez au moins 3 caractères pour lancer la recherche.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ================= BOTTOM INFO ================= */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-white/30">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span className="text-[11px] sm:text-xs">
                  Recherche par nom, téléphone ou adresse
                </span>
              </div>

              <motion.div
                whileHover={{
                  x: 4,
                }}
                className="flex items-center gap-1.5 text-white/25"
              >
                <span className="text-[10px] sm:text-xs">
                  Recherche instantanée
                </span>
                <ArrowRight className="h-3 w-3" />
              </motion.div>
            </div>
          </div>

          {/* Bottom luxury line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"
            animate={{
              width: ['20%', '80%', '20%'],
              x: ['0%', '10%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ClientSearchBar;