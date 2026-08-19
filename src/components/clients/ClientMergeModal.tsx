/**
 * ClientMergeModal - Modale de fusion de plusieurs clients en un seul.
 *
 * Flux:
 *  1. L'utilisateur sélectionne 2 clients ou plus dans la liste.
 *  2. Pour chaque champ (nom, téléphones, adresse, photo), il choisit
 *     parmi les valeurs existantes ou en saisit une nouvelle.
 *  3. À l'enregistrement, un nouveau client est créé et tous les clients
 *     sources sélectionnés sont supprimés via POST /api/clients/merge.
 */

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Trash2,
  Merge,
  Search,
  Sparkles,
  Check,
  ChevronRight,
  Phone,
  MapPin,
  UserRound,
  Camera,
  X,
  ShieldCheck,
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones: string[];
  adresse: string;
  photo?: string;
}

interface ClientMergeModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onMerged: () => void;
}

const ClientMergeModal: React.FC<ClientMergeModalProps> = ({
  open,
  onClose,
  clients,
  onMerged,
}) => {
  const { toast } = useToast();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [nom, setNom] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [adresse, setAdresse] = useState('');
  const [keepPhotoFromId, setKeepPhotoFromId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Affiche PremiumLoading le temps que les données clients soient prêtes. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    setReady(false);

    const t = setTimeout(() => setReady(true), 450);

    return () => clearTimeout(t);
  }, [open, clients.length]);

  // Reset à l'ouverture
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
      setNom('');
      setPhones(['']);
      setAdresse('');
      setKeepPhotoFromId('');
    }
  }, [open]);

  const selectedClients = useMemo(
    () => clients.filter((c) => selectedIds.includes(c.id)),
    [clients, selectedIds]
  );

  // Pré-remplir les champs avec les valeurs du premier sélectionné
  useEffect(() => {
    if (selectedClients.length > 0 && !nom) {
      const first = selectedClients[0];

      setNom(first.nom);

      setPhones(
        first.phones && first.phones.length > 0
          ? [...first.phones]
          : ['']
      );

      setAdresse(first.adresse);

      if (first.photo) {
        setKeepPhotoFromId(first.id);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;

    const q = search.toLowerCase();

    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        (c.phones || []).some((p) => p.includes(search)) ||
        c.adresse.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // Récupère toutes les valeurs candidates pour un champ donné
  const candidatePhones = useMemo(() => {
    const set = new Set<string>();

    selectedClients.forEach((c) =>
      (c.phones || []).forEach((p) => p && set.add(p))
    );

    return Array.from(set);
  }, [selectedClients]);

  const candidateAddresses = useMemo(
    () =>
      Array.from(
        new Set(
          selectedClients
            .map((c) => c.adresse)
            .filter(Boolean)
        )
      ),
    [selectedClients]
  );

  const candidateNames = useMemo(
    () =>
      Array.from(
        new Set(
          selectedClients
            .map((c) => c.nom)
            .filter(Boolean)
        )
      ),
    [selectedClients]
  );

  const handleMerge = async () => {
    if (selectedIds.length < 2) {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez au moins 2 clients',
        variant: 'destructive',
      });

      return;
    }

    const validPhones = phones.filter((p) => p.trim());

    if (
      !nom.trim() ||
      validPhones.length === 0 ||
      !adresse.trim()
    ) {
      toast({
        title: 'Erreur',
        description: 'Nom, téléphone et adresse requis',
        variant: 'destructive',
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const fd = new FormData();

      fd.append(
        'sourceIds',
        JSON.stringify(selectedIds)
      );

      fd.append('nom', nom.trim());

      fd.append(
        'phones',
        JSON.stringify(validPhones)
      );

      fd.append('adresse', adresse.trim());

      if (keepPhotoFromId) {
        fd.append(
          'keepPhotoFromId',
          keepPhotoFromId
        );
      }

      await axios.post(
        `${API_BASE_URL}/api/clients/merge`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast({
        title: 'Fusion réussie',
        description: `${selectedIds.length} clients fusionnés en 1`,
        className: 'notification-success',
      });

      onMerged();
      onClose();
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description:
          e?.response?.data?.message ||
          'Erreur lors de la fusion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
    >
      <DialogContent
  className="
    group
    sm:max-w-3xl
    w-[calc(100%-1rem)]
    max-h-[94vh]
    overflow-y-auto
    overflow-x-hidden
    p-0
    gap-0
    border
    border-white/30
    dark:border-white/10
    bg-white/95
    dark:bg-slate-950/95
    
    shadow-[0_25px_80px_-20px_rgba(0,0,0,0.45)]
    dark:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)]
    rounded-[28px]
    sm:rounded-[32px]
    animate-in
    fade-in-0
    zoom-in-95
    duration-500
  "
>
        {/* Ambient premium background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[32px]">
          <div
            className="
              absolute
              -top-32
              -right-32
              h-72
              w-72
              rounded-full
              bg-orange-500/10
              dark:bg-orange-500/10
              
              animate-pulse
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-32
              h-80
              w-80
              rounded-full
              bg-red-500/10
              dark:bg-red-500/10
              
              animate-pulse
            "
            style={{ animationDelay: '700ms' }}
          />

          <div
            className="
              absolute
              top-1/3
              right-1/3
              h-32
              w-32
              rounded-full
              bg-amber-400/5
              
            "
          />
        </div>

        {/* Header */}
        <DialogHeader
          className="
            relative
            overflow-hidden
            px-5
            sm:px-7
            pt-6
            pb-5
            border-b
            border-slate-200/70
            dark:border-white/10
            bg-gradient-to-br
            from-orange-50/90
            via-white/80
            to-red-50/80
            dark:from-orange-950/30
            dark:via-slate-950/80
            dark:to-red-950/30
          "
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_40%)]" />

          <div className="relative flex items-start gap-4">
            {/* Logo */}
            <div
              className="
                relative
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-orange-500
                via-orange-600
                to-red-600
                text-white
                shadow-[0_12px_30px_-8px_rgba(234,88,12,0.7)]
                ring-1
                ring-white/40
                dark:ring-white/10
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:rotate-1
              "
            >
              <Merge className="h-7 w-7" />

              <div
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-orange-600
                  shadow-lg
                  dark:bg-slate-900
                "
              >
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
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
                  Fusionner des clients
                </DialogTitle>
              </div>

              <DialogDescription
                className="
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Regroupez plusieurs fiches clients dans une
                nouvelle fiche propre, complète et personnalisée.
              </DialogDescription>

              {/* Status */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    text-emerald-700
                    dark:border-emerald-500/20
                    dark:bg-emerald-500/10
                    dark:text-emerald-400
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Fusion sécurisée
                </div>

                {selectedIds.length > 0 && (
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-orange-200
                      bg-orange-50
                      px-3
                      py-1.5
                      text-[11px]
                      font-bold
                      text-orange-700
                      animate-in
                      fade-in
                      slide-in-from-left-2
                      duration-300
                      dark:border-orange-500/20
                      dark:bg-orange-500/10
                      dark:text-orange-400
                    "
                  >
                    <Users className="h-3.5 w-3.5" />
                    {selectedIds.length} sélectionné
                    {selectedIds.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {!ready && (
          <div
            className="
              relative
              flex
              min-h-[420px]
              items-center
              justify-center
              bg-white/70
              dark:bg-slate-950/70
              animate-in
              fade-in
              duration-300
            "
          >
            <PremiumLoading
              text="Chargement des clients…"
              size="lg"
            />
          </div>
        )}

        <div
  className="
    relative
    flex
    min-h-0
    max-h-[calc(94vh-150px)]
    flex-1
    flex-col
    overflow-hidden
  "
  hidden={!ready}
>
          {/* Scrollable content */}
          <div
  className="
    min-h-0
    flex-1
    overflow-y-auto
    overflow-x-hidden
    overscroll-contain
    px-4
    sm:px-7
    py-5
    sm:py-6
    scrollbar-thin
    scrollbar-thumb-orange-300
    scrollbar-track-transparent
    dark:scrollbar-thumb-orange-900
    dark:scrollbar-track-transparent
    [scrollbar-width:thin]
    [-webkit-overflow-scrolling:touch]
  "
>
            <div className="space-y-5">
              {/* =========================
                  STEP 1
              ========================= */}
              <section
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white/80
                  shadow-sm
                  transition-all
                  duration-500
                  hover:border-orange-200
                  hover:shadow-[0_12px_35px_-20px_rgba(234,88,12,0.45)]
                  dark:border-white/10
                  dark:bg-white/[0.035]
                  dark:hover:border-orange-500/20
                "
              >
                {/* Step header */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-slate-200/70
                    bg-slate-50/80
                    px-4
                    py-3.5
                    dark:border-white/10
                    dark:bg-white/[0.025]
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-orange-500
                        to-red-500
                        text-sm
                        font-black
                        text-white
                        shadow-lg
                        shadow-orange-500/20
                      "
                    >
                      01
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Clients à fusionner
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sélectionnez au minimum 2 clients
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-8
                      min-w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-orange-100
                      px-2.5
                      text-xs
                      font-black
                      text-orange-700
                      dark:bg-orange-500/10
                      dark:text-orange-400
                    "
                  >
                    {selectedIds.length}
                  </div>
                </div>

                <div className="p-4">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                        transition-colors
                        duration-300
                      "
                    />

                    <Input
                      placeholder="Rechercher un client, téléphone ou adresse..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className="
                        h-11
                        rounded-xl
                        border-slate-200
                        bg-slate-50/70
                        pl-10
                        pr-10
                        text-sm
                        shadow-inner
                        transition-all
                        duration-300
                        placeholder:text-slate-400
                        focus:border-orange-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-orange-500/10
                        dark:border-white/10
                        dark:bg-white/[0.035]
                        dark:text-white
                        dark:focus:border-orange-500/50
                        dark:focus:bg-white/[0.055]
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
                          flex
                          h-6
                          w-6
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          text-slate-400
                          transition-all
                          hover:bg-slate-200
                          hover:text-slate-700
                          dark:hover:bg-white/10
                          dark:hover:text-white
                        "
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Client list */}
                  <div
  className="
    max-h-72
    overflow-y-auto
    overflow-x-hidden
    overscroll-contain
    rounded-2xl
    border
    border-slate-200
    bg-slate-50/50
    p-1.5
    scrollbar-thin
    scrollbar-thumb-orange-300
    scrollbar-track-transparent
    dark:border-white/10
    dark:bg-black/10
    dark:scrollbar-thumb-orange-900
    dark:scrollbar-track-transparent
  "
>
                    {filteredClients.length === 0 && (
                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          justify-center
                          px-4
                          py-12
                          text-center
                          animate-in
                          fade-in
                          zoom-in-95
                          duration-300
                        "
                      >
                        <div
                          className="
                            mb-3
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                            dark:bg-white/5
                          "
                        >
                          <Users className="h-5 w-5" />
                        </div>

                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Aucun client trouvé
                        </span>

                        <span className="mt-1 text-xs text-slate-400">
                          Essayez une autre recherche
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      {filteredClients.map((c, index) => {
                        const isSelected =
                          selectedIds.includes(c.id);

                        return (
                          <label
                            key={c.id}
                            style={{
                              animationDelay: `${Math.min(
                                index * 30,
                                300
                              )}ms`,
                            }}
                            className={`
                              group/client
                              relative
                              flex
                              cursor-pointer
                              items-center
                              gap-3
                              overflow-hidden
                              rounded-xl
                              border
                              p-3
                              transition-all
                              duration-300
                              animate-in
                              fade-in
                              slide-in-from-bottom-1
                              ${
                                isSelected
                                  ? `
                                    border-orange-300
                                    bg-gradient-to-r
                                    from-orange-50
                                    to-red-50
                                    shadow-[0_6px_20px_-12px_rgba(234,88,12,0.65)]
                                    dark:border-orange-500/30
                                    dark:from-orange-500/10
                                    dark:to-red-500/10
                                  `
                                  : `
                                    border-transparent
                                    bg-white/60
                                    hover:border-slate-200
                                    hover:bg-white
                                    hover:shadow-sm
                                    dark:bg-white/[0.02]
                                    dark:hover:border-white/10
                                    dark:hover:bg-white/[0.045]
                                  `
                              }
                            `}
                          >
                            {/* Selected glow */}
                            {isSelected && (
                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  inset-y-0
                                  left-0
                                  w-1
                                  rounded-full
                                  bg-gradient-to-b
                                  from-orange-400
                                  to-red-500
                                "
                              />
                            )}

                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleSelect(c.id)
                              }
                              className="
                                h-5
                                w-5
                                rounded-md
                                border-slate-300
                                data-[state=checked]:border-orange-500
                                data-[state=checked]:bg-orange-500
                                dark:border-white/20
                              "
                            />

                            {/* Avatar */}
                            <div
                              className={`
                                relative
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                font-bold
                                transition-all
                                duration-300
                                ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                                }
                              `}
                            >
                              {c.photo ? (
                                <img
                                  src={c.photo}
                                  alt={c.nom}
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-500
                                    group-hover/client:scale-110
                                  "
                                />
                              ) : (
                                <UserRound className="h-5 w-5" />
                              )}

                              {isSelected && (
                                <div
                                  className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                    bg-black/20
                                    animate-in
                                    fade-in
                                    duration-200
                                  "
                                >
                                  <Check className="h-5 w-5 text-white drop-shadow" />
                                </div>
                              )}
                            </div>

                            {/* Client data */}
                            <div className="min-w-0 flex-1">
                              <div
                                className={`
                                  truncate
                                  text-sm
                                  font-bold
                                  transition-colors
                                  ${
                                    isSelected
                                      ? 'text-orange-800 dark:text-orange-300'
                                      : 'text-slate-900 dark:text-white'
                                  }
                                `}
                              >
                                {c.nom}
                              </div>

                              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <Phone className="h-3 w-3 shrink-0" />

                                <span className="truncate">
                                  {(c.phones || []).join(' · ') ||
                                    c.phone ||
                                    'Aucun téléphone'}
                                </span>

                                <span className="text-slate-300 dark:text-slate-600">
                                  •
                                </span>

                                <MapPin className="h-3 w-3 shrink-0" />

                                <span className="truncate">
                                  {c.adresse ||
                                    'Aucune adresse'}
                                </span>
                              </div>
                            </div>

                            <ChevronRight
                              className={`
                                h-4
                                w-4
                                shrink-0
                                transition-all
                                duration-300
                                ${
                                  isSelected
                                    ? 'translate-x-0 text-orange-500 opacity-100'
                                    : '-translate-x-1 text-slate-300 opacity-0 group-hover/client:translate-x-0 group-hover/client:opacity-100 dark:text-slate-600'
                                }
                              `}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================
                  SELECTED INFO
              ========================= */}
              {selectedIds.length >= 2 && (
                <div
                  className="
                    space-y-5
                    animate-in
                    fade-in
                    slide-in-from-bottom-4
                    duration-500
                  "
                >
                  {/* Selected clients summary */}
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-orange-200/70
                      bg-gradient-to-r
                      from-orange-50
                      via-white
                      to-red-50
                      p-3
                      dark:border-orange-500/10
                      dark:from-orange-500/10
                      dark:via-white/[0.025]
                      dark:to-red-500/10
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-orange-500
                        to-red-500
                        text-white
                        shadow-md
                        shadow-orange-500/20
                      "
                    >
                      <Users className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {selectedIds.length} profils vont être fusionnés
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Les informations ci-dessous définiront le nouveau client.
                      </p>
                    </div>
                  </div>

                  {/* =========================
                      STEP 2 - NAME
                  ========================= */}
                  <section
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white/80
                      p-4
                      shadow-sm
                      transition-all
                      duration-500
                      hover:shadow-lg
                      hover:shadow-orange-500/5
                      dark:border-white/10
                      dark:bg-white/[0.035]
                    "
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-50
                          text-blue-600
                          dark:bg-blue-500/10
                          dark:text-blue-400
                        "
                      >
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          02 · Nom du nouveau client
                        </h3>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Choisissez une valeur existante ou saisissez-en une nouvelle.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {candidateNames.map((n) => (
                        <Button
                          key={n}
                          type="button"
                          variant={
                            nom === n
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => setNom(n)}
                          className={`
                            h-9
                            rounded-xl
                            text-xs
                            font-semibold
                            transition-all
                            duration-300
                            ${
                              nom === n
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-red-600'
                                : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10'
                            }
                          `}
                        >
                          {nom === n && (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {n}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Input
                        value={nom}
                        onChange={(e) =>
                          setNom(e.target.value)
                        }
                        placeholder="Ou saisir un nouveau nom"
                        className="
                          h-11
                          rounded-xl
                          border-slate-200
                          bg-slate-50/50
                          transition-all
                          duration-300
                          focus:border-orange-400
                          focus:ring-4
                          focus:ring-orange-500/10
                          dark:border-white/10
                          dark:bg-white/[0.025]
                          dark:text-white
                        "
                      />
                    </div>
                  </section>

                  {/* =========================
                      STEP 3 - PHONES
                  ========================= */}
                  <section
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white/80
                      p-4
                      shadow-sm
                      transition-all
                      duration-500
                      hover:shadow-lg
                      hover:shadow-orange-500/5
                      dark:border-white/10
                      dark:bg-white/[0.035]
                    "
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-50
                            text-emerald-600
                            dark:bg-emerald-500/10
                            dark:text-emerald-400
                          "
                        >
                          <Phone className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            03 · Téléphone(s)
                          </h3>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Conservez un ou plusieurs numéros.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPhones([...phones, ''])
                        }
                        className="
                          h-9
                          rounded-xl
                          border-dashed
                          border-orange-300
                          text-orange-600
                          transition-all
                          duration-300
                          hover:scale-105
                          hover:border-orange-400
                          hover:bg-orange-50
                          dark:border-orange-500/30
                          dark:text-orange-400
                          dark:hover:bg-orange-500/10
                        "
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Ajouter
                      </Button>
                    </div>

                    {candidatePhones.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {candidatePhones.map((p) => (
                          <Button
                            key={p}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!phones.includes(p)) {
                                setPhones((prev) =>
                                  prev[0] === ''
                                    ? [p]
                                    : [...prev, p]
                                );
                              }
                            }}
                            className="
                              h-9
                              rounded-xl
                              border-slate-200
                              bg-white
                              text-xs
                              font-semibold
                              transition-all
                              duration-300
                              hover:-translate-y-0.5
                              hover:border-emerald-300
                              hover:bg-emerald-50
                              dark:border-white/10
                              dark:bg-white/[0.025]
                              dark:hover:border-emerald-500/30
                              dark:hover:bg-emerald-500/10
                            "
                          >
                            <Plus className="mr-1.5 h-3 w-3 text-emerald-500" />
                            {p}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      {phones.map((p, i) => (
                        <div
                          key={i}
                          className="
                            flex
                            gap-2
                            animate-in
                            fade-in
                            slide-in-from-right-2
                            duration-300
                          "
                        >
                          <div className="relative flex-1">
                            <Phone
                              className="
                                absolute
                                left-3
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2
                                text-slate-400
                              "
                            />

                            <Input
                              value={p}
                              onChange={(e) =>
                                setPhones((prev) =>
                                  prev.map((x, j) =>
                                    j === i
                                      ? e.target.value
                                      : x
                                  )
                                )
                              }
                              placeholder={`Téléphone ${i + 1}`}
                              className="
                                h-11
                                rounded-xl
                                border-slate-200
                                bg-slate-50/50
                                pl-10
                                transition-all
                                duration-300
                                focus:border-emerald-400
                                focus:ring-4
                                focus:ring-emerald-500/10
                                dark:border-white/10
                                dark:bg-white/[0.025]
                                dark:text-white
                              "
                            />
                          </div>

                          {phones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setPhones((prev) =>
                                  prev.filter(
                                    (_, j) => j !== i
                                  )
                                )
                              }
                              className="
                                h-11
                                w-11
                                shrink-0
                                rounded-xl
                                text-red-400
                                transition-all
                                duration-300
                                hover:scale-105
                                hover:bg-red-50
                                hover:text-red-600
                                dark:hover:bg-red-500/10
                              "
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* =========================
                      STEP 4 - ADDRESS
                  ========================= */}
                  <section
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white/80
                      p-4
                      shadow-sm
                      transition-all
                      duration-500
                      hover:shadow-lg
                      hover:shadow-orange-500/5
                      dark:border-white/10
                      dark:bg-white/[0.035]
                    "
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-purple-50
                          text-purple-600
                          dark:bg-purple-500/10
                          dark:text-purple-400
                        "
                      >
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          04 · Adresse
                        </h3>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sélectionnez une adresse existante ou créez-en une.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {candidateAddresses.map((a) => (
                        <Button
                          key={a}
                          type="button"
                          variant={
                            adresse === a
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => setAdresse(a)}
                          className={`
                            h-auto
                            min-h-9
                            rounded-xl
                            py-2
                            text-left
                            text-xs
                            font-semibold
                            transition-all
                            duration-300
                            ${
                              adresse === a
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20 hover:from-purple-600 hover:to-indigo-600'
                                : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-purple-500/30 dark:hover:bg-purple-500/10'
                            }
                          `}
                        >
                          {adresse === a && (
                            <Check className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="max-w-[280px] truncate">
                            {a}
                          </span>
                        </Button>
                      ))}
                    </div>

                    <div className="relative mt-3">
                      <MapPin
                        className="
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <Input
                        value={adresse}
                        onChange={(e) =>
                          setAdresse(e.target.value)
                        }
                        placeholder="Ou saisir une nouvelle adresse"
                        className="
                          h-11
                          rounded-xl
                          border-slate-200
                          bg-slate-50/50
                          pl-10
                          transition-all
                          duration-300
                          focus:border-purple-400
                          focus:ring-4
                          focus:ring-purple-500/10
                          dark:border-white/10
                          dark:bg-white/[0.025]
                          dark:text-white
                        "
                      />
                    </div>
                  </section>

                  {/* =========================
                      STEP 5 - PHOTO
                  ========================= */}
                  {selectedClients.some((c) => c.photo) && (
                    <section
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white/80
                        p-4
                        shadow-sm
                        transition-all
                        duration-500
                        hover:shadow-lg
                        hover:shadow-orange-500/5
                        dark:border-white/10
                        dark:bg-white/[0.035]
                      "
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-pink-50
                            text-pink-600
                            dark:bg-pink-500/10
                            dark:text-pink-400
                          "
                        >
                          <Camera className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            05 · Photo à conserver
                          </h3>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Choisissez la photo du nouveau profil.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <Button
                          type="button"
                          variant={
                            keepPhotoFromId === ''
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            setKeepPhotoFromId('')
                          }
                          className={`
                            h-24
                            flex-col
                            gap-2
                            rounded-2xl
                            transition-all
                            duration-300
                            ${
                              keepPhotoFromId === ''
                                ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg dark:from-slate-600 dark:to-slate-800'
                                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.025]'
                            }
                          `}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/10">
                            <X className="h-4 w-4" />
                          </div>

                          <span className="text-xs font-bold">
                            Aucune
                          </span>
                        </Button>

                        {selectedClients
                          .filter((c) => c.photo)
                          .map((c) => (
                            <Button
                              key={c.id}
                              type="button"
                              variant={
                                keepPhotoFromId === c.id
                                  ? 'default'
                                  : 'outline'
                              }
                              onClick={() =>
                                setKeepPhotoFromId(c.id)
                              }
                              className={`
                                relative
                                h-24
                                overflow-hidden
                                rounded-2xl
                                p-0
                                transition-all
                                duration-300
                                ${
                                  keepPhotoFromId === c.id
                                    ? 'scale-[1.02] border-2 border-orange-500 shadow-lg shadow-orange-500/20'
                                    : 'border-slate-200 hover:-translate-y-0.5 hover:border-orange-300 dark:border-white/10'
                                }
                              `}
                            >
                              <img
                                src={c.photo}
                                alt={c.nom}
                                className="
                                  absolute
                                  inset-0
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-500
                                  hover:scale-110
                                "
                              />

                              <div
                                className="
                                  absolute
                                  inset-0
                                  bg-gradient-to-t
                                  from-black/80
                                  via-black/20
                                  to-transparent
                                "
                              />

                              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2.5 text-left">
                                <span className="truncate text-[11px] font-bold text-white">
                                  {c.nom}
                                </span>

                                {keepPhotoFromId ===
                                  c.id && (
                                  <div
                                    className="
                                      flex
                                      h-5
                                      w-5
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-orange-500
                                      text-white
                                      animate-in
                                      zoom-in-75
                                      duration-200
                                    "
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))}
                      </div>
                    </section>
                  )}

                  {/* Final preview */}
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-orange-200/70
                      bg-gradient-to-br
                      from-orange-50
                      via-white
                      to-red-50
                      p-4
                      dark:border-orange-500/15
                      dark:from-orange-500/10
                      dark:via-slate-950/40
                      dark:to-red-500/10
                    "
                  >
                    <div
                      className="
                        absolute
                        -right-10
                        -top-10
                        h-32
                        w-32
                        rounded-full
                        bg-orange-400/10
                        
                      "
                    />

                    <div className="relative flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-orange-500
                          to-red-500
                          text-white
                          shadow-lg
                          shadow-orange-500/20
                        "
                      >
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          Nouveau profil
                        </p>

                        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                          {nom || 'Nom du client'}
                        </p>

                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {validPhonePreview(
                            phones
                          ) || 'Téléphone non défini'}
                          {' · '}
                          {adresse || 'Adresse non définie'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter
            className="
              relative
              flex
              flex-col-reverse
              gap-2
              border-t
              border-slate-200/80
              bg-white/90
              px-4
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-7
              dark:border-white/10
              dark:bg-slate-950/90
              
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  hidden
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-50
                  text-emerald-600
                  sm:flex
                  dark:bg-emerald-500/10
                  dark:text-emerald-400
                "
              >
                <ShieldCheck className="h-4 w-4" />
              </div>

              <p className="hidden text-[11px] leading-relaxed text-slate-500 sm:block dark:text-slate-400">
                Les clients sources seront remplacés
                <br />
                par le nouveau profil.
              </p>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  h-11
                  flex-1
                  rounded-xl
                  border-slate-200
                  bg-white
                  px-5
                  font-semibold
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-sm
                  dark:border-white/10
                  dark:bg-white/[0.025]
                  dark:text-slate-200
                  dark:hover:bg-white/[0.05]
                  sm:flex-none
                "
              >
                Annuler
              </Button>

              <Button
                onClick={handleMerge}
                disabled={
                  isSubmitting ||
                  selectedIds.length < 2
                }
                className="
                  group/merge
                  relative
                  h-11
                  flex-1
                  overflow-hidden
                  rounded-xl
                  border-0
                  bg-gradient-to-r
                  from-orange-500
                  via-orange-600
                  to-red-500
                  px-5
                  font-bold
                  text-white
                  shadow-[0_10px_30px_-10px_rgba(234,88,12,0.7)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:from-orange-600
                  hover:via-orange-600
                  hover:to-red-600
                  hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.8)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                  disabled:hover:shadow-[0_10px_30px_-10px_rgba(234,88,12,0.7)]
                  sm:flex-none
                "
              >
                {/* Button shine animation */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover/merge:translate-x-full
                  "
                />

                <span className="relative flex items-center justify-center">
                  <Merge
                    className={`
                      mr-2
                      h-4
                      w-4
                      ${
                        isSubmitting
                          ? 'animate-spin'
                          : 'transition-transform duration-300 group-hover/merge:rotate-90'
                      }
                    `}
                  />

                  {isSubmitting
                    ? 'Fusion en cours...'
                    : `Fusionner ${selectedIds.length} client${
                        selectedIds.length > 1
                          ? 's'
                          : ''
                      }`}
                </span>
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Petit helper visuel uniquement.
 * Il ne modifie aucune donnée envoyée à l'API.
 */
const validPhonePreview = (
  values: string[]
): string => {
  return values
    .filter((p) => p.trim())
    .join(' · ');
};

export default ClientMergeModal;