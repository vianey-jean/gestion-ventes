
/**
 * AddProductModal.tsx — Modale d'ajout d'un nouveau produit.
 *
 * UI modernisée inspirée de ClientMergeModal.
 * La logique métier et les props existantes sont conservées.
 *
 * Améliorations :
 * - Fond moins transparent
 * - Zone centrale entièrement scrollable
 * - Footer toujours visible
 * - Espace supplémentaire sous les boutons
 * - Scrollbar verticale plus confortable
 * - Aucun changement de logique métier
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import {
  Package,
  Star,
  Hash,
  Sparkles,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import PhotoUploadSection from '@/components/dashboard/PhotoUploadSection';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';

import ProductClassificationSelector, {
  ClassificationValue,
  buildProductName,
} from '@/components/products/attributes/ProductClassificationSelector';

export interface AddProductForm {
  description: string;
  purchasePrice: string;
  quantity: string;
  fournisseur: string;
  dateAchat: string;
}

interface AddPhotosState {
  files: File[];
  existingUrls: string[];
  mainIndex: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;

  addForm: AddProductForm;
  setAddForm: React.Dispatch<React.SetStateAction<AddProductForm>>;

  addErrors: Record<string, string>;
  setAddErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;

  addPhotos: AddPhotosState;
  setAddPhotos: React.Dispatch<React.SetStateAction<AddPhotosState>>;

  addClassification: ClassificationValue;
  setAddClassification: React.Dispatch<
    React.SetStateAction<ClassificationValue>
  >;

  isSubmitting: boolean;
  onSubmit: () => void;
}

const AddProductModal: React.FC<Props> = ({
  open,
  onOpenChange,

  addForm,
  setAddForm,

  addErrors,
  setAddErrors,

  addPhotos,
  setAddPhotos,

  addClassification,
  setAddClassification,

  isSubmitting,
  onSubmit,
}) => {
  /**
   * ===============================================================
   * UPDATE FIELD
   * ===============================================================
   */

  const updateField = (
    field: keyof AddProductForm,
    value: string
  ) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (addErrors[field]) {
      setAddErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * ===============================================================
   * CLASSIFICATION
   * ===============================================================
   */

  const handleClassificationChange = (
    value: ClassificationValue
  ) => {
    setAddClassification(value);

    const name = buildProductName(value);

    if (name) {
      setAddForm((prev) => ({
        ...prev,
        description: name,
      }));

      if (addErrors.description) {
        setAddErrors((prev) => ({
          ...prev,
          description: '',
        }));
      }
    }
  };

  /**
   * ===============================================================
   * CANCEL
   * ===============================================================
   */

  const handleCancel = () => {
    onOpenChange(false);

    setAddPhotos({
      files: [],
      existingUrls: [],
      mainIndex: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          group
          flex
          h-[94vh]
          max-h-[94vh]
          w-[calc(100%-1rem)]
          max-w-3xl
          flex-col
          gap-0
          overflow-hidden
          overflow-x-hidden
          p-0
          rounded-[28px]
          sm:rounded-[32px]
          border
          border-white/10
          bg-slate-950
          text-white
          shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]
          animate-in
          fade-in-0
          zoom-in-95
          duration-500
        "
      >
        {/* =========================================================
            AMBIENT BACKGROUND
        ========================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            overflow-hidden
            rounded-[28px]
            sm:rounded-[32px]
          "
        >
          <div
            className="
              absolute
              -top-32
              -right-32
              h-72
              w-72
              rounded-full
              bg-green-500/10
              blur-3xl
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
              bg-emerald-500/10
              blur-3xl
              animate-pulse
            "
            style={{
              animationDelay: '700ms',
            }}
          />

          <div
            className="
              absolute
              top-1/3
              right-1/3
              h-40
              w-40
              rounded-full
              bg-lime-400/5
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_35%)]
            "
          />
        </div>

        {/* =========================================================
            HEADER
        ========================================================= */}

        <DialogHeader
          className="
            relative
            z-10
            shrink-0
            overflow-hidden
            border-b
            border-white/10
            bg-gradient-to-br
            from-green-950
            via-slate-950
            to-emerald-950
            px-5
            pt-6
            pb-5
            sm:px-7
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_40%)]
            "
          />

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
                from-green-500
                via-emerald-500
                to-green-700
                text-white
                shadow-[0_12px_30px_-8px_rgba(34,197,94,0.7)]
                ring-1
                ring-white/20
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:rotate-1
              "
            >
              <Package className="h-7 w-7" />

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
                  bg-slate-950
                  text-green-400
                  shadow-lg
                "
              >
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-white
                  sm:text-2xl
                "
              >
                Ajouter un produit
              </DialogTitle>

              <DialogDescription
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-slate-400
                "
              >
                Créez une nouvelle fiche produit avec ses
                informations, son fournisseur et ses photos.
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
                    border-emerald-500/20
                    bg-emerald-500/10
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    text-emerald-400
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Création sécurisée
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-green-500/20
                    bg-green-500/10
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    text-green-400
                  "
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Nouveau produit
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* =========================================================
            MAIN SCROLL AREA
        ========================================================= */}

        <div
          className="
            relative
            z-10
            min-h-0
            flex-1
            overflow-hidden
            bg-slate-950
          "
        >
          <div
            className="
              h-full
              min-h-0
              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              px-4
              py-5
              pb-12
              sm:px-7
              sm:py-6
              sm:pb-14

              scrollbar-thin
              scrollbar-thumb-green-700
              scrollbar-track-slate-900

              [scrollbar-width:thin]
              [-webkit-overflow-scrolling:touch]
            "
          >
            <div className="space-y-5 pb-8">

              {/* =====================================================
                  STEP 1 — CLASSIFICATION
              ===================================================== */}

              <section
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.055]
                  shadow-sm
                  transition-all
                  duration-500
                  hover:border-green-500/20
                  hover:bg-white/[0.07]
                  hover:shadow-[0_12px_35px_-20px_rgba(34,197,94,0.45)]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-white/10
                    bg-white/[0.04]
                    px-4
                    py-3.5
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
                        from-green-500
                        to-emerald-600
                        text-sm
                        font-black
                        text-white
                        shadow-lg
                        shadow-green-500/20
                      "
                    >
                      01
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Classification du produit
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        Sélectionnez les caractéristiques du produit
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>

                <div className="p-4">
                  <ProductClassificationSelector
                    value={addClassification}
                    onChange={handleClassificationChange}
                    variant="dark"
                  />
                </div>
              </section>

              {/* =====================================================
                  STEP 2 — DESCRIPTION
              ===================================================== */}

              <section
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.055]
                  p-4
                  shadow-sm
                  transition-all
                  duration-500
                  hover:border-green-500/20
                  hover:bg-white/[0.07]
                  hover:shadow-lg
                  hover:shadow-green-500/5
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
                      bg-green-500/10
                      text-green-400
                    "
                  >
                    <Package className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      02 · Description du produit
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      La description est générée automatiquement et reste éditable.
                    </p>
                  </div>
                </div>

                <Label
                  htmlFor="add-desc"
                  className="sr-only"
                >
                  Description du produit
                </Label>

                <Input
                  id="add-desc"
                  value={addForm.description}
                  onChange={(e) =>
                    updateField(
                      'description',
                      e.target.value
                    )
                  }
                  placeholder="Entrez une description premium..."
                  className="
                    h-11
                    rounded-xl
                    border-white/10
                    bg-white/[0.06]
                    text-white
                    shadow-inner
                    transition-all
                    duration-300
                    placeholder:text-slate-600
                    hover:bg-white/[0.08]
                    focus:border-green-500/50
                    focus:bg-white/[0.09]
                    focus:ring-4
                    focus:ring-green-500/10
                  "
                />

                {addErrors.description && (
                  <p
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-medium
                      text-red-400
                    "
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {addErrors.description}
                  </p>
                )}
              </section>

              {/* =====================================================
                  STEP 3 + 4 — PRICE + QUANTITY
              ===================================================== */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* PRICE */}

                <section
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.055]
                    p-4
                    shadow-sm
                    transition-all
                    duration-500
                    hover:border-yellow-500/20
                    hover:bg-white/[0.07]
                    hover:shadow-lg
                    hover:shadow-yellow-500/5
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
                        bg-yellow-500/10
                        text-yellow-400
                      "
                    >
                      <Star className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        03 · Prix
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        Prix d'achat
                      </p>
                    </div>
                  </div>

                  <Label
                    htmlFor="add-price"
                    className="sr-only"
                  >
                    Prix
                  </Label>

                  <div className="relative">
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      value={addForm.purchasePrice}
                      onChange={(e) =>
                        updateField(
                          'purchasePrice',
                          e.target.value
                        )
                      }
                      placeholder="0,00"
                      className="
                        h-11
                        rounded-xl
                        border-white/10
                        bg-white/[0.06]
                        pr-12
                        text-white
                        shadow-inner
                        transition-all
                        duration-300
                        placeholder:text-slate-600
                        hover:bg-white/[0.08]
                        focus:border-yellow-500/50
                        focus:bg-white/[0.09]
                        focus:ring-4
                        focus:ring-yellow-500/10
                      "
                    />

                    <span
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-sm
                        font-bold
                        text-yellow-400
                      "
                    >
                      €
                    </span>
                  </div>

                  {addErrors.purchasePrice && (
                    <p
                      className="
                        mt-2
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        font-medium
                        text-red-400
                      "
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {addErrors.purchasePrice}
                    </p>
                  )}
                </section>

                {/* QUANTITY */}

                <section
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.055]
                    p-4
                    shadow-sm
                    transition-all
                    duration-500
                    hover:border-blue-500/20
                    hover:bg-white/[0.07]
                    hover:shadow-lg
                    hover:shadow-blue-500/5
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
                        bg-blue-500/10
                        text-blue-400
                      "
                    >
                      <Hash className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        04 · Stock
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        Quantité disponible
                      </p>
                    </div>
                  </div>

                  <Label
                    htmlFor="add-qty"
                    className="sr-only"
                  >
                    Quantité
                  </Label>

                  <Input
                    id="add-qty"
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) =>
                      updateField(
                        'quantity',
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className="
                      h-11
                      rounded-xl
                      border-white/10
                      bg-white/[0.06]
                      text-white
                      shadow-inner
                      transition-all
                      duration-300
                      placeholder:text-slate-600
                      hover:bg-white/[0.08]
                      focus:border-blue-500/50
                      focus:bg-white/[0.09]
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                  {addErrors.quantity && (
                    <p
                      className="
                        mt-2
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        font-medium
                        text-red-400
                      "
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {addErrors.quantity}
                    </p>
                  )}
                </section>
              </div>

              {/* =====================================================
                  STEP 5 — DATE + FOURNISSEUR
              ===================================================== */}

              <section
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.055]
                  p-4
                  shadow-sm
                  transition-all
                  duration-500
                  hover:border-fuchsia-500/20
                  hover:bg-white/[0.07]
                  hover:shadow-lg
                  hover:shadow-fuchsia-500/5
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
                      bg-fuchsia-500/10
                      text-fuchsia-400
                    "
                  >
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      05 · Achat & fournisseur
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Renseignez l'origine du produit et sa date d'achat.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  {/* DATE */}

                  <div>
                    <Label
                      htmlFor="add-date"
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        text-slate-300
                      "
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-fuchsia-400" />
                      Date d'achat
                    </Label>

                    <Input
                      id="add-date"
                      type="date"
                      value={addForm.dateAchat}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          dateAchat: e.target.value,
                        }))
                      }
                      className="
                        h-11
                        rounded-xl
                        border-white/10
                        bg-white/[0.06]
                        text-white
                        shadow-inner
                        transition-all
                        duration-300
                        hover:bg-white/[0.08]
                        focus:border-fuchsia-500/50
                        focus:bg-white/[0.09]
                        focus:ring-4
                        focus:ring-fuchsia-500/10
                        [color-scheme:dark]
                      "
                    />
                  </div>

                  {/* FOURNISSEUR */}

                  <div>
                    <FournisseurAutocomplete
                      value={addForm.fournisseur}
                      onChange={(val) =>
                        setAddForm((prev) => ({
                          ...prev,
                          fournisseur: val,
                        }))
                      }
                      variant="dark"
                    />
                  </div>
                </div>
              </section>

              {/* =====================================================
                  STEP 6 — PHOTOS
              ===================================================== */}

              <section
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.055]
                  shadow-sm
                  transition-all
                  duration-500
                  hover:border-pink-500/20
                  hover:bg-white/[0.07]
                  hover:shadow-lg
                  hover:shadow-pink-500/5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-white/10
                    bg-white/[0.04]
                    px-4
                    py-3.5
                  "
                />

                <div className="p-4">
                  <PhotoUploadSection
                    onPhotosChange={(
                      files,
                      existingUrls,
                      mainIndex
                    ) =>
                      setAddPhotos({
                        files,
                        existingUrls,
                        mainIndex,
                      })
                    }
                    maxPhotos={6}
                  />
                </div>
              </section>

              {/* =====================================================
                  PREVIEW
              ===================================================== */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-green-500/15
                  bg-gradient-to-br
                  from-green-500/15
                  via-white/[0.045]
                  to-emerald-500/15
                  p-4
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
                    bg-green-400/10
                    blur-2xl
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
                      from-green-500
                      to-emerald-600
                      text-white
                      shadow-lg
                      shadow-green-500/20
                    "
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-wider
                        text-green-400
                      "
                    >
                      Nouveau produit
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {addForm.description ||
                        'Produit sans description'}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-[11px]
                        text-slate-400
                      "
                    >
                      {addForm.purchasePrice
                        ? `${addForm.purchasePrice} €`
                        : 'Prix non défini'}
                      {' · '}
                      {addForm.quantity
                        ? `${addForm.quantity} en stock`
                        : 'Stock non défini'}
                    </p>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  ESPACE SUPPLÉMENTAIRE AVANT LE FOOTER
              ===================================================== */}

              <div className="h-8 sm:h-12" />
            </div>
          </div>
        </div>

        {/* =========================================================
            FOOTER
        ========================================================= */}

        <DialogFooter
          className="
            relative
            z-20
            shrink-0
            flex
            flex-col-reverse
            gap-2
            border-t
            border-white/10
            bg-slate-950
            px-4
            pt-4
            pb-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-7
            sm:pt-4
            sm:pb-6
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
                bg-emerald-500/10
                text-emerald-400
                sm:flex
              "
            >
              <ShieldCheck className="h-4 w-4" />
            </div>

            <p
              className="
                hidden
                text-[11px]
                leading-relaxed
                text-slate-500
                sm:block
              "
            >
              Vérifiez les informations avant
              <br />
              d'ajouter le produit au stock.
            </p>
          </div>

          {/* =======================================================
              BUTTONS
          ======================================================= */}

          <div
            className="
              flex
              w-full
              gap-2
              pb-1
              sm:w-auto
              sm:pb-0
            "
          >
            {/* ANNULER */}

            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="
                h-11
                flex-1
                rounded-xl
                border-white/10
                bg-white/[0.04]
                px-5
                font-semibold
                text-slate-300
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-red-500/30
                hover:bg-red-500/10
                hover:text-red-400
                sm:flex-none
              "
            >
              <XCircle className="mr-2 h-4 w-4" />
              Annuler
            </Button>

            {/* AJOUTER */}

            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="
                group/add
                relative
                h-11
                flex-1
                overflow-hidden
                rounded-xl
                border-0
                bg-gradient-to-r
                from-green-500
                via-emerald-500
                to-green-600
                px-5
                font-bold
                text-white
                shadow-[0_10px_30px_-10px_rgba(34,197,94,0.7)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:from-green-600
                hover:via-emerald-600
                hover:to-green-700
                hover:shadow-[0_15px_35px_-10px_rgba(34,197,94,0.8)]
                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:translate-y-0
                sm:flex-none
              "
            >
              {/* Shine */}

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
                  group-hover/add:translate-x-full
                "
              />

              <span className="relative flex items-center justify-center">
                <CheckCircle2
                  className={`
                    mr-2
                    h-4
                    w-4
                    ${
                      isSubmitting
                        ? 'animate-spin'
                        : 'transition-transform duration-300 group-hover/add:scale-110'
                    }
                  `}
                />

                {isSubmitting
                  ? 'Ajout en cours...'
                  : 'Ajouter au stock'}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
