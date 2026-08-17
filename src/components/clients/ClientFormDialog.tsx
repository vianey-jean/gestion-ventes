/**
 * ClientFormDialog
 *
 * Dialogue premium d'ajout / modification d'un client.
 * - Photo
 * - Nom
 * - Téléphones multiples
 * - Adresses multiples
 * - Ville par adresse
 * - Adresse / téléphone principal
 * - Mode clair / sombre
 * - Animations
 * - Responsive
 * - Scroll moderne
 */

import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

import {
  Camera,
  Check,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';

export interface ClientFormData {
  nom: string;
  phones: string[];
  addresses: string[];
  ville: string;
  villes: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  availableVilles: string[];
  photoInputRef: React.RefObject<HTMLInputElement>;
  photoPreview: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

const ClientFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  editing,
  formData,
  setFormData,
  availableVilles,
  photoInputRef,
  photoPreview,
  isSubmitting,
  onSubmit,
  onPhotoSelect,
  onRemovePhoto,
}) => {
  const [pendingDelete, setPendingDelete] = React.useState<{
    type: 'phone' | 'address';
    index: number;
  } | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;

    const { type, index } = pendingDelete;

    setFormData((prev) => {
      if (type === 'phone') {
        return {
          ...prev,
          phones: prev.phones.filter((_, i) => i !== index),
        };
      }

      const villesArr = [...(prev.villes || [])];

      while (villesArr.length < prev.addresses.length) {
        villesArr.push('');
      }

      const addresses = prev.addresses.filter((_, i) => i !== index);
      const villes = villesArr.filter((_, i) => i !== index);

      return {
        ...prev,
        addresses,
        villes,
        ville: villes[0] || '',
      };
    });

    setPendingDelete(null);
  };

  const makeAddressPrimary = (index: number) => {
    setFormData((prev) => {
      const addrs = [...prev.addresses];
      const villesArr = [...(prev.villes || [])];

      while (villesArr.length < addrs.length) {
        villesArr.push('');
      }

      const [address] = addrs.splice(index, 1);
      const [ville] = villesArr.splice(index, 1);

      addrs.unshift(address);
      villesArr.unshift(ville || '');

      return {
        ...prev,
        addresses: addrs,
        villes: villesArr,
        ville: villesArr[0] || '',
      };
    });
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, ''],
    }));
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, ''],
      villes: [...(prev.villes || []), ''],
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
            group/dialog

            /* ====================================================== */
            /* STRUCTURE DU DIALOG                                   */
            /* ====================================================== */

            flex
            flex-col

            w-[calc(100%-1rem)]
            max-w-2xl

            h-[calc(100vh-1rem)]
            max-h-[94vh]

            sm:w-[calc(100%-2rem)]
            sm:h-auto
            sm:max-h-[90vh]

            overflow-hidden
            p-0

            rounded-[2rem]
            sm:rounded-[2.25rem]

            border
            border-black/[0.06]
            dark:border-white/[0.08]

            bg-white/95
            dark:bg-[#08090f]/95

            shadow-[0_30px_100px_-20px_rgba(0,0,0,0.35)]
            dark:shadow-[0_30px_100px_-15px_rgba(0,0,0,0.8)]

            backdrop-blur-2xl

            animate-in
            fade-in
            zoom-in-[0.97]
            slide-in-from-bottom-4
            duration-500
          "
        >
          {/* ========================================================= */}
          {/* BACKGROUND DECORATIF                                     */}
          {/* ========================================================= */}

          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div
              className="
                absolute
                -right-32
                -top-32
                h-72
                w-72
                rounded-full
                bg-violet-500/15
                blur-3xl
                dark:bg-violet-500/20
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
                bg-blue-500/10
                blur-3xl
                dark:bg-blue-500/15
                animate-pulse
              "
              style={{ animationDelay: '1s' }}
            />

            <div
              className="
                absolute
                right-0
                top-1/2
                h-48
                w-48
                translate-x-1/2
                rounded-full
                bg-fuchsia-500/5
                blur-3xl
                dark:bg-fuchsia-500/10
                animate-pulse
              "
              style={{ animationDelay: '2s' }}
            />

            <div
              className="
                absolute
                left-1/2
                top-0
                h-px
                w-2/3
                -translate-x-1/2
                bg-gradient-to-r
                from-transparent
                via-violet-500/60
                to-transparent
              "
            />
          </div>

          {/* ========================================================= */}
          {/* HEADER FIXE                                               */}
          {/* ========================================================= */}

          <DialogHeader
            className="
              relative
              z-20
              shrink-0

              border-b
              border-black/[0.05]
              dark:border-white/[0.06]

              bg-white/80
              px-5
              pb-5
              pt-6

              backdrop-blur-xl

              sm:px-7
              sm:pt-7
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  relative
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl

                  bg-gradient-to-br
                  from-blue-500
                  via-violet-500
                  to-fuchsia-500

                  text-white
                  shadow-lg
                  shadow-violet-500/25

                  transition-transform
                  duration-500

                  group-hover/dialog:scale-105

                  dark:shadow-violet-500/20
                "
              >
                <div
                  className="
                    absolute
                    inset-0
                    bg-white/20
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover/dialog:opacity-100
                  "
                />

                {editing ? (
                  <User className="relative z-10 h-6 w-6" />
                ) : (
                  <Sparkles className="relative z-10 h-6 w-6 animate-pulse" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <DialogTitle
                  className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-2xl
                  "
                >
                  {editing ? 'Modifier' : 'Nouveau'}

                  <span
                    className="
                      ml-2
                      bg-gradient-to-r
                      from-blue-500
                      via-violet-500
                      to-fuchsia-500
                      bg-clip-text
                      text-transparent
                    "
                  >
                    client
                  </span>
                </DialogTitle>

                <DialogDescription
                  className="
                    mt-1
                    max-w-lg
                    text-sm
                    leading-relaxed
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {editing
                    ? 'Mettez à jour les informations et coordonnées de votre client.'
                    : 'Créez une fiche client complète avec ses coordonnées et adresses.'}
                </DialogDescription>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-75
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-500
                  "
                />
              </span>

              <span
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Informations client
              </span>
            </div>
          </DialogHeader>

          {/* ========================================================= */}
          {/* FORM                                                      */}
          {/* ========================================================= */}

          <form
            onSubmit={onSubmit}
            className="
              relative
              z-10

              flex
              min-h-0
              flex-1
              flex-col

              overflow-hidden
            "
          >
            {/* ======================================================= */}
            {/* ZONE SCROLLABLE                                         */}
            {/* ======================================================= */}

            <div
              className="
                relative
                min-h-0
                flex-1

                overflow-y-auto
                overflow-x-hidden

                overscroll-contain

                px-5
                py-6

                sm:px-7

                scroll-smooth

                [scrollbar-width:thin]
                [scrollbar-color:rgba(139,92,246,0.55)_transparent]

                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-violet-500/30
                [&::-webkit-scrollbar-thumb:hover]:bg-violet-500/60
              "
            >
              {/* ===================================================== */}
              {/* INDICATEUR DE SCROLL HAUT                              */}
              {/* ===================================================== */}

              <div
                className="
                  pointer-events-none
                  sticky
                  top-0
                  z-30
                  -mb-8
                  h-8
                  bg-gradient-to-b
                  from-white/90
                  to-transparent
                  dark:from-[#08090f]/90
                "
              />

              <div className="space-y-7">
                {/* =================================================== */}
                {/* PHOTO                                                 */}
                {/* =================================================== */}

                <section
                  className="
                    animate-in
                    fade-in
                    slide-in-from-bottom-3
                    duration-500
                  "
                >
                  <div className="flex flex-col items-center">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onPhotoSelect}
                      className="hidden"
                    />

                    <div className="relative">
                      <div
                        className="
                          absolute
                          -inset-2
                          rounded-full
                          bg-gradient-to-r
                          from-blue-500/20
                          via-violet-500/30
                          to-fuchsia-500/20
                          blur-md
                          opacity-70
                          transition-all
                          duration-700
                          group-hover/dialog:scale-110
                        "
                      />

                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="
                          group/avatar
                          relative
                          h-28
                          w-28
                          overflow-hidden
                          rounded-full

                          border-[3px]
                          border-white

                          bg-gradient-to-br
                          from-slate-100
                          via-violet-50
                          to-blue-100

                          shadow-xl
                          shadow-violet-500/15

                          outline-none
                          ring-1
                          ring-violet-500/20

                          transition-all
                          duration-500

                          hover:scale-105
                          hover:ring-4
                          hover:ring-violet-500/20

                          active:scale-95

                          dark:border-slate-900
                          dark:from-slate-800
                          dark:via-violet-950/50
                          dark:to-blue-950/50
                        "
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Aperçu du client"
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              group-hover/avatar:scale-110
                            "
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Camera
                              className="
                                h-9
                                w-9
                                text-violet-400
                                transition-all
                                duration-500
                                group-hover/avatar:scale-110
                                group-hover/avatar:rotate-6
                              "
                            />
                          </div>
                        )}

                        <div
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-black/50
                            opacity-0
                            backdrop-blur-[2px]
                            transition-all
                            duration-300
                            group-hover/avatar:opacity-100
                          "
                        >
                          <Camera className="h-7 w-7 text-white" />
                        </div>
                      </button>

                      <div
                        className="
                          absolute
                          bottom-0
                          right-0
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border-[3px]
                          border-white
                          bg-gradient-to-br
                          from-blue-500
                          to-violet-600
                          text-white
                          shadow-lg
                          dark:border-slate-900
                        "
                      >
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Photo du client
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        JPG, PNG ou WEBP • Optionnel
                      </p>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={onRemovePhoto}
                          className="
                            mt-2
                            inline-flex
                            items-center
                            gap-1
                            text-xs
                            font-medium
                            text-red-500
                            transition-all
                            duration-200
                            hover:text-red-600
                            hover:underline
                          "
                        >
                          <X className="h-3 w-3" />
                          Retirer la photo
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* =================================================== */}
                {/* NOM                                                   */}
                {/* =================================================== */}

                <section
                  className="
                    rounded-3xl
                    border
                    border-slate-200/80
                    bg-white/60
                    p-4
                    shadow-sm

                    transition-all
                    duration-300

                    hover:border-violet-200
                    hover:shadow-lg
                    hover:shadow-violet-500/5

                    dark:border-white/[0.07]
                    dark:bg-white/[0.025]
                    dark:shadow-none
                    dark:hover:border-violet-500/20

                    animate-in
                    fade-in
                    slide-in-from-bottom-3
                    duration-500
                  "
                  style={{ animationDelay: '80ms' }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-500/10
                        text-blue-500
                      "
                    >
                      <User className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Identité
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        Informations principales
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="client-name"
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Nom complet
                    </Label>

                    <Input
                      id="client-name"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nom: e.target.value,
                        })
                      }
                      placeholder="Ex. Jean Dupont"
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-slate-200
                        bg-white/80
                        px-4
                        text-sm
                        font-medium
                        shadow-sm
                        transition-all
                        duration-300

                        placeholder:text-slate-400

                        focus:border-violet-500
                        focus:ring-4
                        focus:ring-violet-500/10
                        focus:shadow-lg

                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:text-white
                        dark:placeholder:text-slate-600
                      "
                    />
                  </div>
                </section>

                {/* =================================================== */}
                {/* TELEPHONES                                            */}
                {/* =================================================== */}

                <section
                  className="
                    rounded-3xl
                    border
                    border-slate-200/80
                    bg-white/60
                    p-4
                    shadow-sm

                    transition-all
                    duration-300

                    hover:border-emerald-200
                    hover:shadow-lg
                    hover:shadow-emerald-500/5

                    dark:border-white/[0.07]
                    dark:bg-white/[0.025]
                    dark:shadow-none
                    dark:hover:border-emerald-500/20

                    animate-in
                    fade-in
                    slide-in-from-bottom-3
                    duration-500
                  "
                  style={{ animationDelay: '140ms' }}
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
                          bg-emerald-500/10
                          text-emerald-500
                        "
                      >
                        <Phone className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Téléphones
                        </h3>

                        <p className="text-[11px] text-slate-400">
                          {formData.phones.length}{' '}
                          {formData.phones.length > 1
                            ? 'numéros enregistrés'
                            : 'numéro enregistré'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addPhone}
                      className="
                        group/add
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        bg-gradient-to-br
                        from-emerald-500
                        to-green-600

                        text-white
                        shadow-lg
                        shadow-emerald-500/20

                        transition-all
                        duration-300

                        hover:scale-110
                        hover:shadow-xl

                        active:scale-95
                      "
                    >
                      <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.phones.map((phone, index) => (
                      <div
                        key={index}
                        className="
                          group/phone
                          flex
                          items-center
                          gap-2
                          animate-in
                          fade-in
                          slide-in-from-right-3
                          duration-300
                        "
                      >
                        <div className="relative min-w-0 flex-1">
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phones: prev.phones.map((p, i) =>
                                  i === index
                                    ? e.target.value
                                    : p
                                ),
                              }))
                            }
                            placeholder={
                              index === 0
                                ? 'Téléphone principal'
                                : `Téléphone ${index + 1}`
                            }
                            required={index === 0}
                            className={`
                              h-11
                              rounded-xl
                              bg-white/70
                              pr-24
                              text-sm
                              transition-all
                              duration-300

                              border-slate-200
                              focus:border-emerald-500
                              focus:ring-4
                              focus:ring-emerald-500/10

                              dark:border-white/[0.08]
                              dark:bg-white/[0.03]
                              dark:text-white

                              ${
                                index === 0
                                  ? 'border-emerald-300/60 dark:border-emerald-500/20'
                                  : ''
                              }
                            `}
                          />

                          {index === 0 ? (
                            <span
                              className="
                                absolute
                                right-2.5
                                top-1/2
                                flex
                                -translate-y-1/2
                                items-center
                                gap-1
                                rounded-full
                                border
                                border-emerald-200
                                bg-emerald-50
                                px-2
                                py-1
                                text-[10px]
                                font-bold
                                text-emerald-600

                                dark:border-emerald-500/20
                                dark:bg-emerald-500/10
                                dark:text-emerald-400
                              "
                            >
                              <Check className="h-3 w-3" />
                              Principal
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => {
                                  const arr = [...prev.phones];
                                  const [item] = arr.splice(index, 1);

                                  arr.unshift(item);

                                  return {
                                    ...prev,
                                    phones: arr,
                                  };
                                })
                              }
                              className="
                                absolute
                                right-2
                                top-1/2
                                flex
                                -translate-y-1/2
                                items-center
                                gap-1
                                rounded-full
                                border
                                border-emerald-200/70
                                bg-emerald-50
                                px-2
                                py-1
                                text-[10px]
                                font-bold
                                text-emerald-600

                                opacity-0
                                transition-all
                                duration-200
                                group-hover/phone:opacity-100

                                hover:scale-105
                                hover:bg-emerald-100

                                dark:border-emerald-500/20
                                dark:bg-emerald-500/10
                                dark:text-emerald-400
                              "
                            >
                              <Star className="h-3 w-3" />
                              Principal
                            </button>
                          )}
                        </div>

                        {index !== 0 && (
                          <button
                            type="button"
                            title="Supprimer ce numéro"
                            onClick={() =>
                              setPendingDelete({
                                type: 'phone',
                                index,
                              })
                            }
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl

                              border
                              border-red-200/70
                              bg-red-50
                              text-red-500

                              transition-all
                              duration-300

                              hover:scale-105
                              hover:border-red-300
                              hover:bg-red-100

                              active:scale-95

                              dark:border-red-500/10
                              dark:bg-red-500/5
                              dark:text-red-400
                            "
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* =================================================== */}
                {/* ADRESSES                                              */}
                {/* =================================================== */}

                <section
                  className="
                    rounded-3xl
                    border
                    border-slate-200/80
                    bg-white/60
                    p-4
                    shadow-sm

                    transition-all
                    duration-300

                    hover:border-blue-200
                    hover:shadow-lg
                    hover:shadow-blue-500/5

                    dark:border-white/[0.07]
                    dark:bg-white/[0.025]
                    dark:shadow-none
                    dark:hover:border-blue-500/20

                    animate-in
                    fade-in
                    slide-in-from-bottom-3
                    duration-500
                  "
                  style={{ animationDelay: '200ms' }}
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
                          bg-blue-500/10
                          text-blue-500
                        "
                      >
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Adresses
                        </h3>

                        <p className="text-[11px] text-slate-400">
                          Adresse et ville
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addAddress}
                      className="
                        group/add
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600

                        text-white
                        shadow-lg
                        shadow-blue-500/20

                        transition-all
                        duration-300

                        hover:scale-110
                        hover:shadow-xl

                        active:scale-95
                      "
                    >
                      <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.addresses.map((addr, index) => {
                      const villeVal =
                        formData.villes[index] || '';

                      const isCustomVille =
                        villeVal &&
                        !availableVilles.some(
                          (v) =>
                            v.toLowerCase() ===
                            villeVal.toLowerCase()
                        );

                      return (
                        <div
                          key={index}
                          className="
                            group/address
                            relative
                            space-y-3

                            rounded-2xl
                            border
                            border-blue-100/80

                            bg-gradient-to-br
                            from-blue-50/70
                            via-white/50
                            to-indigo-50/40

                            p-3

                            transition-all
                            duration-300

                            hover:-translate-y-0.5
                            hover:border-blue-200
                            hover:shadow-lg

                            dark:border-blue-500/10
                            dark:from-blue-500/[0.04]
                            dark:via-white/[0.02]
                            dark:to-indigo-500/[0.04]

                            animate-in
                            fade-in
                            slide-in-from-bottom-3
                            duration-300
                          "
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="
                                  flex
                                  h-6
                                  min-w-6
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-blue-500/10
                                  px-1.5
                                  text-[10px]
                                  font-black
                                  text-blue-600
                                  dark:text-blue-400
                                "
                              >
                                {index + 1}
                              </span>

                              <span
                                className="
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  tracking-wider
                                  text-slate-400
                                "
                              >
                                Adresse {index + 1}
                              </span>
                            </div>

                            {index === 0 && (
                              <span
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  border
                                  border-emerald-200
                                  bg-emerald-50
                                  px-2
                                  py-1
                                  text-[10px]
                                  font-bold
                                  text-emerald-600

                                  dark:border-emerald-500/20
                                  dark:bg-emerald-500/10
                                  dark:text-emerald-400
                                "
                              >
                                <Check className="h-3 w-3" />
                                Principale
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative min-w-0 flex-1">
                              <Input
                                value={addr}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    addresses:
                                      prev.addresses.map(
                                        (a, i) =>
                                          i === index
                                            ? e.target.value
                                            : a
                                      ),
                                  }))
                                }
                                placeholder={
                                  index === 0
                                    ? 'Adresse principale'
                                    : `Adresse ${index + 1}`
                                }
                                required={index === 0}
                                className="
                                  h-11
                                  rounded-xl
                                  border-slate-200
                                  bg-white/80
                                  pr-28
                                  text-sm

                                  transition-all
                                  duration-300

                                  focus:border-blue-500
                                  focus:ring-4
                                  focus:ring-blue-500/10

                                  dark:border-white/[0.08]
                                  dark:bg-white/[0.035]
                                  dark:text-white
                                "
                              />

                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    makeAddressPrimary(index)
                                  }
                                  className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    -translate-y-1/2
                                    items-center
                                    gap-1
                                    rounded-full
                                    border
                                    border-emerald-200/70
                                    bg-emerald-50
                                    px-2
                                    py-1
                                    text-[10px]
                                    font-bold
                                    text-emerald-600

                                    opacity-0
                                    transition-all
                                    duration-200
                                    group-hover/address:opacity-100

                                    hover:scale-105

                                    dark:border-emerald-500/20
                                    dark:bg-emerald-500/10
                                    dark:text-emerald-400
                                  "
                                >
                                  <Star className="h-3 w-3" />
                                  Principale
                                </button>
                              )}
                            </div>

                            {index !== 0 && (
                              <button
                                type="button"
                                title="Supprimer cette adresse"
                                onClick={() =>
                                  setPendingDelete({
                                    type: 'address',
                                    index,
                                  })
                                }
                                className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl

                                  border
                                  border-red-200/70
                                  bg-red-50
                                  text-red-500

                                  transition-all
                                  duration-300

                                  hover:scale-105
                                  hover:bg-red-100

                                  active:scale-95

                                  dark:border-red-500/10
                                  dark:bg-red-500/5
                                  dark:text-red-400
                                "
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="relative">
                              <select
                                value={
                                  isCustomVille
                                    ? '__custom__'
                                    : villeVal
                                }
                                onChange={(e) => {
                                  const val = e.target.value;

                                  setFormData((prev) => {
                                    const villesArr = [
                                      ...(prev.villes || []),
                                    ];

                                    while (
                                      villesArr.length <= index
                                    ) {
                                      villesArr.push('');
                                    }

                                    villesArr[index] =
                                      val === '__custom__'
                                        ? ''
                                        : val;

                                    return {
                                      ...prev,
                                      villes: villesArr,
                                    };
                                  });
                                }}
                                className="
                                  h-11
                                  w-full
                                  appearance-none
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white/80
                                  px-3
                                  text-sm
                                  font-medium
                                  text-slate-700
                                  outline-none

                                  transition-all
                                  duration-300

                                  focus:border-blue-500
                                  focus:ring-4
                                  focus:ring-blue-500/10

                                  dark:border-white/[0.08]
                                  dark:bg-white/[0.035]
                                  dark:text-slate-200
                                "
                              >
                                <option value="">
                                  — Sélectionner une ville —
                                </option>

                                {availableVilles.map((v) => (
                                  <option
                                    key={v}
                                    value={v}
                                  >
                                    {v}
                                  </option>
                                ))}

                                <option value="__custom__">
                                  + Nouvelle ville
                                </option>
                              </select>

                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  right-3
                                  top-1/2
                                  -translate-y-1/2
                                  text-slate-400
                                "
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </div>
                            </div>

                            {(isCustomVille || !villeVal) && (
                              <Input
                                value={
                                  isCustomVille
                                    ? villeVal
                                    : ''
                                }
                                onChange={(e) =>
                                  setFormData((prev) => {
                                    const villesArr = [
                                      ...(prev.villes || []),
                                    ];

                                    while (
                                      villesArr.length <= index
                                    ) {
                                      villesArr.push('');
                                    }

                                    villesArr[index] =
                                      e.target.value;

                                    return {
                                      ...prev,
                                      villes: villesArr,
                                    };
                                  })
                                }
                                placeholder="Nom de la ville"
                                className="
                                  h-11
                                  rounded-xl
                                  border-slate-200
                                  bg-white/80
                                  text-sm

                                  transition-all
                                  duration-300

                                  focus:border-blue-500
                                  focus:ring-4
                                  focus:ring-blue-500/10

                                  dark:border-white/[0.08]
                                  dark:bg-white/[0.035]
                                  dark:text-white
                                "
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {formData.addresses.length === 0 && (
                    <button
                      type="button"
                      onClick={addAddress}
                      className="
                        flex
                        w-full
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-dashed
                        border-blue-200
                        bg-blue-50/30
                        py-8
                        text-center

                        transition-all
                        duration-300

                        hover:border-blue-400
                        hover:bg-blue-50
                        hover:shadow-lg

                        dark:border-blue-500/20
                        dark:bg-blue-500/[0.03]
                        dark:hover:bg-blue-500/[0.06]
                      "
                    >
                      <MapPin className="mb-2 h-6 w-6 text-blue-400" />

                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Ajouter une adresse
                      </span>

                      <span className="mt-1 text-xs text-slate-400">
                        Cliquez pour commencer
                      </span>
                    </button>
                  )}
                </section>

                {/* =================================================== */}
                {/* MESSAGE FINAL                                        */}
                {/* =================================================== */}

                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl

                    border
                    border-violet-200/50

                    bg-gradient-to-r
                    from-violet-50/70
                    via-blue-50/40
                    to-fuchsia-50/40

                    p-4

                    dark:border-violet-500/10
                    dark:from-violet-500/[0.05]
                    dark:via-blue-500/[0.03]
                    dark:to-fuchsia-500/[0.03]

                    animate-in
                    fade-in
                    duration-500
                  "
                >
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-500/10
                      text-violet-500
                    "
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Fiche client intelligente
                    </p>

                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                      Le premier téléphone et la première adresse
                      seront automatiquement considérés comme
                      principaux.
                    </p>
                  </div>
                </div>

                {/* ESPACE EN BAS POUR LE SCROLL */}
                <div className="h-2" />
              </div>

              {/* ======================================================= */}
              {/* INDICATEUR DE SCROLL BAS                                */}
              {/* ======================================================= */}

              <div
                className="
                  pointer-events-none
                  sticky
                  bottom-0
                  z-30
                  -mt-8
                  h-8
                  bg-gradient-to-t
                  from-white/90
                  to-transparent
                  dark:from-[#08090f]/90
                "
              />
            </div>

            {/* ======================================================= */}
            {/* FOOTER TOUJOURS VISIBLE                                 */}
            {/* ======================================================= */}

            <DialogFooter
              className="
                relative
                z-40
                shrink-0

                flex
                flex-col-reverse
                gap-2

                border-t
                border-black/[0.05]

                bg-white/90

                px-5
                py-4

                shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.25)]

                backdrop-blur-xl

                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-7

                dark:border-white/[0.06]
                dark:bg-[#08090f]/90
                dark:shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.8)]
              "
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="
                  h-11
                  w-full
                  rounded-xl

                  border-slate-200
                  bg-white

                  px-5

                  text-sm
                  font-semibold
                  text-slate-600

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:shadow-md

                  active:scale-[0.98]

                  sm:w-auto

                  dark:border-white/[0.08]
                  dark:bg-white/[0.03]
                  dark:text-slate-300
                  dark:hover:bg-white/[0.06]
                "
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="
                  group/save
                  relative

                  h-11
                  w-full

                  overflow-hidden
                  rounded-xl
                  border-0

                  bg-gradient-to-r
                  from-blue-600
                  via-violet-600
                  to-fuchsia-600

                  px-6

                  text-sm
                  font-bold
                  text-white

                  shadow-lg
                  shadow-violet-500/20

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-violet-500/30

                  active:translate-y-0
                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:w-auto
                "
              >
                <span
                  className="
                    absolute
                    inset-0
                    -translate-x-full

                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent

                    transition-transform
                    duration-700

                    group-hover/save:translate-x-full
                  "
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 transition-transform duration-300 group-hover/save:scale-110" />

                      {editing
                        ? 'Enregistrer les modifications'
                        : 'Créer le client'}
                    </>
                  )}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =============================================================== */}
      {/* CONFIRMATION SUPPRESSION                                        */}
      {/* =============================================================== */}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md

            rounded-[2rem]

            border
            border-red-200/60

            bg-white/95

            p-6

            shadow-[0_30px_80px_-20px_rgba(239,68,68,0.25)]

            backdrop-blur-2xl

            animate-in
            fade-in
            zoom-in-95
            duration-300

            dark:border-red-500/10
            dark:bg-[#0b0b12]/95
            dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]
          "
        >
          <AlertDialogHeader>
            <div
              className="
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-red-500/10
                text-red-500
                dark:text-red-400
              "
            >
              <Trash2 className="h-5 w-5" />
            </div>

            <AlertDialogTitle
              className="
                text-xl
                font-black
                tracking-tight
                text-slate-900
                dark:text-white
              "
            >
              Confirmer la suppression
            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                mt-2
                text-sm
                leading-relaxed
                text-slate-500
                dark:text-slate-400
              "
            >
              {pendingDelete?.type === 'phone'
                ? 'Ce numéro de téléphone sera supprimé de ce client après enregistrement. Cette action ne pourra pas être annulée.'
                : 'Cette adresse ainsi que sa ville seront supprimées de ce client après enregistrement. Cette action ne pourra pas être annulée.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel
              className="
                h-11
                rounded-xl
                border-slate-200
                bg-white
                px-5
                font-semibold

                transition-all
                duration-300

                hover:bg-slate-50
                hover:shadow-md

                dark:border-white/[0.08]
                dark:bg-white/[0.03]
                dark:text-slate-300
                dark:hover:bg-white/[0.06]
              "
            >
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              className="
                h-11
                rounded-xl
                border-0

                bg-gradient-to-r
                from-red-500
                to-rose-600

                px-5

                font-bold
                text-white

                shadow-lg
                shadow-red-500/20

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:from-red-600
                hover:to-rose-700
                hover:shadow-xl

                active:scale-95
              "
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientFormDialog;