/**
 * RdvProductSection.tsx — Section « Produits » du formulaire RDV-tâche.
 * Autonome : recherche produit (3 caractères) + filtre par attributs,
 * quantité limitée au stock, prix de vente, ville de livraison + frais,
 * puis ajout au panier. Les produits du panier sont enregistrés avec le RDV.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShoppingCart, Sparkles, Package, Truck, Search } from 'lucide-react';
import ClassificationSearchPopover, { } from '@/components/products/attributes/ClassificationSearchPopover';
import productApiService from '@/services/api/productApi';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';
import type { Product } from '@/types/product';
import type { RdvProduit } from '@/services/api/rdvTachesApi';

type Cat = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

interface Props {
  produits: RdvProduit[];
  onChange: (produits: RdvProduit[]) => void;
}

const catOf = (desc: string): Cat => {
  const d = (desc || '').toLowerCase();
  if (d.includes('perruque')) return 'perruque';
  if (d.includes('tissage')) return 'tissage';
  if (d.includes('extension')) return 'extension';
  return 'autres';
};

const RdvProductSection: React.FC<Props> = ({ produits, onChange }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [villes, setVilles] = useState<LivraisonVille[]>([]);
  const [category, setCategory] = useState<Cat>('all');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [quantite, setQuantite] = useState('1');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [ville, setVille] = useState('');
  const [fraisLivraison, setFraisLivraison] = useState('0');
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    productApiService.getAll().then(setAllProducts).catch(() => setAllProducts([]));
    livraisonVilleApi.getAll().then(setVilles).catch(() => setVilles([]));
  }, []);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 3) return [];
    return allProducts
      .filter(p => (category === 'all' || catOf(p.description) === category))
      .filter(p => (p.description || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [allProducts, search, category]);

  const stockDispo = selected ? Number(selected.quantity || 0) : 0;

  const handleSelect = (p: Product) => {
    setSelected(p);
    setSearch(p.description);
    setShowSuggestions(false);
    setPrixUnitaire(String(p.purchasePrice ?? ''));
    setPrixVente(String(p.sellingPrice ?? ''));
    setQuantite('1');
    setErreur(null);
  };

  const handleVille = (v: string) => {
    setVille(v);
    const f = villes.find(x => x.ville === v);
    setFraisLivraison(String(f?.fee ?? 0));
  };

  const resetLine = () => {
    setSelected(null); setSearch(''); setQuantite('1');
    setPrixUnitaire(''); setPrixVente(''); setVille(''); setFraisLivraison('0');
  };

  const handleAdd = () => {
    if (!selected) { setErreur('Sélectionnez un produit'); return; }
    const qte = parseInt(quantite, 10);
    if (!qte || qte <= 0) { setErreur('Quantité invalide'); return; }
    if (qte > stockDispo) { setErreur(`Stock insuffisant (disponible : ${stockDispo})`); return; }
    const pv = parseFloat(prixVente);
    if (isNaN(pv) || pv < 0) { setErreur('Prix de vente requis'); return; }
    setErreur(null);
    onChange([
      ...produits,
      {
        productId: selected.id,
        nom: selected.description,
        quantite: qte,
        prixUnitaire: parseFloat(prixUnitaire) || 0,
        prixVente: pv,
        deliveryLocation: ville,
        deliveryFee: parseFloat(fraisLivraison) || 0,
      },
    ]);
    resetLine();
  };

  const total = produits.reduce((s, p) => s + p.prixVente * p.quantite + (p.deliveryFee || 0), 0);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/15">
      <h3 className="text-sm font-black text-white flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-white" />
        </span>
        Produits du RDV <Sparkles className="h-4 w-4 text-pink-400" />
      </h3>

      <ClassificationSearchPopover
        currentCategory={category}
        onApply={({ name, category: c }) => {
          setCategory(c as Cat);
          if (name) { setSearch(name); setShowSuggestions(name.length >= 3); setSelected(null); }
        }}
      />

      {/* Recherche produit */}
      <div className="relative space-y-1.5">
        <Label className="text-xs font-bold text-white/80 flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-purple-400" /> Produit
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); setShowSuggestions(e.target.value.length >= 3); }}
            placeholder="Saisir 3 caractères..."
            className="pl-9 bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40"
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {suggestions.map(p => (
              <button key={p.id} type="button" onClick={() => handleSelect(p)}
                className="w-full text-left px-3 py-2 hover:bg-purple-500/20 text-white text-xs border-b border-white/5 last:border-0">
                <span className="font-semibold">{p.description}</span>
                <span className="ml-2 text-[10px] text-white/50">💰 {p.purchasePrice}€ • 📊 Stock: {p.quantity}</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <p className="text-[11px] text-emerald-300">✅ {selected.description} — stock disponible : {stockDispo}</p>
        )}
      </div>

      {/* Quantité / prix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-white/80">Quantité</Label>
          <Input type="number" min="1" max={stockDispo || undefined} value={quantite}
            onChange={e => setQuantite(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-white/80">Prix achat (€)</Label>
          <Input type="number" step="0.01" value={prixUnitaire} onChange={e => setPrixUnitaire(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-white/80">Prix vente (€)</Label>
          <Input type="number" step="0.01" value={prixVente} onChange={e => setPrixVente(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl text-white" />
        </div>
      </div>

      {/* Ville + frais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-white/80 flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-amber-400" /> Ville de livraison
          </Label>
          <Select value={ville} onValueChange={handleVille}>
            <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white">
              <SelectValue placeholder="Sélectionner une ville" />
            </SelectTrigger>
            <SelectContent>
              {villes.map(v => <SelectItem key={v.ville} value={v.ville}>{v.ville} — {v.fee}€</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-white/80">Frais livraison (€)</Label>
          <Input type="number" step="0.01" value={fraisLivraison} onChange={e => setFraisLivraison(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl text-white" />
        </div>
      </div>

      {erreur && <p className="text-[11px] text-red-300 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2">{erreur}</p>}

      <Button type="button" onClick={handleAdd}
        className="w-full bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl">
        <Plus className="h-4 w-4 mr-1" /> Ajouter au panier
      </Button>

      {/* Panier */}
      {produits.length > 0 && (
        <div className="space-y-2">
          {produits.map((p, i) => (
            <div key={`${p.productId}-${i}`} className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/15">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{p.nom}</p>
                <p className="text-[10px] text-white/60">
                  x{p.quantite} • {p.prixVente}€ {p.deliveryLocation ? `• 🚚 ${p.deliveryLocation} (${p.deliveryFee || 0}€)` : ''}
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost"
                onClick={() => onChange(produits.filter((_, idx) => idx !== i))}
                className="text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <p className="text-right text-xs font-black text-emerald-300">Total : {total.toFixed(2)} €</p>
        </div>
      )}
    </div>
  );
};

export default RdvProductSection;
