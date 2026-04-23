/**
 * DepenseFormDialog - Formulaire modal pour ajouter une dépense
 * 
 * RÔLE :
 * Ce composant affiche une modale permettant d'enregistrer une nouvelle dépense
 * (taxes, carburant, autres). Les dépenses sont enregistrées dans nouvelle_achat.json.
 * 
 * PROPS :
 * - isOpen: boolean - État d'ouverture de la modale
 * - onClose: () => void - Callback à la fermeture de la modale
 * - depenseForm: DepenseFormData - Données du formulaire
 * - onFormChange: (field: keyof DepenseFormData, value: string | number) => void - Callback de changement
 * - onSubmit: () => void - Callback de soumission
 * 
 * DÉPENDANCES :
 * - @/components/ui/dialog
 * - @/components/ui/input
 * - @/components/ui/select
 * - @/components/ui/button
 * - @/components/ui/label
 * - @/types/comptabilite (DepenseFormData)
 * - lucide-react (Receipt, Fuel, DollarSign, Plus)
 * 
 * UTILISÉ PAR :
 * - ComptabiliteModule.tsx
 */

import React, { useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Receipt, Fuel, DollarSign, Plus, CalendarIcon, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { DepenseFormData } from '@/types/comptabilite';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface DepenseFormDialogProps {
  /** État d'ouverture de la modale */
  isOpen: boolean;
  /** Callback à la fermeture de la modale */
  onClose: () => void;
  /** Données actuelles du formulaire */
  depenseForm: DepenseFormData;
  /** Callback lors du changement d'un champ du formulaire */
  onFormChange: (field: keyof DepenseFormData, value: string | number) => void;
  /** Callback lors de la soumission du formulaire */
  onSubmit: () => void;
  /** Fichier reçu en attente (image ou PDF) — facultatif */
  receiptFile?: File | null;
  /** Callback lors du changement du reçu (fichier ou null pour retirer) */
  onReceiptChange?: (file: File | null) => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const DepenseFormDialog: React.FC<DepenseFormDialogProps> = ({
  isOpen,
  onClose,
  depenseForm,
  onFormChange,
  onSubmit,
  receiptFile,
  onReceiptChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!receiptFile) return null;
    return URL.createObjectURL(receiptFile);
  }, [receiptFile]);

  const isPdf = receiptFile?.type === 'application/pdf';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) onReceiptChange?.(f);
    if (e.target) e.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/30 to-red-50/50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        {/* En-tête de la modale */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            Nouvelle Dépense
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Enregistrez une nouvelle dépense (taxes, carburant, autres)
          </DialogDescription>
        </DialogHeader>

        {/* Corps du formulaire */}
        <div className="space-y-5 py-4">
          {/* ===========================================================
              REÇU DE DÉPENSE (image ou PDF) — facultatif
              Affiché juste au-dessus de la date.
          =========================================================== */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
              Reçu (image ou PDF) <span className="text-xs font-normal text-gray-400">— facultatif</span>
            </Label>

            {!receiptFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 hover:border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100/60 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Upload className="h-6 w-6 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Cliquez pour ajouter un reçu
                </span>
                <span className="text-xs text-gray-500">JPG, PNG, WebP ou PDF (max 15 MB)</span>
              </button>
            ) : (
              <div className="relative rounded-2xl border border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 p-3 flex items-center gap-3 shadow-sm">
                {isPdf ? (
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-red-500" />
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Aperçu reçu"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                    {receiptFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(receiptFile.size / 1024).toFixed(1)} KB
                    {' • '}
                    {isPdf ? 'PDF' : 'Image'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onReceiptChange?.(null)}
                  className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl"
                  title="Retirer le reçu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Date de dépense */}
            <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-orange-500" />
            Date de dépense *
          </Label>

          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />

            <Input
              type="date"
              value={depenseForm.date ? depenseForm.date.slice(0, 10) : ""}
              onChange={(e) =>
                onFormChange(
                  "date",
                  e.target.value ? new Date(e.target.value).toISOString() : ""
                )
              }
              className={cn(
                "h-12 w-full pl-11 pr-4 rounded-2xl",
                "bg-white/80 dark:bg-gray-900/70 backdrop-blur-md",
                "border border-gray-200/60 dark:border-gray-700/60",
                "text-gray-900 dark:text-gray-100 font-medium",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                "appearance-none"
              )}
            />
          </div>
          </div>


          {/* Type de dépense */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Type de dépense
            </Label>
            <Select
              value={depenseForm.type}
              onValueChange={(v) => onFormChange('type', v)}
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="taxes">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Taxes
                  </div>
                </SelectItem>
                <SelectItem value="carburant">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" /> Carburant
                  </div>
                </SelectItem>
                <SelectItem value="autre_depense">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Autre
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Description *
            </Label>
            <Input
              value={depenseForm.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="Description de la dépense"
              className="bg-white/80 dark:bg-gray-800/80"
            />
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Montant (€) *
            </Label>
            <Input
              type="number"
              value={depenseForm.montant || ''}
              onChange={(e) => onFormChange('montant', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="bg-white/80 dark:bg-gray-800/80"
            />
          </div>

          {/* Catégorie (optionnel) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Catégorie (optionnel)
            </Label>
            <Input
              value={depenseForm.categorie || ''}
              onChange={(e) => onFormChange('categorie', e.target.value)}
              placeholder="Ex: Transport, Fournitures..."
              className="bg-white/80 dark:bg-gray-800/80"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!depenseForm.description || depenseForm.montant <= 0 || !depenseForm.date}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Enregistrer la dépense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepenseFormDialog;
