/**
 * ProductMergeModal - Modale de fusion de plusieurs produits en un seul.
 *
 * Flux:
 *  1. L'utilisateur sélectionne 2 produits ou plus.
 *  2. Pour chaque champ (description, prix, quantité, fournisseur, photos), il
 *     choisit parmi les valeurs existantes ou saisit/upload de nouvelles.
 *     - La quantité par défaut = somme des quantités sélectionnées.
 *  3. À l'enregistrement, un nouveau produit est créé et tous les produits
 *     sources sont supprimés via POST /api/products/merge.
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Merge,
  Search,
  X,
  Star,
  ImageOff,
  Sparkles,
  Package,
  FileText,
  Euro,
  Boxes,
  Truck,
  Images,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react';
import ProductClassificationSelector, {
  ClassificationValue,
  splitValues,
} from '@/components/products/attributes/ProductClassificationSelector';
import { Product } from '@/types';
import PremiumLoading from '@/components/ui/premium-loading';

interface ProductMergeModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onMerged: () => void;
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const getPhotoUrl = (url: string) => {
  if (!url) return '';
  if (
    url.startsWith('http') ||
    url.startsWith('blob') ||
    url.startsWith('data:')
  )
    return url;

  return `${BASE_URL}${url}`;
};

const ProductMergeModal: React.FC<ProductMergeModalProps> = ({
  open,
  onClose,
  products,
  onMerged,
}) => {
  const { toast } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [classification, setClassification] =
    useState<ClassificationValue>({});
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [keptPhotos, setKeptPhotos] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Affiche PremiumLoading le temps que les produits soient prêts. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    setReady(false);

    const t = setTimeout(() => setReady(true), 450);

    return () => clearTimeout(t);
  }, [open, products.length]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
      setClassification({});
      setDescription('');
      setPurchasePrice('');
      setQuantity('');
      setFournisseur('');
      setKeptPhotos([]);
      setNewFiles([]);
      setMainPhotoIndex(0);
    }
  }, [open]);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p.id)),
    [products, selectedIds]
  );

  // Pré-remplir avec valeurs du premier sélectionné + somme quantités
  useEffect(() => {
    if (selectedProducts.length > 0 && !description) {
      const first = selectedProducts[0];

      setDescription(first.description);
      setPurchasePrice(String(first.purchasePrice));
      setFournisseur(first.fournisseur || '');

      const sumQty = selectedProducts.reduce(
        (acc, p) => acc + (p.quantity || 0),
        0
      );

      setQuantity(String(sumQty));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length]);

  // Filtre par attributs (classification) — même logique que StockListModal
  const CATEGORY_MAP: Record<string, string> = {
    Perruque: 'perruque',
    Tissages: 'tissage',
    Extension: 'extension',
    Autres: 'autres',
  };

  const filteredProducts = useMemo(() => {
    const cat =
      CATEGORY_MAP[classification.categorie || ''] || '';

    const selModeles = splitValues(classification.modele);
    const selCouleurs = splitValues(classification.couleur);
    const selTailles = splitValues(classification.taille);
    const selDevants = splitValues(classification.devant);
    const selAutres = splitValues(classification.autres);

    const selExtras = Object.values(
      classification.extras || {}
    )
      .map((v) => splitValues(v as string))
      .filter((g) => g.length > 0);

    const has = (desc: string, needles: string[]) =>
      needles.length === 0 ||
      needles.some((n) => desc.includes(n.toLowerCase()));

    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const d = (p.description || '').toLowerCase();

      if (
        q &&
        !(
          d.includes(q) ||
          (p.code && p.code.toLowerCase().includes(q))
        )
      ) {
        return false;
      }

      if (cat) {
        if (cat === 'autres') {
          if (
            ['perruque', 'tissage', 'extension'].some((k) =>
              d.includes(k)
            )
          ) {
            return false;
          }
        } else if (!d.includes(cat)) {
          return false;
        }
      }

      if (cat === 'perruque' && !has(d, selDevants)) {
        return false;
      }

      if (!has(d, selModeles)) return false;
      if (!has(d, selCouleurs)) return false;
      if (!has(d, selTailles)) return false;
      if (!has(d, selAutres)) return false;

      for (const group of selExtras) {
        if (!has(d, group)) return false;
      }

      return true;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, classification]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const candidateDescriptions = useMemo(
    () =>
      Array.from(
        new Set(
          selectedProducts
            .map((p) => p.description)
            .filter(Boolean)
        )
      ),
    [selectedProducts]
  );

  const candidatePrices = useMemo(
    () =>
      Array.from(
        new Set(
          selectedProducts
            .map((p) => p.purchasePrice)
            .filter((v) => v !== undefined)
        )
      ),
    [selectedProducts]
  );

  const candidateFournisseurs = useMemo(
    () =>
      Array.from(
        new Set(
          selectedProducts
            .map((p) => p.fournisseur)
            .filter(Boolean) as string[]
        )
      ),
    [selectedProducts]
  );

  const candidatePhotos = useMemo(() => {
    const set = new Set<string>();

    selectedProducts.forEach((p) => {
      (p.photos || []).forEach((ph) => set.add(ph));

      if (p.mainPhoto) {
        set.add(p.mainPhoto);
      }
    });

    return Array.from(set);
  }, [selectedProducts]);

  const togglePhoto = (url: string) => {
    setKeptPhotos((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : [...prev, url]
    );
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    setNewFiles((prev) =>
      [...prev, ...files].slice(0, 6)
    );

    e.target.value = '';
  };

  const removeNewFile = (i: number) => {
    setNewFiles((prev) =>
      prev.filter((_, idx) => idx !== i)
    );
  };

  const allPhotoCount =
    keptPhotos.length + newFiles.length;

  const handleMerge = async () => {
    if (selectedIds.length < 2) {
      toast({
        title: 'Erreur',
        description:
          'Sélectionnez au moins 2 produits',
        variant: 'destructive',
      });

      return;
    }

    if (
      !description.trim() ||
      !purchasePrice ||
      Number(purchasePrice) <= 0 ||
      quantity === '' ||
      Number(quantity) < 0
    ) {
      toast({
        title: 'Erreur',
        description:
          'Description, prix et quantité requis',
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

      fd.append(
        'description',
        description.trim()
      );

      fd.append(
        'purchasePrice',
        String(Number(purchasePrice))
      );

      fd.append(
        'quantity',
        String(Number(quantity))
      );

      if (fournisseur.trim()) {
        fd.append(
          'fournisseur',
          fournisseur.trim()
        );
      }

      fd.append(
        'keptPhotos',
        JSON.stringify(keptPhotos)
      );

      fd.append(
        'mainPhotoIndex',
        String(
          Math.min(
            mainPhotoIndex,
            Math.max(0, allPhotoCount - 1)
          )
        )
      );

      newFiles.forEach((f) =>
        fd.append('photos', f)
      );

      await axios.post(
        `${BASE_URL}/api/products/merge`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      toast({
        title: 'Succès',
        description: `${selectedIds.length} produits fusionnés en 1`,
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
    group/modal
    flex
flex-col
    sm:max-w-2xl
    w-[calc(100%-1rem)]
    max-h-[95vh]
    overflow-hidden
    p-0
    gap-0
    rounded-[2rem]
    border
    border-white/60
    dark:border-white/[0.08]
    bg-white/95
    dark:bg-[#08050d]/95
    backdrop-blur-2xl
    shadow-[0_35px_120px_-30px_rgba(249,115,22,0.35)]
    dark:shadow-[0_35px_130px_-30px_rgba(168,85,247,0.35)]
  "
>
        {/* ========================================================= */}
        {/* LUXURY BACKGROUND                                          */}
        {/* ========================================================= */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <div
            className="
              absolute
              -right-32
              -top-32
              h-80
              w-80
              rounded-full
              bg-orange-500/[0.09]
              dark:bg-orange-500/[0.08]
              blur-3xl
              motion-safe:animate-pulse
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
              bg-red-500/[0.08]
              dark:bg-fuchsia-500/[0.08]
              blur-3xl
              motion-safe:animate-pulse
            "
            style={{
              animationDelay: '1.2s',
            }}
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-56
              w-56
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-amber-500/[0.035]
              blur-3xl
            "
          />

          {/* Subtle luxury grid */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.025]
              dark:opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />
        </div>

        {/* ========================================================= */}
        {/* HEADER                                                     */}
        {/* ========================================================= */}

        <DialogHeader
          className="
            relative
            shrink-0
            border-b
            border-slate-200/70
            bg-gradient-to-b
            from-white/90
            to-white/50
            px-6
            pb-5
            pt-7
            dark:border-white/[0.06]
            dark:from-white/[0.035]
            dark:to-transparent
          "
        >
          {/* Top luxury line */}
          <div
            className="
              absolute
              left-6
              right-6
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-orange-500/70
              to-transparent
            "
          />

          <div className="flex items-start gap-4">
            {/* Main icon */}
            <div
              className="
                relative
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-orange-500
                via-red-500
                to-rose-600
                text-white
                shadow-[0_12px_35px_-10px_rgba(239,68,68,0.7)]
                motion-safe:animate-in
                motion-safe:zoom-in-75
                duration-500
              "
            >
              <Merge className="h-5 w-5" />

              <span
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
                  border-2
                  border-white
                  bg-gradient-to-br
                  from-amber-300
                  to-orange-500
                  dark:border-[#08050d]
                "
              >
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  sm:text-2xl
                  bg-gradient-to-r
                  from-slate-900
                  via-orange-600
                  to-red-600
                  bg-clip-text
                  text-transparent
                  dark:from-white
                  dark:via-orange-300
                  dark:to-rose-300
                "
              >
                Fusionner des produits
              </DialogTitle>

              <DialogDescription
                className="
                  mt-1.5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Sélectionnez 2 produits ou plus à
                fusionner. Les produits sélectionnés
                seront remplacés par un seul nouveau
                produit.
              </DialogDescription>
            </div>

            {/* Premium status */}
            <div
              className="
                hidden
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-orange-200/70
                bg-orange-50/80
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-widest
                text-orange-600
                dark:flex
                dark:border-orange-500/20
                dark:bg-orange-500/[0.08]
                dark:text-orange-300
              "
            >
              <Sparkles className="h-3 w-3" />
              Premium
            </div>
          </div>
        </DialogHeader>

        {/* ========================================================= */}
        {/* LOADING                                                    */}
        {/* ========================================================= */}

        {!ready && (
          <div
            className="
              relative
              flex
              min-h-[420px]
              items-center
              justify-center
              px-6
            "
          >
            <div
              className="
                absolute
                h-48
                w-48
                rounded-full
                bg-orange-500/10
                blur-3xl
                motion-safe:animate-pulse
              "
            />

            <div
              className="
                relative
                rounded-3xl
                border
                border-orange-200/60
                bg-white/60
                p-8
                shadow-[0_20px_60px_-25px_rgba(249,115,22,0.4)]
                backdrop-blur-xl
                dark:border-orange-500/[0.12]
                dark:bg-white/[0.025]
              "
            >
              <PremiumLoading
                text="Chargement des produits…"
                size="lg"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CONTENT                                                    */}
        {/* ========================================================= */}

        <div
  className="
    relative
    min-h-0
    flex-1
    overflow-y-auto
    overscroll-contain
    px-4
    py-5
    sm:px-6
    scrollbar-thin
    scrollbar-track-transparent
    scrollbar-thumb-orange-300
    hover:scrollbar-thumb-orange-400
    dark:scrollbar-thumb-orange-900
    dark:hover:scrollbar-thumb-orange-700
  "
  hidden={!ready}
>
          <div className="space-y-6">
            {/* ===================================================== */}
            {/* 1. SELECTION                                          */}
            {/* ===================================================== */}

            <section
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200/80
                bg-white/65
                p-4
                shadow-[0_10px_35px_-25px_rgba(15,23,42,0.3)]
                backdrop-blur-xl
                transition-all
                duration-500
                hover:border-orange-200
                hover:shadow-[0_20px_45px_-25px_rgba(249,115,22,0.3)]
                dark:border-white/[0.07]
                dark:bg-white/[0.025]
                dark:hover:border-orange-500/20
                motion-safe:animate-in
                motion-safe:fade-in
                motion-safe:slide-in-from-bottom-3
                duration-500
              "
            >
              {/* Section glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-32
                  w-32
                  rounded-full
                  bg-orange-500/10
                  blur-3xl
                "
              />

              <div className="relative mb-3 flex items-center justify-between gap-3">
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
                      from-orange-100
                      to-red-100
                      text-orange-600
                      dark:from-orange-500/10
                      dark:to-red-500/10
                      dark:text-orange-400
                    "
                  >
                    <Package className="h-4 w-4" />
                  </div>

                  <div>
                    <Label
                      className="
                        block
                        text-sm
                        font-bold
                        text-slate-800
                        dark:text-slate-100
                      "
                    >
                      1. Produits à fusionner
                    </Label>

                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      {selectedIds.length} sélectionné
                      {selectedIds.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Selected counter */}
                <div
                  className={`
                    flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-xl
                    px-2.5
                    text-xs
                    font-bold
                    transition-all
                    duration-300
                    ${
                      selectedIds.length >= 2
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_8px_20px_-8px_rgba(239,68,68,0.7)]'
                        : 'bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400'
                    }
                  `}
                >
                  {selectedIds.length}
                </div>
              </div>

              {/* Search */}
              <div className="group/search relative mb-3">
                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                    transition-colors
                    duration-300
                    group-focus-within/search:text-orange-500
                  "
                />

                <Input
                  placeholder="Rechercher un produit ou un code..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    bg-white/80
                    pl-9
                    pr-4
                    text-sm
                    shadow-sm
                    transition-all
                    duration-300
                    placeholder:text-slate-400
                    hover:border-orange-200
                    focus:border-orange-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-orange-500/10
                    dark:border-white/[0.08]
                    dark:bg-white/[0.025]
                    dark:text-white
                    dark:hover:border-orange-400/20
                    dark:focus:border-orange-400
                    dark:focus:bg-white/[0.04]
                  "
                />
              </div>

              {/* Classification */}
              <div className="mb-3 space-y-2">
                <ProductClassificationSelector
                  value={classification}
                  onChange={setClassification}
                  mode="filter"
                  multiple
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-slate-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      text-slate-500
                      dark:bg-white/[0.05]
                      dark:text-slate-400
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {filteredProducts.length} produit(s)
                    après filtre attributs
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setClassification({})
                    }
                    className="
                      h-8
                      rounded-lg
                      border-slate-200
                      bg-white/70
                      px-3
                      text-[11px]
                      transition-all
                      duration-300
                      hover:scale-[1.02]
                      hover:border-orange-300
                      hover:text-orange-600
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:hover:border-orange-400/30
                      dark:hover:text-orange-300
                    "
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                </div>
              </div>

              {/* Products list */}
              <div
                className="
                  max-h-52
                  overflow-y-auto
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-slate-50/50
                  divide-y
                  divide-slate-200/70
                  dark:border-white/[0.07]
                  dark:bg-black/10
                  dark:divide-white/[0.05]
                "
              >
                {filteredProducts.length === 0 && (
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      p-8
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        dark:bg-white/[0.05]
                      "
                    >
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>

                    <span className="text-sm text-muted-foreground">
                      Aucun produit
                    </span>
                  </div>
                )}

                {filteredProducts.map((p, index) => {
                  const isSelected =
                    selectedIds.includes(p.id);

                  return (
                    <label
                      key={p.id}
                      className={`
                        group/product
                        relative
                        flex
                        cursor-pointer
                        items-center
                        gap-3
                        p-2.5
                        transition-all
                        duration-300
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-50/90 to-red-50/60 dark:from-orange-500/[0.08] dark:to-red-500/[0.04]'
                            : 'hover:bg-white/80 dark:hover:bg-white/[0.035]'
                        }
                        motion-safe:animate-in
                        motion-safe:fade-in
                        duration-300
                      `}
                      style={{
                        animationDelay: `${index * 25}ms`,
                      }}
                    >
                      {/* Selection glow */}
                      {isSelected && (
                        <div
                          className="
                            absolute
                            inset-y-0
                            left-0
                            w-0.5
                            bg-gradient-to-b
                            from-orange-400
                            to-red-500
                          "
                        />
                      )}

                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          toggleSelect(p.id)
                        }
                        className="
                          transition-transform
                          duration-300
                          group-hover/product:scale-110
                          data-[state=checked]:border-orange-500
                          data-[state=checked]:bg-orange-500
                        "
                      />

                      {/* Product image */}
                      <div
                        className={`
                          relative
                          h-11
                          w-11
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          border
                          bg-slate-100
                          shadow-sm
                          transition-all
                          duration-500
                          dark:bg-white/[0.04]
                          ${
                            isSelected
                              ? 'border-orange-300 shadow-[0_8px_20px_-10px_rgba(249,115,22,0.7)]'
                              : 'border-slate-200 dark:border-white/[0.08]'
                          }
                        `}
                      >
                        {p.mainPhoto ||
                        p.photos?.[0] ? (
                          <img
                            src={getPhotoUrl(
                              p.mainPhoto ||
                                p.photos![0]
                            )}
                            alt=""
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover/product:scale-110
                            "
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}

                        {isSelected && (
                          <div
                            className="
                              absolute
                              inset-0
                              flex
                              items-center
                              justify-center
                              bg-orange-500/20
                              backdrop-blur-[1px]
                            "
                          >
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-800
                            dark:text-slate-100
                          "
                        >
                          {p.description}
                        </div>

                        <div
                          className="
                            mt-0.5
                            flex
                            flex-wrap
                            items-center
                            gap-1.5
                            text-[10px]
                            text-muted-foreground
                          "
                        >
                          <span>{p.code}</span>
                          <span className="opacity-40">·</span>
                          <span>{p.purchasePrice}€</span>
                          <span className="opacity-40">·</span>
                          <span>Qté: {p.quantity}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <ArrowRight
                          className="
                            mr-1
                            h-4
                            w-4
                            text-orange-500
                            transition-transform
                            duration-300
                            group-hover/product:translate-x-1
                          "
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>

            {/* ===================================================== */}
            {/* SELECTED PRODUCT SUMMARY                              */}
            {/* ===================================================== */}

            {selectedIds.length >= 2 && (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-orange-200/60
                  bg-gradient-to-r
                  from-orange-50/80
                  via-amber-50/50
                  to-red-50/60
                  px-4
                  py-3
                  dark:border-orange-500/[0.15]
                  dark:from-orange-500/[0.07]
                  dark:via-amber-500/[0.035]
                  dark:to-red-500/[0.06]
                  motion-safe:animate-in
                  motion-safe:fade-in
                  motion-safe:slide-in-from-top-2
                  duration-500
                "
              >
                <div
                  className="
                    absolute
                    -right-8
                    -top-8
                    h-20
                    w-20
                    rounded-full
                    bg-orange-400/15
                    blur-2xl
                  "
                />

                <div className="relative flex items-center gap-3">
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
                      shadow-[0_8px_20px_-8px_rgba(239,68,68,0.7)]
                    "
                  >
                    <Merge className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-orange-700 dark:text-orange-300">
                      Prêt pour la fusion
                    </p>

                    <p className="text-[11px] text-orange-600/70 dark:text-orange-300/60">
                      {selectedIds.length} produits seront
                      réunis en un seul produit
                    </p>
                  </div>

                  <Sparkles className="h-4 w-4 text-orange-400 motion-safe:animate-pulse" />
                </div>
              </div>
            )}

            {selectedIds.length >= 2 && (
              <>
                {/* ================================================= */}
                {/* 2. DESCRIPTION                                    */}
                {/* ================================================= */}

                <section
                  className="
                    relative
                    space-y-3
                    motion-safe:animate-in
                    motion-safe:fade-in
                    motion-safe:slide-in-from-bottom-3
                    duration-500
                  "
                >
                  <SectionTitle
                    icon={<FileText className="h-4 w-4" />}
                    number="2"
                    title="Description"
                    color="violet"
                  />

                  <div className="flex flex-wrap gap-2">
                    {candidateDescriptions.map(
                      (d, index) => (
                        <Button
                          key={d}
                          type="button"
                          variant={
                            description === d
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() =>
                            setDescription(d)
                          }
                          className={`
                            rounded-xl
                            transition-all
                            duration-300
                            ${
                              description === d
                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,0.8)] hover:from-violet-600 hover:to-fuchsia-600'
                                : 'border-slate-200 bg-white/70 hover:scale-[1.02] hover:border-violet-300 hover:text-violet-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-violet-400/30 dark:hover:text-violet-300'
                            }
                          `}
                          style={{
                            animationDelay: `${index * 40}ms`,
                          }}
                        >
                          {description === d && (
                            <Check className="mr-1.5 h-3 w-3" />
                          )}
                          {d}
                        </Button>
                      )
                    )}
                  </div>

                  <Textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Ou saisir une nouvelle description"
                    rows={2}
                    className="
                      resize-none
                      rounded-2xl
                      border-slate-200
                      bg-white/70
                      shadow-sm
                      transition-all
                      duration-300
                      hover:border-violet-200
                      focus:border-violet-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-violet-500/10
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:text-white
                      dark:hover:border-violet-400/20
                      dark:focus:border-violet-400
                      dark:focus:bg-white/[0.04]
                    "
                  />
                </section>

                {/* ================================================= */}
                {/* 3 + 4. PRIX / QUANTITE                            */}
                {/* ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    motion-safe:animate-in
                    motion-safe:fade-in
                    motion-safe:slide-in-from-bottom-3
                    duration-500
                  "
                  style={{
                    animationDelay: '70ms',
                  }}
                >
                  {/* Prix */}
                  <section
                    className="
                      relative
                      overflow-hidden
                      space-y-3
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white/60
                      p-4
                      backdrop-blur-xl
                      transition-all
                      duration-500
                      hover:-translate-y-0.5
                      hover:border-emerald-200
                      hover:shadow-[0_15px_35px_-20px_rgba(16,185,129,0.4)]
                      dark:border-white/[0.07]
                      dark:bg-white/[0.025]
                      dark:hover:border-emerald-500/20
                    "
                  >
                    <div
                      className="
                        absolute
                        -right-8
                        -top-8
                        h-20
                        w-20
                        rounded-full
                        bg-emerald-500/10
                        blur-2xl
                      "
                    />

                    <SectionTitle
                      icon={<Euro className="h-4 w-4" />}
                      number="3"
                      title="Prix d'achat (€)"
                      color="emerald"
                    />

                    <div className="relative flex flex-wrap gap-1.5">
                      {candidatePrices.map((pr) => (
                        <Button
                          key={pr}
                          type="button"
                          variant={
                            Number(purchasePrice) ===
                            pr
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() =>
                            setPurchasePrice(
                              String(pr)
                            )
                          }
                          className={`
                            rounded-lg
                            text-xs
                            transition-all
                            duration-300
                            ${
                              Number(purchasePrice) ===
                              pr
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.7)]'
                                : 'border-slate-200 bg-white/70 hover:border-emerald-300 hover:text-emerald-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-emerald-400/30 dark:hover:text-emerald-300'
                            }
                          `}
                        >
                          {pr}€
                        </Button>
                      ))}
                    </div>

                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) =>
                        setPurchasePrice(
                          e.target.value
                        )
                      }
                      className="
                        h-11
                        rounded-xl
                        border-slate-200
                        bg-white/80
                        shadow-sm
                        transition-all
                        duration-300
                        hover:border-emerald-300
                        focus:border-emerald-500
                        focus:ring-4
                        focus:ring-emerald-500/10
                        dark:border-white/[0.08]
                        dark:bg-white/[0.025]
                        dark:text-white
                        dark:hover:border-emerald-400/20
                        dark:focus:border-emerald-400
                      "
                    />
                  </section>

                  {/* Quantité */}
                  <section
                    className="
                      relative
                      overflow-hidden
                      space-y-3
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white/60
                      p-4
                      backdrop-blur-xl
                      transition-all
                      duration-500
                      hover:-translate-y-0.5
                      hover:border-blue-200
                      hover:shadow-[0_15px_35px_-20px_rgba(59,130,246,0.4)]
                      dark:border-white/[0.07]
                      dark:bg-white/[0.025]
                      dark:hover:border-blue-500/20
                    "
                  >
                    <div
                      className="
                        absolute
                        -right-8
                        -top-8
                        h-20
                        w-20
                        rounded-full
                        bg-blue-500/10
                        blur-2xl
                      "
                    />

                    <SectionTitle
                      icon={<Boxes className="h-4 w-4" />}
                      number="4"
                      title="Quantité"
                      color="blue"
                    />

                    <Input
                      type="number"
                      min={0}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      className="
                        h-11
                        rounded-xl
                        border-slate-200
                        bg-white/80
                        shadow-sm
                        transition-all
                        duration-300
                        hover:border-blue-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                        dark:border-white/[0.08]
                        dark:bg-white/[0.025]
                        dark:text-white
                        dark:hover:border-blue-400/20
                        dark:focus:border-blue-400
                      "
                    />

                    <p
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      <Sparkles className="h-3 w-3 text-blue-400" />
                      Total calculé :{' '}
                      <span className="font-bold text-blue-500 dark:text-blue-400">
                        {selectedProducts.reduce(
                          (a, p) =>
                            a + (p.quantity || 0),
                          0
                        )}
                      </span>
                    </p>
                  </section>
                </div>

                {/* ================================================= */}
                {/* 5. FOURNISSEUR                                     */}
                {/* ================================================= */}

                <section
                  className="
                    relative
                    space-y-3
                    motion-safe:animate-in
                    motion-safe:fade-in
                    motion-safe:slide-in-from-bottom-3
                    duration-500
                  "
                  style={{
                    animationDelay: '120ms',
                  }}
                >
                  <SectionTitle
                    icon={<Truck className="h-4 w-4" />}
                    number="5"
                    title="Fournisseur"
                    color="amber"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={
                        fournisseur === ''
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setFournisseur('')
                      }
                      className={`
                        rounded-xl
                        transition-all
                        duration-300
                        ${
                          fournisseur === ''
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_8px_20px_-10px_rgba(245,158,11,0.8)]'
                            : 'border-slate-200 bg-white/70 hover:border-amber-300 hover:text-amber-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-amber-400/30 dark:hover:text-amber-300'
                        }
                      `}
                    >
                      Aucun
                    </Button>

                    {candidateFournisseurs.map(
                      (f) => (
                        <Button
                          key={f}
                          type="button"
                          variant={
                            fournisseur === f
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() =>
                            setFournisseur(f)
                          }
                          className={`
                            rounded-xl
                            transition-all
                            duration-300
                            ${
                              fournisseur === f
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_8px_20px_-10px_rgba(245,158,11,0.8)]'
                                : 'border-slate-200 bg-white/70 hover:border-amber-300 hover:text-amber-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-amber-400/30 dark:hover:text-amber-300'
                            }
                          `}
                        >
                          {fournisseur === f && (
                            <Check className="mr-1.5 h-3 w-3" />
                          )}
                          {f}
                        </Button>
                      )
                    )}
                  </div>

                  <Input
                    value={fournisseur}
                    onChange={(e) =>
                      setFournisseur(e.target.value)
                    }
                    placeholder="Ou saisir un nouveau fournisseur"
                    className="
                      h-11
                      rounded-xl
                      border-slate-200
                      bg-white/70
                      shadow-sm
                      transition-all
                      duration-300
                      hover:border-amber-300
                      focus:border-amber-500
                      focus:ring-4
                      focus:ring-amber-500/10
                      dark:border-white/[0.08]
                      dark:bg-white/[0.025]
                      dark:text-white
                      dark:hover:border-amber-400/20
                      dark:focus:border-amber-400
                    "
                  />
                </section>

                {/* ================================================= */}
                {/* 6. PHOTOS                                          */}
                {/* ================================================= */}

                <section
                  className="
                    relative
                    space-y-3
                    motion-safe:animate-in
                    motion-safe:fade-in
                    motion-safe:slide-in-from-bottom-3
                    duration-500
                  "
                  style={{
                    animationDelay: '170ms',
                  }}
                >
                  <SectionTitle
                    icon={<Images className="h-4 w-4" />}
                    number="6"
                    title="Photos"
                    color="rose"
                  />

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-rose-100
                      bg-rose-50/50
                      px-3
                      py-2
                      text-[10px]
                      text-rose-600
                      dark:border-rose-500/[0.1]
                      dark:bg-rose-500/[0.05]
                      dark:text-rose-300
                    "
                  >
                    <Star className="h-3 w-3 fill-current" />
                    Cliquez sur une photo pour la
                    conserver. L'étoile définit la
                    principale.
                  </div>

                  {candidatePhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {candidatePhotos.map(
                        (url, idx) => {
                          const kept =
                            keptPhotos.includes(url);

                          const isMain =
                            kept &&
                            keptPhotos.indexOf(url) ===
                              mainPhotoIndex;

                          return (
                            <div
                              key={url}
                              className="
                                group/photo
                                relative
                                motion-safe:animate-in
                                motion-safe:fade-in
                                motion-safe:zoom-in-95
                                duration-300
                              "
                              style={{
                                animationDelay: `${
                                  idx * 50
                                }ms`,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  togglePhoto(url)
                                }
                                className={`
                                  relative
                                  aspect-square
                                  w-full
                                  overflow-hidden
                                  rounded-2xl
                                  border-2
                                  bg-slate-100
                                  transition-all
                                  duration-500
                                  dark:bg-white/[0.04]
                                  ${
                                    kept
                                      ? 'border-orange-500 shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] ring-2 ring-orange-300/50 dark:ring-orange-500/20'
                                      : 'border-transparent opacity-50 hover:scale-[1.03] hover:border-slate-300 hover:opacity-100 dark:hover:border-white/20'
                                  }
                                `}
                              >
                                <img
                                  src={getPhotoUrl(
                                    url
                                  )}
                                  alt=""
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-700
                                    group-hover/photo:scale-110
                                  "
                                />

                                {/* Selected overlay */}
                                {kept && (
                                  <div
                                    className="
                                      pointer-events-none
                                      absolute
                                      inset-0
                                      bg-gradient-to-t
                                      from-orange-900/30
                                      via-transparent
                                      to-transparent
                                    "
                                  />
                                )}

                                {/* Check */}
                                {kept && (
                                  <span
                                    className="
                                      absolute
                                      bottom-1.5
                                      left-1.5
                                      flex
                                      h-5
                                      w-5
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-orange-500
                                      text-white
                                      shadow-lg
                                      motion-safe:animate-in
                                      motion-safe:zoom-in-75
                                      duration-300
                                    "
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                              </button>

                              {kept && (
                                <button
                                  type="button"
                                  title="Définir comme photo principale"
                                  onClick={() =>
                                    setMainPhotoIndex(
                                      keptPhotos.indexOf(
                                        url
                                      )
                                    )
                                  }
                                  className={`
                                    absolute
                                    right-1.5
                                    top-1.5
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    shadow-lg
                                    backdrop-blur-md
                                    transition-all
                                    duration-300
                                    hover:scale-110
                                    active:scale-90
                                    ${
                                      isMain
                                        ? 'border-yellow-300 bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                                        : 'border-white/60 bg-white/80 text-gray-600 dark:border-white/20 dark:bg-black/50 dark:text-gray-300'
                                    }
                                  `}
                                >
                                  <Star
                                    className={`
                                      h-3.5
                                      w-3.5
                                      ${
                                        isMain
                                          ? 'fill-white'
                                          : ''
                                      }
                                    `}
                                  />
                                </button>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* New photos */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="group/upload cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          handleFileSelect
                        }
                        className="hidden"
                      />

                      <span
                        className="
                          inline-flex
                          h-11
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-dashed
                          border-orange-300
                          bg-orange-50/60
                          px-4
                          text-xs
                          font-semibold
                          text-orange-600
                          transition-all
                          duration-300
                          hover:scale-[1.02]
                          hover:border-orange-500
                          hover:bg-orange-100
                          hover:shadow-[0_10px_25px_-12px_rgba(249,115,22,0.7)]
                          active:scale-95
                          dark:border-orange-500/30
                          dark:bg-orange-500/[0.06]
                          dark:text-orange-300
                          dark:hover:bg-orange-500/[0.12]
                        "
                      >
                        <span
                          className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-lg
                            bg-orange-500
                            text-white
                            transition-transform
                            duration-300
                            group-hover/upload:rotate-90
                          "
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </span>

                        Nouvelles photos
                      </span>
                    </label>

                    {newFiles.map((f, i) => (
                      <div
                        key={i}
                        className="
                          group/newphoto
                          relative
                          h-12
                          w-12
                          overflow-hidden
                          rounded-xl
                          border
                          border-slate-200
                          shadow-sm
                          motion-safe:animate-in
                          motion-safe:zoom-in-75
                          duration-300
                          dark:border-white/[0.08]
                        "
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover/newphoto:scale-110
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewFile(i)
                          }
                          className="
                            absolute
                            right-0
                            top-0
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-bl-lg
                            bg-red-500
                            text-white
                            opacity-90
                            transition-all
                            duration-200
                            hover:bg-red-600
                            hover:opacity-100
                            hover:scale-110
                          "
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER                                                     */}
        {/* ========================================================= */}

        <DialogFooter
          className={`
            relative
            shrink-0
            border-t
            border-slate-200/70
            bg-slate-50/75
            px-6
            py-4
            backdrop-blur-xl
            dark:border-white/[0.06]
            dark:bg-white/[0.015]
            ${
              !ready
                ? 'hidden'
                : 'flex-col-reverse gap-2 sm:flex-row sm:justify-end'
            }
          `}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              h-11
              rounded-xl
              border-slate-200
              bg-white/80
              px-5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-300
              hover:bg-white
              hover:shadow-md
              active:scale-[0.98]
              dark:border-white/[0.1]
              dark:bg-white/[0.03]
              dark:text-slate-300
              dark:hover:border-white/[0.18]
              dark:hover:bg-white/[0.06]
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
              overflow-hidden
              rounded-xl
              border-0
              bg-gradient-to-r
              from-orange-500
              via-red-500
              to-rose-600
              px-6
              text-sm
              font-bold
              text-white
              shadow-[0_12px_30px_-10px_rgba(239,68,68,0.8)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_40px_-10px_rgba(239,68,68,0.9)]
              active:translate-y-0
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
            "
          >
            {/* Shimmer */}
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/25
                to-transparent
                transition-transform
                duration-700
                group-hover/merge:translate-x-full
              "
            />

            {/* Glow */}
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-xl
                opacity-0
                shadow-[inset_0_0_25px_rgba(255,255,255,0.2)]
                transition-opacity
                duration-300
                group-hover/merge:opacity-100
              "
            />

            <span className="relative flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />

                  Fusion...
                </>
              ) : (
                <>
                  <Merge
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-500
                      group-hover/merge:rotate-180
                    "
                  />

                  Fusionner{' '}
                  {selectedIds.length} produits

                  <Sparkles
                    className="
                      h-3.5
                      w-3.5
                      opacity-80
                      transition-all
                      duration-300
                      group-hover/merge:scale-125
                    "
                  />
                </>
              )}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Titre de section premium.
 * Purement visuel : aucune logique métier.
 */
interface SectionTitleProps {
  icon: React.ReactNode;
  number: string;
  title: string;
  color:
    | 'violet'
    | 'emerald'
    | 'blue'
    | 'amber'
    | 'rose';
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  icon,
  number,
  title,
  color,
}) => {
  const colorClasses = {
    violet: {
      icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
      number:
        'bg-violet-500 text-white shadow-[0_6px_15px_-7px_rgba(139,92,246,0.8)]',
    },
    emerald: {
      icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      number:
        'bg-emerald-500 text-white shadow-[0_6px_15px_-7px_rgba(16,185,129,0.8)]',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      number:
        'bg-blue-500 text-white shadow-[0_6px_15px_-7px_rgba(59,130,246,0.8)]',
    },
    amber: {
      icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      number:
        'bg-amber-500 text-white shadow-[0_6px_15px_-7px_rgba(245,158,11,0.8)]',
    },
    rose: {
      icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
      number:
        'bg-rose-500 text-white shadow-[0_6px_15px_-7px_rgba(244,63,94,0.8)]',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          ${classes.icon}
        `}
      >
        {icon}
      </div>

      <div
        className={`
          flex
          h-6
          min-w-6
          items-center
          justify-center
          rounded-md
          px-1.5
          text-[10px]
          font-black
          ${classes.number}
        `}
      >
        {number}
      </div>

      <Label
        className="
          text-sm
          font-bold
          tracking-tight
          text-slate-800
          dark:text-slate-100
        "
      >
        {title}
      </Label>
    </div>
  );
};

export default ProductMergeModal;