/**
 * BackButton - Bouton "Retour" universel.
 * - Mobile: centré horizontalement, ne pousse aucun contenu (position fixed).
 * - Desktop: ancré à gauche.
 * - z-index volontairement < z-50 pour rester en arrière-plan des modales shadcn.
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const HIDDEN_ROUTES = ["/", "/login", "/register", "/reset-password", "/maintenance"];

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <motion.button
      type="button"
      onClick={handleBack}
      aria-label="Retour à la page précédente"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: [1, 0.85, 1], y: [0, -2, 0] }}
      transition={{
        opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        // z-30 => en arrière-plan des modales (overlay shadcn = z-50)
        "fixed z-30 top-[72px] sm:top-[84px]",
        // Mobile: centré horizontalement, Desktop: ancré à gauche
        "left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0",
        "flex items-center gap-1.5 px-3 py-2 rounded-full",
        "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
        "border border-violet-200/60 dark:border-violet-800/40",
        "text-white text-sm font-medium",
        "shadow-lg hover:shadow-green-400/30",
        className
      )}
    >
      <motion.div
        animate={{ x: [0, -4, 0], scale: [1, 1.15, 1], rotate: [0, -12, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowLeft className="w-4 h-4" />
      </motion.div>
      <span className="hidden sm:inline">Retour</span>
    </motion.button>
  );
};

export default BackButton;
