/**
 * ProductsTable.tsx — Tableau paginé des produits avec tri, badges stock, actions.
 * Extrait de ProduitsPage.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Package, Eye, Edit, Trash2, ImageOff, ArrowUp, ArrowDown, AlertTriangle,
  XCircle, CheckCircle2, Star, PackageX,
} from 'lucide-react';
import ProductCommentScroller from '@/components/products/ProductCommentScroller';
import ProductCharacteristicCard from '@/components/products/ProductCharacteristicCard';
import { Product } from '@/types';
import { ProductRatingInfo } from '@/services/api/productCommentsApi';

export type SortField = 'description' | 'purchasePrice' | 'quantity' | 'notation';
export type SortDir = 'asc' | 'desc';

interface Props {
  tableContainerRef: React.RefObject<HTMLDivElement>;
  paginatedProducts: Product[];
  allRatings: Record<string, ProductRatingInfo>;
  sortField: SortField | null;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  getPhotoUrl: (u: string) => string;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onIndispoTarget: (p: Product) => void;
  onOpenCaracteristique: (p: Product) => void;
}

const sortIcon = (active: boolean, dir: 'asc' | 'desc', want: 'asc' | 'desc') =>
  active && dir === want ? 'text-violet-500' : 'text-violet-300/40';

const ProductsTable: React.FC<Props> = ({
  tableContainerRef, paginatedProducts, allRatings, sortField, sortDir, onSort,
  getPhotoUrl, onView, onEdit, onDelete, onIndispoTarget, onOpenCaracteristique,
}) => {
  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
      {label}
      <span className="flex flex-col">
        <ArrowUp className={cn("h-3 w-3", sortIcon(sortField === field, sortDir, 'asc'))} />
        <ArrowDown className={cn("h-3 w-3 -mt-1", sortIcon(sortField === field, sortDir, 'desc'))} />
      </span>
    </button>
  );

  return (
    <motion.div ref={tableContainerRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-3xl border border-violet-200/20 dark:border-violet-800/20 overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-white/5 shadow-2xl shadow-violet-500/5"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-b border-violet-200/20 dark:border-violet-800/20">
              <TableHead className="font-black text-violet-700 dark:text-violet-300">Photo</TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300">Code</TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300"><SortBtn field="description" label="Description" /></TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300"><SortBtn field="purchasePrice" label="Prix" /></TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300"><SortBtn field="quantity" label="Qté" /></TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300"><SortBtn field="notation" label="Notation" /></TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300 text-center">Actions</TableHead>
              <TableHead className="font-black text-violet-700 dark:text-violet-300 text-center">Caractéristique</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Package className="h-8 w-8 text-violet-400" />
                    </div>
                    <p className="font-bold text-muted-foreground">Aucun produit trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}
                  className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/10 dark:hover:to-fuchsia-900/10 transition-all duration-200 border-b border-violet-100/20 dark:border-violet-800/10"
                >
                  <TableCell className="py-1">
                    <div className="relative group cursor-pointer h-full" onClick={() => onView(product)}>
                      <div className={cn("rounded-xl overflow-hidden border-2 border-violet-200/30 dark:border-violet-800/30 shadow-md", allRatings[product.id]?.comments?.length > 0 ? "h-20 min-h-[3rem]" : "h-12")} >
                        {product.mainPhoto || (product.photos && product.photos.length > 0) ? (
                          <img src={getPhotoUrl(product.mainPhoto || product.photos![0])} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-violet-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      {product.code || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-foreground min-w-[220px] max-w-[350px]">
                    <div className="flex flex-col gap-1">
                      {allRatings[product.id]?.comments?.length > 0 && (
                        <ProductCommentScroller comments={allRatings[product.id].comments} />
                      )}
                      <span className="break-words whitespace-pre-wrap">{product.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{product.purchasePrice}€</span>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const qty = product.quantity;
                      if (qty === 0) {
                        return (
                          <div className="flex flex-col items-start gap-1">
                            <Badge className="font-black border-0 bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 px-3 py-1 text-base animate-[stockBlink_5s_ease-in-out_infinite]">
                              <AlertTriangle className="h-3.5 w-3.5 mr-1 animate-[stockBlink_5s_ease-in-out_infinite]" />
                              0
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400 animate-[stockPulse_5s_ease-in-out_infinite]">
                              <XCircle className="h-3 w-3" />
                              Stock épuisé
                            </span>
                          </div>
                        );
                      }
                      if (qty === 1 || qty === 2) {
                        return (
                          <div className="flex flex-col items-start gap-1">
                            <Badge className="font-bold border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/40 px-3 py-1">{qty}</Badge>
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 animate-[stockPulse_5s_ease-in-out_infinite]">
                              <AlertTriangle className="h-3 w-3 animate-[stockPulse_5s_ease-in-out_infinite]" />
                              Stock très bas
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col items-start gap-1">
                          <Badge className="font-bold border-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1">{qty}</Badge>
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Stock bon
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const info = allRatings[product.id];
                      if (!info || info.count === 0) return <span className="text-muted-foreground text-xs">—</span>;
                      const avg = info.average;
                      const fullStars = Math.floor(avg);
                      const hasHalf = avg - fullStars >= 0.3;
                      const starColor = avg <= 2 ? 'text-red-500' : avg <= 3 ? 'text-yellow-500' : 'text-emerald-500';
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className={`flex items-center ${starColor}`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < fullStars ? "fill-current" : (i === fullStars && hasHalf) ? "fill-current opacity-50" : "opacity-20")} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{avg} ({info.count})</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      {(() => {
                        const indispoQty = (product.achats || [])
                          .filter(a => a && a.disponible === false)
                          .reduce((s, a) => s + (Number(a.quantity) || 0), 0);
                        if (indispoQty <= 0) return null;
                        return (
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => onIndispoTarget(product)}
                            className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-200"
                            title={`${indispoQty} unité(s) indisponible(s) — cliquez pour rendre disponible`}
                            type="button"
                          >
                            <PackageX className="h-4 w-4" />
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow">
                              {indispoQty}
                            </span>
                          </motion.button>
                        );
                      })()}
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onView(product)}
                        className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-all duration-200 backdrop-blur-xl border border-violet-200/20 dark:border-violet-800/20"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-200 backdrop-blur-xl border border-blue-200/20 dark:border-blue-800/20"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(product)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200 backdrop-blur-xl border border-red-200/20 dark:border-red-800/20"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center justify-center gap-2">
                      <ProductCharacteristicCard product={product} variant="compact" />
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onOpenCaracteristique(product)}
                        className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 transition-all duration-200 backdrop-blur-xl border border-fuchsia-200/30 dark:border-fuchsia-800/30"
                        title="Voir caractéristique"
                        type="button"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default ProductsTable;
