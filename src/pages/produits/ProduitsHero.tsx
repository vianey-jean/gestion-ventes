import React from "react";
import { Package, Plus, Crown } from "lucide-react";
import LuxeHero from "@/components/shared/LuxeHero";

interface ProduitsHeroProps {
  onAdd: () => void;
}

const ProduitsHero: React.FC<ProduitsHeroProps> = ({ onAdd }) => (
  <LuxeHero
    badge="Smart Inventory System"
    title="Gestion des Produits"
    subtitle="Gérez votre inventaire premium avec élégance, en temps réel et sans effort."
    ctaLabel="Nouveau produit"
    onCta={onAdd}
    CtaIcon={Plus}
    BadgeIcon={Crown}
    liveLabel="STOCK LIVE"
    accentFrom="violet"
    accentVia="fuchsia"
    accentTo="purple"
  />
);

export default ProduitsHero;
