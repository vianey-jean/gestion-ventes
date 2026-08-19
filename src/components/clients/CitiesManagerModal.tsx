/**
 * CitiesManagerModal
 * ---------------------------------------------------------
 * Gestion premium des villes clients.
 *
 * Design :
 * - Mode clair ☀️
 * - Mode sombre 🌙
 * - Animations premium
 * - Responsive
 * - Sans 
 * - Icônes Lucide modernes
 * - Compatible avec le thème Tailwind dark:
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import {
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  Building2,
  CheckCircle2,
  X,
  Search,
  MapPinned,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { clientsVillesApi } from '@/services/api/villesApi';

import CityFormModal from './CityFormModal';
import ConfirmModal from '@/components/notes/ConfirmModal';
import PremiumLoading from '@/components/ui/premium-loading';

import { motion, AnimatePresence } from 'framer-motion';

export interface CitiesManagerModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const CitiesManagerModal: React.FC<CitiesManagerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const [villes, setVilles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{
    message: string;
    action: () => Promise<void> | void;
  } | null>(null);

  const [search, setSearch] = useState('');

  /* ---------------------------------------------------------
   * Chargement
   * --------------------------------------------------------- */

  const load = async () => {
    try {
      setLoading(true);

      const list = await clientsVillesApi.getAll();

      setVilles(list);
    } catch {
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de récupérer les villes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      load();
      setSearch('');
    }
  }, [open]);

  /* ---------------------------------------------------------
   * Ajouter
   * --------------------------------------------------------- */

  const handleAdd = async (ville: string) => {
    try {
      const list = await clientsVillesApi.add(ville);

      setVilles(list);
      setShowAdd(false);

      toast({
        title: 'Ville ajoutée',
        description: `${ville} a été ajoutée à votre liste.`,
        className: 'notification-success',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter cette ville.",
        variant: 'destructive',
      });
    }
  };

  /* ---------------------------------------------------------
   * Modifier
   * --------------------------------------------------------- */

  const handleUpdate = (original: string) => async (ville: string) => {
    setConfirm({
      message: `Renommer "${original}" en "${ville}" ?`,

      action: async () => {
        try {
          const list = await clientsVillesApi.update(
            original,
            ville
          );

          setVilles(list);

          toast({
            title: 'Ville modifiée',
            description: `${original} est maintenant ${ville}.`,
            className: 'notification-success',
          });
        } catch (e: any) {
          toast({
            title: 'Erreur',
            description:
              e?.response?.data?.message ||
              'Impossible de modifier cette ville.',
            variant: 'destructive',
          });
        } finally {
          setConfirm(null);
          setEditing(null);
        }
      },
    });
  };

  /* ---------------------------------------------------------
   * Supprimer
   * --------------------------------------------------------- */

  const handleDelete = (ville: string) => {
    setConfirm({
      message: `Supprimer définitivement la ville "${ville}" ?`,

      action: async () => {
        try {
          const list = await clientsVillesApi.remove(ville);

          setVilles(list);

          toast({
            title: 'Ville supprimée',
            description: `${ville} a été supprimée.`,
            className: 'notification-success',
          });
        } catch {
          toast({
            title: 'Erreur',
            description: 'Impossible de supprimer cette ville.',
            variant: 'destructive',
          });
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  /* ---------------------------------------------------------
   * Recherche
   * --------------------------------------------------------- */

  const filteredVilles = villes.filter((ville) =>
    ville.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------------------------------------------------
   * Render
   * --------------------------------------------------------- */

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          className="
            group

            w-[calc(100%-20px)]
            sm:max-w-xl

            max-h-[88vh]
            p-0
            gap-0

            overflow-hidden

            rounded-[28px]
            sm:rounded-[32px]

            border

            border-slate-200
            dark:border-white/10

            bg-white
            dark:bg-slate-950

            text-slate-900
            dark:text-white

            shadow-[0_25px_80px_rgba(15,23,42,0.18)]
            dark:shadow-[0_25px_100px_rgba(0,0,0,0.65)]

            transition-all
            duration-500
          "
        >

          {/* =================================================
              LIGNE LUMINEUSE TOP
          ================================================= */}

          <div
            className="
              absolute
              top-0
              left-0
              right-0
              h-[3px]

              bg-gradient-to-r
              from-violet-500
              via-fuchsia-500
              to-blue-500

              dark:from-violet-400
              dark:via-fuchsia-400
              dark:to-cyan-400

              animate-[gradientMove_6s_linear_infinite]
            "
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <DialogHeader
            className="
              relative

              px-5
              sm:px-7

              pt-6
              sm:pt-7

              pb-5

              border-b

              border-slate-200
              dark:border-white/10

              bg-gradient-to-br

              from-white
              via-slate-50
              to-violet-50/60

              dark:from-slate-950
              dark:via-slate-950
              dark:to-violet-950/30
            "
          >

            {/* Décoration */}
            <div
              className="
                pointer-events-none
                absolute
                -top-20
                -right-20

                w-48
                h-48

                rounded-full

                bg-violet-500/10
                dark:bg-violet-500/10

                

                animate-pulse
              "
            />

            <div
              className="
                relative
                flex
                items-center
                gap-3
              "
            >

              {/* Icône principale */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.7,
                  rotate: -12,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                className="
                  relative
                  flex
                  items-center
                  justify-center

                  w-12
                  h-12
                  sm:w-14
                  sm:h-14

                  rounded-2xl

                  bg-gradient-to-br
                  from-violet-500
                  via-purple-600
                  to-indigo-600

                  dark:from-violet-400
                  dark:via-purple-500
                  dark:to-indigo-500

                  text-white

                  shadow-lg
                  shadow-violet-500/25

                  transition-transform
                  duration-500

                  group-hover:scale-105
                "
              >

                <MapPinned
                  className="
                    w-6
                    h-6
                    sm:w-7
                    sm:h-7

                    transition-transform
                    duration-500

                    group-hover:scale-110
                    group-hover:-rotate-3
                  "
                />

                <span
                  className="
                    absolute
                    -right-1
                    -top-1

                    flex
                    items-center
                    justify-center

                    w-5
                    h-5

                    rounded-full

                    bg-gradient-to-br
                    from-amber-400
                    to-orange-500

                    border-2
                    border-white
                    dark:border-slate-950

                    shadow-md
                  "
                >
                  <Sparkles
                    className="w-2.5 h-2.5 text-white"
                  />
                </span>
              </motion.div>

              {/* Titre */}

              <div className="min-w-0 flex-1">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mb-1
                  "
                >
                  <span
                    className="
                      text-[10px]
                      sm:text-xs

                      font-bold
                      uppercase
                      tracking-[0.2em]

                      text-violet-600
                      dark:text-violet-400
                    "
                  >
                    Localisation
                  </span>

                  <span
                    className="
                      w-1
                      h-1
                      rounded-full

                      bg-violet-400
                      dark:bg-violet-500
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      sm:text-xs

                      font-medium

                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Gestion
                  </span>
                </div>

                <DialogTitle
                  className="
                    text-xl
                    sm:text-2xl

                    font-black

                    tracking-tight

                    text-slate-900
                    dark:text-white
                  "
                >
                  Villes des clients
                </DialogTitle>

                <p
                  className="
                    mt-1

                    text-xs
                    sm:text-sm

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Organisez facilement les localisations de votre clientèle.
                </p>

              </div>

              {/* Compteur */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="
                  hidden
                  sm:flex

                  flex-col
                  items-center
                  justify-center

                  min-w-[62px]
                  h-[62px]

                  rounded-2xl

                  border

                  border-slate-200
                  dark:border-white/10

                  bg-slate-50
                  dark:bg-white/5
                "
              >

                <span
                  className="
                    text-xl
                    font-black

                    bg-gradient-to-r
                    from-violet-600
                    to-indigo-600

                    dark:from-violet-400
                    dark:to-indigo-400

                    bg-clip-text
                    text-transparent
                  "
                >
                  {villes.length}
                </span>

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-wider
                    font-bold

                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  villes
                </span>

              </motion.div>

            </div>

            {/* Recherche + Ajouter */}

            <div
              className="
                relative
                flex
                items-center
                gap-2

                mt-5
              "
            >

              {/* Search */}

              <div
                className="
                  relative
                  flex-1
                  group/search
                "
              >

                <Search
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2

                    w-4
                    h-4

                    text-slate-400
                    dark:text-slate-500

                    transition-colors
                    duration-300

                    group-focus-within/search:text-violet-500
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une ville..."
                  className="
                    w-full

                    h-11

                    pl-10
                    pr-10

                    rounded-xl

                    border

                    border-slate-200
                    dark:border-white/10

                    bg-slate-50
                    dark:bg-white/[0.04]

                    text-sm

                    text-slate-900
                    dark:text-white

                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500

                    outline-none

                    transition-all
                    duration-300

                    focus:border-violet-400
                    dark:focus:border-violet-500

                    focus:ring-4
                    focus:ring-violet-500/10

                    focus:bg-white
                    dark:focus:bg-white/[0.06]
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      flex
                      items-center
                      justify-center

                      w-6
                      h-6

                      rounded-full

                      text-slate-400
                      hover:text-slate-700

                      dark:text-slate-500
                      dark:hover:text-white

                      hover:bg-slate-200
                      dark:hover:bg-white/10

                      transition-all
                      duration-200
                    "
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

              </div>

              {/* Ajouter */}

              <Button
                onClick={() => setShowAdd(true)}
                className="
                  h-11
                  px-4

                  rounded-xl

                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-indigo-600

                  dark:from-violet-500
                  dark:via-purple-500
                  dark:to-indigo-500

                  hover:from-violet-700
                  hover:via-purple-700
                  hover:to-indigo-700

                  text-white

                  border-0

                  shadow-lg
                  shadow-violet-500/20

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-violet-500/30

                  active:scale-95
                "
              >

                <Plus
                  className="
                    w-4
                    h-4
                    mr-1.5

                    transition-transform
                    duration-300

                    group-hover:rotate-90
                  "
                />

                <span className="hidden sm:inline">
                  Ajouter
                </span>

              </Button>

            </div>

          </DialogHeader>

          {/* =================================================
              LISTE
          ================================================= */}

          <div
            className="
              relative

              flex-1

              overflow-y-auto

              px-4
              sm:px-6

              py-4
              sm:py-5

              max-h-[55vh]

              scrollbar-thin

              scrollbar-thumb-slate-300
              dark:scrollbar-thumb-slate-700

              scrollbar-track-transparent
            "
          >

            {/* Loading */}

            <AnimatePresence mode="wait">

              {loading && (
                <motion.div
                  key="loading"
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center

                    py-16
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center

                      w-16
                      h-16

                      rounded-2xl

                      bg-violet-50
                      dark:bg-violet-500/10

                      border

                      border-violet-100
                      dark:border-violet-500/20

                      mb-4
                    "
                  >
                    <Loader2
                      className="
                        w-7
                        h-7

                        text-violet-600
                        dark:text-violet-400

                        animate-spin
                      "
                    />
                  </div>

                  <PremiumLoading
                    text="Chargement des villes…"
                    size="lg"
                  />

                </motion.div>
              )}

            </AnimatePresence>

            {/* Aucun résultat */}

            {!loading &&
              filteredVilles.length === 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center

                    py-16
                    px-5
                  "
                >

                  <div
                    className="
                      relative

                      flex
                      items-center
                      justify-center

                      w-20
                      h-20

                      rounded-3xl

                      bg-gradient-to-br

                      from-slate-100
                      to-violet-100

                      dark:from-slate-800
                      dark:to-violet-950

                      border

                      border-slate-200
                      dark:border-white/10

                      shadow-lg
                    "
                  >

                    <MapPin
                      className="
                        w-9
                        h-9

                        text-slate-400
                        dark:text-slate-500
                      "
                    />

                    <span
                      className="
                        absolute
                        -top-1
                        -right-1

                        w-6
                        h-6

                        flex
                        items-center
                        justify-center

                        rounded-full

                        bg-gradient-to-br
                        from-violet-500
                        to-indigo-600

                        text-white

                        shadow-md
                      "
                    >
                      <Sparkles className="w-3 h-3" />
                    </span>

                  </div>

                  <h3
                    className="
                      mt-5

                      text-base
                      sm:text-lg

                      font-bold

                      text-slate-800
                      dark:text-white
                    "
                  >
                    {search
                      ? 'Aucune ville trouvée'
                      : 'Aucune ville enregistrée'}
                  </h3>

                  <p
                    className="
                      mt-1

                      text-xs
                      sm:text-sm

                      text-center

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {search
                      ? `Aucun résultat pour « ${search} »`
                      : 'Commencez par ajouter votre première ville.'}
                  </p>

                  {!search && (
                    <Button
                      onClick={() => setShowAdd(true)}
                      className="
                        mt-5

                        rounded-xl

                        bg-gradient-to-r
                        from-violet-600
                        to-indigo-600

                        text-white

                        shadow-lg

                        hover:-translate-y-0.5

                        transition-all
                        duration-300
                      "
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une ville
                    </Button>
                  )}

                </motion.div>
              )}

            {/* Liste */}

            {!loading &&
              filteredVilles.length > 0 && (
                <div className="space-y-2.5">

                  <AnimatePresence initial={false}>

                    {filteredVilles.map((ville, index) => (
                      <motion.div
                        key={ville}
                        layout
                        initial={{
                          opacity: 0,
                          x: -15,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          x: 20,
                          scale: 0.96,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(index * 0.035, 0.25),
                        }}
                        className="
                          group/item

                          relative

                          flex
                          items-center
                          justify-between
                          gap-3

                          p-3
                          sm:p-3.5

                          rounded-2xl

                          border

                          border-slate-200
                          dark:border-white/[0.08]

                          bg-white
                          dark:bg-white/[0.025]

                          shadow-sm

                          transition-all
                          duration-300

                          hover:-translate-y-0.5

                          hover:border-violet-200
                          dark:hover:border-violet-500/30

                          hover:shadow-lg
                          dark:hover:shadow-black/30

                          hover:bg-violet-50/30
                          dark:hover:bg-violet-500/[0.04]
                        "
                      >

                        {/* Ligne décorative */}

                        <div
                          className="
                            absolute
                            left-0
                            top-3
                            bottom-3

                            w-[3px]

                            rounded-full

                            bg-gradient-to-b
                            from-violet-500
                            to-indigo-500

                            opacity-0

                            group-hover/item:opacity-100

                            transition-opacity
                            duration-300
                          "
                        />

                        {/* Ville */}

                        <div
                          className="
                            flex
                            items-center
                            gap-3

                            min-w-0
                          "
                        >

                          <motion.div
                            whileHover={{
                              scale: 1.08,
                              rotate: -4,
                            }}
                            className="
                              shrink-0

                              flex
                              items-center
                              justify-center

                              w-10
                              h-10

                              rounded-xl

                              bg-gradient-to-br

                              from-violet-100
                              to-indigo-100

                              dark:from-violet-500/15
                              dark:to-indigo-500/15

                              border

                              border-violet-200
                              dark:border-violet-500/20

                              transition-all
                              duration-300

                              group-hover/item:shadow-md
                              group-hover/item:shadow-violet-500/10
                            "
                          >

                            <MapPin
                              className="
                                w-4.5
                                h-4.5

                                text-violet-600
                                dark:text-violet-400

                                transition-transform
                                duration-300

                                group-hover/item:scale-110
                              "
                            />

                          </motion.div>

                          <div className="min-w-0">

                            <p
                              className="
                                font-bold

                                text-sm
                                sm:text-[15px]

                                text-slate-800
                                dark:text-slate-100

                                truncate

                                transition-colors
                                duration-300

                                group-hover/item:text-violet-700
                                dark:group-hover/item:text-violet-300
                              "
                            >
                              {ville}
                            </p>

                            <div
                              className="
                                flex
                                items-center
                                gap-1.5
                                mt-0.5
                              "
                            >

                              <CheckCircle2
                                className="
                                  w-3
                                  h-3

                                  text-emerald-500
                                "
                              />

                              <span
                                className="
                                  text-[10px]
                                  sm:text-[11px]

                                  font-medium

                                  text-slate-400
                                  dark:text-slate-500
                                "
                              >
                                Ville enregistrée
                              </span>

                            </div>

                          </div>

                        </div>

                        {/* Actions */}

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5

                            shrink-0
                          "
                        >

                          {/* Modifier */}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(ville)}
                            aria-label={`Modifier ${ville}`}
                            className="
                              w-9
                              h-9

                              p-0

                              rounded-xl

                              text-slate-400
                              dark:text-slate-500

                              hover:text-amber-600
                              dark:hover:text-amber-400

                              hover:bg-amber-50
                              dark:hover:bg-amber-500/10

                              transition-all
                              duration-300

                              hover:scale-105
                            "
                          >
                            <Pencil
                              className="
                                w-4
                                h-4

                                transition-transform
                                duration-300

                                group-hover/item:rotate-0
                              "
                            />
                          </Button>

                          {/* Supprimer */}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(ville)}
                            aria-label={`Supprimer ${ville}`}
                            className="
                              w-9
                              h-9

                              p-0

                              rounded-xl

                              text-slate-400
                              dark:text-slate-500

                              hover:text-red-600
                              dark:hover:text-red-400

                              hover:bg-red-50
                              dark:hover:bg-red-500/10

                              transition-all
                              duration-300

                              hover:scale-105
                            "
                          >
                            <Trash2
                              className="
                                w-4
                                h-4
                              "
                            />
                          </Button>

                        </div>

                      </motion.div>
                    ))}

                  </AnimatePresence>

                </div>
              )}

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          {!loading && villes.length > 0 && (
            <div
              className="
                flex
                items-center
                justify-between

                gap-3

                px-5
                sm:px-6

                py-3.5

                border-t

                border-slate-200
                dark:border-white/10

                bg-slate-50/80
                dark:bg-white/[0.025]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center

                    w-7
                    h-7

                    rounded-lg

                    bg-emerald-100
                    dark:bg-emerald-500/10
                  "
                >
                  <Building2
                    className="
                      w-3.5
                      h-3.5

                      text-emerald-600
                      dark:text-emerald-400
                    "
                  />
                </div>

                <span
                  className="
                    text-xs

                    font-medium

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {filteredVilles.length} ville
                  {filteredVilles.length > 1 ? 's' : ''}
                  {search
                    ? ' trouvée'
                    : ' enregistrée'}
                  {filteredVilles.length > 1 ? 's' : ''}
                </span>

              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1.5

                  text-[10px]
                  sm:text-xs

                  font-semibold

                  text-violet-600
                  dark:text-violet-400
                "
              >
                <Sparkles className="w-3 h-3" />
                Gestion premium
              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* =====================================================
          AJOUT
      ===================================================== */}

      <CityFormModal
        open={showAdd}
        onOpenChange={setShowAdd}
        title="Ajouter une ville"
        confirmLabel="Ajouter"
        onSubmit={handleAdd}
      />

      {/* =====================================================
          MODIFICATION
      ===================================================== */}

      <CityFormModal
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initialValue={editing || ''}
        title="Modifier la ville"
        confirmLabel="Enregistrer"
        onSubmit={
          editing
            ? handleUpdate(editing)
            : async () => {}
        }
      />

      {/* =====================================================
          CONFIRMATION
      ===================================================== */}

      {confirm && (
        <ConfirmModal
          open={true}
          message={confirm.message}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }

            50% {
              background-position: 100% 50%;
            }

            100% {
              background-position: 0% 50%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default CitiesManagerModal;