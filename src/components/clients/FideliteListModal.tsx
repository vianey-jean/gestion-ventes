/**
 * FideliteListModal — Gestion premium des paliers de fidélité.
 *
 * Design :
 * - Mode clair : interface lumineuse, blanche et élégante
 * - Mode sombre : interface sombre, premium et contrastée
 * - Aucun  / aucun effet de flou
 * - Animations modernes et fluides
 * - Responsive mobile / tablette / desktop
 */

import React, { useEffect, useState } from 'react';
import {
  Crown,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  Save,
  X,
  Infinity,
  Check,
  Layers3,
  ChevronRight,
  Gem,
  CircleDollarSign,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';

import listesFideliteApi, {
  FideliteTierConfig,
} from '@/services/api/listesFideliteApi';

import PremiumLoading from '@/components/ui/premium-loading';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/* =========================================================
   FORMULAIRE VIDE
========================================================= */

const emptyForm = (): FideliteTierConfig => ({
  id: '',
  label: '',
  min: 0,
  max: 0,
  order: 0,
  grad: 'from-slate-500 to-slate-700',
});

/* =========================================================
   PALETTE PREMIUM
========================================================= */

const GRAD_PRESETS: {
  label: string;
  grad: string;
}[] = [
  {
    label: 'Ardoise',
    grad: 'from-slate-500 to-slate-700',
  },
  {
    label: 'Bleu',
    grad: 'from-sky-500 to-blue-600',
  },
  {
    label: 'Vert',
    grad: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Violet',
    grad: 'from-purple-500 via-fuchsia-500 to-pink-500',
  },
  {
    label: 'Or',
    grad: 'from-yellow-400 via-amber-500 to-orange-500',
  },
  {
    label: 'Rouge',
    grad: 'from-rose-500 to-red-600',
  },
  {
    label: 'Rose',
    grad: 'from-pink-400 to-rose-500',
  },
  {
    label: 'Indigo',
    grad: 'from-indigo-500 to-violet-600',
  },
  {
    label: 'Cyan',
    grad: 'from-cyan-400 to-sky-600',
  },
  {
    label: 'Lime',
    grad: 'from-lime-400 to-green-600',
  },
  {
    label: 'Ambre',
    grad: 'from-amber-400 to-orange-600',
  },
  {
    label: 'Noir',
    grad: 'from-zinc-700 to-black',
  },
];

/* =========================================================
   PICKER DE GRADIENT
========================================================= */

interface GradPickerProps {
  value: string;
  onChange: (grad: string) => void;
}

const GradPicker: React.FC<GradPickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">

      {/* TITRE */}

      <div className="flex items-center gap-2">
        <div
          className="
            flex h-8 w-8 items-center justify-center
            rounded-lg
            bg-violet-100
            text-violet-600
            dark:bg-violet-500/10
            dark:text-violet-400
            transition-transform duration-300
            hover:rotate-6
            hover:scale-110
          "
        >
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white">
            Couleur du palier
          </Label>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Choisissez une identité visuelle
          </p>
        </div>
      </div>

      {/* PALETTE */}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {GRAD_PRESETS.map((preset) => {
          const active = value === preset.grad;

          return (
            <button
              key={preset.grad}
              type="button"
              onClick={() => onChange(preset.grad)}
              title={preset.label}
              className={`
                group
                relative
                h-11
                overflow-hidden
                rounded-xl
                bg-gradient-to-r
                ${preset.grad}
                border-2
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-[1.03]
                hover:shadow-lg
                ${
                  active
                    ? `
                      border-white
                      ring-2
                      ring-violet-500
                      ring-offset-2
                      ring-offset-white
                      dark:ring-offset-slate-900
                      scale-[1.03]
                    `
                    : `
                      border-transparent
                    `
                }
              `}
            >
              {/* reflet */}

              <span
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/25
                  to-transparent
                  -translate-x-full
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              {/* check */}

              {active && (
                <span
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    animate-[fadeScale_0.25s_ease-out]
                  "
                >
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-violet-700
                      shadow-lg
                    "
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* PREVIEW */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-3
          dark:border-slate-700
          dark:bg-slate-800/70
          transition-colors
          duration-300
        "
      >
        <div className="mb-2 flex items-center justify-between">
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-500
              dark:text-slate-400
            "
          >
            Aperçu
          </span>

          <Sparkles
            className="
              h-3.5
              w-3.5
              text-violet-500
              animate-pulse
            "
          />
        </div>

        <div
          className={`
            relative
            flex
            h-11
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            bg-gradient-to-r
            ${value}
            text-white
            shadow-lg
          `}
        >
          <span className="relative z-10 text-xs font-black tracking-wide">
            Palier Premium
          </span>

          <span
            className="
              absolute
              inset-y-0
              left-0
              w-1/3
              bg-white/20
              -skew-x-12
              -translate-x-full
              animate-[shine_3s_ease-in-out_infinite]
            "
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

const FideliteListModal: React.FC<Props> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const [list, setList] = useState<FideliteTierConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] =
    useState<FideliteTierConfig | null>(null);

  const [creating, setCreating] =
    useState<FideliteTierConfig | null>(null);

  const [toDelete, setToDelete] =
    useState<FideliteTierConfig | null>(null);

  const [maxOpen, setMaxOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  const reload = async () => {
    setLoading(true);

    try {
      const data = await listesFideliteApi.getAll();

      setList(data);
    } catch {
      setList([]);

      toast({
        title: 'Impossible de charger les paliers',
        description:
          'Une erreur est survenue lors du chargement.',
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      reload();
    }
  }, [open]);

  /* =========================================================
     NOTIFICATION GLOBALE
  ========================================================= */

  const notify = () => {
    window.dispatchEvent(
      new CustomEvent('listes-fidelite-updated')
    );

    window.dispatchEvent(
      new CustomEvent('sales-updated')
    );
  };

  /* =========================================================
     MODIFICATION
  ========================================================= */

  const handleSaveEdit = async () => {
    if (!editing || saving) return;

    if (!editing.label.trim()) {
      toast({
        title: 'Nom obligatoire',
        description:
          'Le nom du palier est obligatoire.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    if (Number(editing.min) < 0) {
      toast({
        title: 'Valeur invalide',
        description:
          'Le minimum ne peut pas être négatif.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    if (
      !maxOpen &&
      Number(editing.max) < Number(editing.min)
    ) {
      toast({
        title: 'Plage invalide',
        description:
          'Le maximum doit être supérieur ou égal au minimum.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    setSaving(true);

    try {
      const patch: Partial<FideliteTierConfig> = {
        label: editing.label.trim(),
        min: Number(editing.min),
        max: maxOpen
          ? null
          : Number(editing.max),
        grad: editing.grad,
      };

      const data =
        await listesFideliteApi.update(
          editing.id,
          patch
        );

      setList(data);
      setEditing(null);

      notify();

      toast({
        title: 'Palier mis à jour',
        description:
          `${editing.label} a été mis à jour avec succès.`,
        className: 'notification-success',
      });
    } catch (e: any) {
      toast({
        title: 'Modification refusée',
        description:
          e?.response?.data?.message ||
          'Une erreur est survenue.',
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CRÉATION
  ========================================================= */

  const handleCreate = async () => {
    if (!creating || saving) return;

    if (!creating.label.trim()) {
      toast({
        title: 'Nom obligatoire',
        description:
          'Le nom du palier est obligatoire.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    const min = Number(creating.min);

    if (min < 0) {
      toast({
        title: 'Valeur invalide',
        description:
          'Le minimum ne peut pas être négatif.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    if (
      !maxOpen &&
      Number(creating.max) < min
    ) {
      toast({
        title: 'Plage invalide',
        description:
          'Le maximum doit être supérieur ou égal au minimum.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    /* Vérification des chevauchements */

    const occupied = list.find((tier) => {
      const tierMax =
        tier.max === null
          ? Number.POSITIVE_INFINITY
          : Number(tier.max);

      return (
        min >= Number(tier.min) &&
        min <= tierMax
      );
    });

    if (occupied) {
      toast({
        title: 'Palier déjà couvert',
        description:
          `Le minimum ${min} est déjà couvert par "${occupied.label}".`,
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    setSaving(true);

    try {
      const payload = {
        label: creating.label.trim(),
        min,
        max: maxOpen
          ? null
          : Number(creating.max),
        grad: creating.grad,
      };

      const data =
        await listesFideliteApi.add(payload);

      setList(data);
      setCreating(null);

      notify();

      toast({
        title: 'Palier ajouté',
        description:
          `${creating.label} a été créé avec succès.`,
        className: 'notification-success',
      });
    } catch (e: any) {
      toast({
        title: 'Ajout refusé',
        description:
          e?.response?.data?.message ||
          'Une erreur est survenue.',
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  const handleDelete = async () => {
    if (!toDelete || saving) return;

    setSaving(true);

    try {
      const deletedLabel = toDelete.label;

      const data =
        await listesFideliteApi.remove(
          toDelete.id
        );

      setList(data);
      setToDelete(null);

      notify();

      toast({
        title: 'Palier supprimé',
        description:
          `${deletedLabel} a été supprimé.`,
        className: 'notification-success',
      });
    } catch (e: any) {
      toast({
        title: 'Suppression refusée',
        description:
          e?.response?.data?.message ||
          'Une erreur est survenue.',
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ÉDITION
  ========================================================= */

  const startEdit = (
    tier: FideliteTierConfig
  ) => {
    setEditing({
      ...tier,
    });

    setMaxOpen(tier.max === null);
  };

  /* =========================================================
     CRÉATION
  ========================================================= */

  const startCreate = () => {
    const maxUsed = list.reduce(
      (max, tier) =>
        Math.max(
          max,
          tier.max === null
            ? max
            : Number(tier.max)
        ),
      -1
    );

    const nextMin = maxUsed + 1;

    setCreating({
      ...emptyForm(),
      min: nextMin,
      max: nextMin,
      order: list.length,
    });

    setMaxOpen(false);
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MODALE PRINCIPALE
      ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          className="
            max-w-3xl
            w-[calc(100%-1rem)]
            sm:w-[calc(100%-2rem)]
            p-0
            gap-0
            overflow-hidden
            rounded-[28px]
            sm:rounded-[32px]

            border
            border-slate-200
            bg-white

            dark:border-slate-700
            dark:bg-slate-950

            shadow-[0_25px_80px_rgba(15,23,42,0.18)]
            dark:shadow-[0_25px_80px_rgba(0,0,0,0.65)]

            animate-in
            fade-in-0
            zoom-in-95
            duration-300
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <DialogHeader
            className="
              relative
              overflow-hidden
              border-b
              border-slate-200
              bg-gradient-to-br
              from-white
              via-slate-50
              to-violet-50
              px-5
              py-5
              sm:px-7
              sm:py-6

              dark:border-slate-800
              dark:from-slate-950
              dark:via-slate-900
              dark:to-violet-950/40
            "
          >

            {/* décoration */}

            <div
              className="
                pointer-events-none
                absolute
                right-[-60px]
                top-[-80px]
                h-48
                w-48
                rounded-full
                border
                border-violet-200
                dark:border-violet-500/10
                animate-[slowSpin_18s_linear_infinite]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-[-20px]
                top-[-40px]
                h-28
                w-28
                rounded-full
                border
                border-fuchsia-200
                dark:border-fuchsia-500/10
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
              "
            >

              {/* TITRE */}

              <div className="flex min-w-0 items-center gap-3">

                <div
                  className="
                    relative
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-amber-400
                    via-yellow-500
                    to-orange-500
                    text-slate-950
                    shadow-lg
                    shadow-amber-500/20
                    transition-all
                    duration-500
                    hover:rotate-6
                    hover:scale-110
                  "
                >
                  <Crown className="h-5 w-5" />

                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      h-3
                      w-3
                      rounded-full
                      bg-white
                      shadow-md
                      animate-ping
                    "
                  />
                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-violet-600
                      dark:text-violet-400
                    "
                  >
                    Configuration premium
                  </p>

                  <DialogTitle
                    className="
                      truncate
                      text-lg
                      font-black
                      tracking-tight
                      text-slate-950
                      sm:text-xl

                      dark:text-white
                    "
                  >
                    Paliers de fidélité
                  </DialogTitle>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Configurez votre programme VIP
                  </p>
                </div>
              </div>

              {/* BOUTON AJOUT */}

              <Button
                onClick={startCreate}
                className="
                  group
                  h-10
                  w-full
                  rounded-xl
                  border-0
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-600
                  px-4
                  text-white
                  shadow-lg
                  shadow-violet-500/20
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-violet-500/30

                  active:scale-95

                  sm:ml-auto
                  sm:w-auto
                "
              >
                <Plus
                  className="
                    mr-1.5
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:rotate-90
                  "
                />

                Ajouter un palier
              </Button>
            </div>

            {/* ligne premium */}

            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                h-[2px]
                bg-gradient-to-r
                from-violet-500
                via-fuchsia-500
                to-amber-400
                bg-[length:200%_100%]
                animate-[gradientMove_4s_linear_infinite]
              "
            />
          </DialogHeader>

          {/* =================================================
              LISTE
          ================================================= */}

          <div
            className="
              max-h-[65vh]
              overflow-y-auto
              p-4
              sm:p-6
              space-y-3
              bg-slate-50
              dark:bg-slate-950
            "
          >

            {loading && (
              <div
                className="
                  flex
                  min-h-[280px]
                  items-center
                  justify-center
                "
              >
                <PremiumLoading
                  text="Chargement des paliers fidélité…"
                  size="lg"
                />
              </div>
            )}

            {!loading &&
              list.map((tier, index) => (
                <div
                  key={tier.id}
                  style={{
                    animationDelay: `${index * 70}ms`,
                  }}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    shadow-sm
                    animate-[cardEnter_0.45s_ease-out_both]
                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:shadow-slate-900/10

                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:hover:border-slate-700
                    dark:hover:shadow-black/30
                  `}
                >

                  {/* accent */}

                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      bottom-0
                      w-1
                      bg-gradient-to-b
                      ${tier.grad}
                    `}
                  />

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      pl-2
                    "
                  >

                    {/* BADGE */}

                    <div
                      className={`
                        relative
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        ${tier.grad}
                        text-white
                        shadow-md
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:rotate-2
                      `}
                    >
                      <Gem className="h-5 w-5" />

                      <span
                        className="
                          absolute
                          right-1
                          top-1
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-white
                          opacity-80
                          animate-pulse
                        "
                      />
                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <Sparkles
                          className={`
                            h-3.5
                            w-3.5
                            shrink-0
                            text-violet-500
                            transition-transform
                            duration-300
                            group-hover:rotate-12
                            group-hover:scale-110
                          `}
                        />

                        <p
                          className="
                            truncate
                            text-sm
                            font-black
                            text-slate-900
                            sm:text-base
                            dark:text-white
                          "
                        >
                          {tier.label}
                        </p>
                      </div>

                      <div
                        className="
                          mt-1
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        <CircleDollarSign
                          className="
                            h-3.5
                            w-3.5
                          "
                        />

                        <span>
                          Achats requis :
                        </span>

                        <span
                          className="
                            font-bold
                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          {tier.min}
                        </span>

                        {tier.max === null ? (
                          <>
                            <span>et plus</span>

                            <Infinity
                              className="
                                h-4
                                w-4
                                text-violet-500
                              "
                            />
                          </>
                        ) : tier.min !== tier.max ? (
                          <>
                            <span>à</span>

                            <span
                              className="
                                font-bold
                                text-slate-700
                                dark:text-slate-200
                              "
                            >
                              {tier.max}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                      "
                    >

                      <button
                        onClick={() => startEdit(tier)}
                        title="Modifier"
                        className="
                          group/action
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-slate-600
                          transition-all
                          duration-300

                          hover:-translate-y-0.5
                          hover:border-violet-300
                          hover:bg-violet-50
                          hover:text-violet-600
                          hover:shadow-md

                          active:scale-90

                          dark:border-slate-700
                          dark:bg-slate-800
                          dark:text-slate-300
                          dark:hover:border-violet-500/40
                          dark:hover:bg-violet-500/10
                          dark:hover:text-violet-400
                        "
                      >
                        <Pencil
                          className="
                            h-4
                            w-4
                            transition-transform
                            duration-300
                            group-hover/action:rotate-[-8deg]
                          "
                        />
                      </button>

                      <button
                        onClick={() => setToDelete(tier)}
                        title="Supprimer"
                        className="
                          group/action
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          text-red-500
                          transition-all
                          duration-300

                          hover:-translate-y-0.5
                          hover:border-red-300
                          hover:bg-red-100
                          hover:text-red-600
                          hover:shadow-md
                          hover:shadow-red-500/10

                          active:scale-90

                          dark:border-red-900/60
                          dark:bg-red-950/40
                          dark:text-red-400
                          dark:hover:border-red-800
                          dark:hover:bg-red-950
                          dark:hover:text-red-300
                        "
                      >
                        <Trash2
                          className="
                            h-4
                            w-4
                            transition-transform
                            duration-300
                            group-hover/action:scale-110
                          "
                        />
                      </button>

                      <ChevronRight
                        className="
                          hidden
                          h-4
                          w-4
                          text-slate-300
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                          sm:block
                          dark:text-slate-700
                        "
                      />
                    </div>
                  </div>
                </div>
              ))}

            {/* EMPTY */}

            {!loading && list.length === 0 && (
              <div
                className="
                  flex
                  min-h-[260px]
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-6
                  text-center

                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-violet-100
                    text-violet-600
                    transition-all
                    duration-500
                    hover:rotate-6
                    hover:scale-110

                    dark:bg-violet-500/10
                    dark:text-violet-400
                  "
                >
                  <Layers3 className="h-7 w-7" />
                </div>

                <h3
                  className="
                    text-base
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Aucun palier configuré
                </h3>

                <p
                  className="
                    mt-1
                    max-w-sm
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Créez votre premier niveau de fidélité
                  pour commencer votre programme VIP.
                </p>

                <Button
                  onClick={startCreate}
                  className="
                    mt-5
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-fuchsia-600
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Créer un palier
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          MODALE ÉDITION
      ===================================================== */}

      <Dialog
        open={!!editing}
        onOpenChange={(value) =>
          !value && setEditing(null)
        }
      >
        <DialogContent
          className="
            max-w-lg
            w-[calc(100%-1rem)]
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-2xl

            dark:border-slate-700
            dark:bg-slate-900
            dark:text-white

            animate-in
            fade-in-0
            zoom-in-95
            duration-300
          "
        >
          <DialogHeader>
            <DialogTitle
              className="
                flex
                items-center
                gap-3
                text-slate-950
                dark:text-white
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                  transition-transform
                  duration-300
                  hover:rotate-6
                "
              >
                <Pencil className="h-4 w-4" />
              </div>

              <div>
                <p className="text-base font-black">
                  Modifier le palier
                </p>

                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Personnalisez ses conditions
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5 pt-2">

              {/* NOM */}

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 dark:text-slate-200">
                  Nom du palier
                </Label>

                <Input
                  value={editing.label}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      label: e.target.value,
                    })
                  }
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    bg-slate-50
                    transition-all
                    duration-300
                    focus:border-violet-400
                    focus:ring-violet-400/20

                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />
              </div>

              {/* MIN / MAX */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700 dark:text-slate-200">
                    Produits min.
                  </Label>

                  <Input
                    type="number"
                    min={0}
                    value={editing.min}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        min: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="
                      h-11
                      rounded-xl
                      border-slate-200
                      bg-slate-50
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700 dark:text-slate-200">
                    Produits max.
                  </Label>

                  <Input
                    type="number"
                    min={0}
                    disabled={maxOpen}
                    value={
                      maxOpen
                        ? ''
                        : editing.max ?? 0
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        max: Number(
                          e.target.value
                        ),
                      })
                    }
                    placeholder={
                      maxOpen ? '∞' : ''
                    }
                    className="
                      h-11
                      rounded-xl
                      border-slate-200
                      bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  />
                </div>
              </div>

              {/* MAX OUVERT */}

              <label
                className="
                  group
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                  transition-all
                  duration-300
                  hover:border-violet-300
                  hover:bg-violet-50

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:hover:border-violet-500/40
                  dark:hover:bg-violet-500/5
                "
              >
                <input
                  type="checkbox"
                  checked={maxOpen}
                  onChange={(e) =>
                    setMaxOpen(
                      e.target.checked
                    )
                  }
                  className="
                    h-4
                    w-4
                    accent-violet-600
                  "
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Palier ouvert
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aucun maximum
                  </p>
                </div>

                <Infinity
                  className="
                    ml-auto
                    h-5
                    w-5
                    text-violet-500
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />
              </label>

              {/* COULEUR */}

              <GradPicker
                value={editing.grad}
                onChange={(grad) =>
                  setEditing({
                    ...editing,
                    grad,
                  })
                }
              />

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-2
                  pt-2
                  sm:flex-row
                  sm:justify-end
                "
              >
                <Button
                  variant="outline"
                  onClick={() =>
                    setEditing(null)
                  }
                  disabled={saving}
                  className="
                    rounded-xl
                    border-slate-200
                    text-slate-600
                    transition-all
                    duration-300
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-600

                    dark:border-slate-700
                    dark:text-slate-300
                    dark:hover:border-red-900
                    dark:hover:bg-red-950/40
                    dark:hover:text-red-400
                  "
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Annuler
                </Button>

                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-purple-600
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  <Save className="mr-1.5 h-4 w-4" />

                  {saving
                    ? 'Enregistrement…'
                    : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          MODALE CRÉATION
      ===================================================== */}

      <Dialog
        open={!!creating}
        onOpenChange={(value) =>
          !value && setCreating(null)
        }
      >
        <DialogContent
          className="
            max-w-lg
            w-[calc(100%-1rem)]
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-2xl

            dark:border-slate-700
            dark:bg-slate-900
            dark:text-white

            animate-in
            fade-in-0
            zoom-in-95
            duration-300
          "
        >
          <DialogHeader>
            <DialogTitle
              className="
                flex
                items-center
                gap-3
                text-slate-950
                dark:text-white
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-100
                  text-emerald-600
                  dark:bg-emerald-500/10
                  dark:text-emerald-400
                  transition-all
                  duration-300
                  hover:rotate-6
                  hover:scale-105
                "
              >
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-black">
                  Nouveau palier
                </p>

                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Créez un nouveau niveau VIP
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {creating && (
            <div className="space-y-5 pt-2">

              {/* NOM */}

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 dark:text-slate-200">
                  Nom du palier
                </Label>

                <Input
                  value={creating.label}
                  onChange={(e) =>
                    setCreating({
                      ...creating,
                      label: e.target.value,
                    })
                  }
                  placeholder="Ex : Client Diamant"
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    bg-slate-50
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />
              </div>

              {/* MIN / MAX */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700 dark:text-slate-200">
                    Produits min.
                  </Label>

                  <Input
                    type="number"
                    min={0}
                    value={creating.min}
                    onChange={(e) =>
                      setCreating({
                        ...creating,
                        min: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="
                      h-11
                      rounded-xl
                      border-slate-200
                      bg-slate-50
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700 dark:text-slate-200">
                    Produits max.
                  </Label>

                  <Input
                    type="number"
                    min={0}
                    disabled={maxOpen}
                    value={
                      maxOpen
                        ? ''
                        : creating.max ?? 0
                    }
                    onChange={(e) =>
                      setCreating({
                        ...creating,
                        max: Number(
                          e.target.value
                        ),
                      })
                    }
                    placeholder={
                      maxOpen ? '∞' : ''
                    }
                    className="
                      h-11
                      rounded-xl
                      border-slate-200
                      bg-slate-50
                      disabled:opacity-50
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  />
                </div>
              </div>

              {/* MAX OUVERT */}

              <label
                className="
                  group
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                  transition-all
                  duration-300
                  hover:border-emerald-300
                  hover:bg-emerald-50

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:hover:border-emerald-500/40
                  dark:hover:bg-emerald-500/5
                "
              >
                <input
                  type="checkbox"
                  checked={maxOpen}
                  onChange={(e) =>
                    setMaxOpen(
                      e.target.checked
                    )
                  }
                  className="
                    h-4
                    w-4
                    accent-emerald-600
                  "
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Palier ouvert
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aucun maximum
                  </p>
                </div>

                <Infinity
                  className="
                    ml-auto
                    h-5
                    w-5
                    text-emerald-500
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />
              </label>

              {/* COULEUR */}

              <GradPicker
                value={creating.grad}
                onChange={(grad) =>
                  setCreating({
                    ...creating,
                    grad,
                  })
                }
              />

              {/* INFO */}

              <div
                className="
                  flex
                  gap-2
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-3
                  text-xs
                  text-amber-700

                  dark:border-amber-900/60
                  dark:bg-amber-950/30
                  dark:text-amber-400
                "
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  Le minimum ne doit pas être déjà
                  couvert par un autre palier.
                </p>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-2
                  pt-2
                  sm:flex-row
                  sm:justify-end
                "
              >
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreating(null)
                  }
                  disabled={saving}
                  className="
                    rounded-xl
                    border-slate-200
                    text-slate-600
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-600

                    dark:border-slate-700
                    dark:text-slate-300
                    dark:hover:border-red-900
                    dark:hover:bg-red-950/40
                    dark:hover:text-red-400
                  "
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Annuler
                </Button>

                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-emerald-500
                    to-teal-600
                    text-white
                    shadow-lg
                    shadow-emerald-500/20
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  <Save className="mr-1.5 h-4 w-4" />

                  {saving
                    ? 'Création…'
                    : 'Créer le palier'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          CONFIRMATION SUPPRESSION
      ===================================================== */}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(value) =>
          !value && setToDelete(null)
        }
      >
        <AlertDialogContent
          className="
            w-[calc(100%-1rem)]
            max-w-md
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-2xl

            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <AlertDialogHeader>

            <div
              className="
                mb-2
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-red-100
                text-red-600
                dark:bg-red-500/10
                dark:text-red-400
                animate-[warningPop_0.4s_ease-out]
              "
            >
              <Trash2 className="h-5 w-5" />
            </div>

            <AlertDialogTitle
              className="
                text-slate-950
                dark:text-white
              "
            >
              Supprimer ce palier ?
            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                leading-relaxed
                text-slate-500
                dark:text-slate-400
              "
            >
              Le palier{' '}
              <strong
                className="
                  font-bold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                "{toDelete?.label}"
              </strong>{' '}
              sera définitivement supprimé.

              <br />

              <span className="mt-2 block">
                Les clients concernés seront
                automatiquement recalculés selon leur
                nombre d'achats.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter
            className="
              flex
              flex-col-reverse
              gap-2
              sm:flex-row
            "
          >
            <AlertDialogCancel
              disabled={saving}
              className="
                rounded-xl
                border-slate-200
                text-slate-600
                dark:border-slate-700
                dark:text-slate-300
              "
            >
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="
                rounded-xl
                bg-gradient-to-r
                from-red-500
                to-rose-600
                text-white
                shadow-lg
                shadow-red-500/20
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-xl
                active:scale-95
              "
            >
              <Trash2 className="mr-1.5 h-4 w-4" />

              {saving
                ? 'Suppression…'
                : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

          @keyframes cardEnter {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeScale {
            from {
              opacity: 0;
              transform: scale(0.6);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes warningPop {
            0% {
              opacity: 0;
              transform: scale(0.7) rotate(-8deg);
            }

            70% {
              transform: scale(1.08) rotate(2deg);
            }

            100% {
              opacity: 1;
              transform: scale(1) rotate(0);
            }
          }

          @keyframes shine {
            0% {
              transform: translateX(-150%) skewX(-12deg);
            }

            45%,
            100% {
              transform: translateX(400%) skewX(-12deg);
            }
          }

          @keyframes slowSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default FideliteListModal;