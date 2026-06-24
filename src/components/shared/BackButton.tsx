/**
 * BackButton - Bouton "Retour" universel affiché sur toutes les pages.
 * Permet de revenir à la page précédente via l'historique du navigateur,
 * avec un fallback vers la page d'accueil si aucun historique n'est disponible.
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Routes sur lesquelles on n'affiche pas le bouton retour
const HIDDEN_ROUTES = ["/", "/login", "/register", "/reset-password", "/maintenance"];

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
<motion.button
  type="button"
  onClick={handleBack}
  aria-label="Retour à la page précédente"
  initial={{ opacity: 0, x: -10 }}
  animate={{
    opacity: [1, 0.8, 1], // clignotement léger
    y: [0, -2, 0], // flottement discret
  }}
  transition={{
    opacity: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
    y: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
  whileHover={{
    scale: 1.05,
    x: -2,
  }}
  whileTap={{
    scale: 0.95,
  }}
  className={cn(
    "fixed z-40 left-2 sm:left-4 top-[72px] sm:top-[84px]",
    "flex items-center gap-1.5 px-3 py-2 rounded-full",
    "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    "border border-violet-200/60 dark:border-violet-800/40",
    "text-white text-sm font-medium",
    "shadow-lg hover:shadow-green-400/30",
    className
  )}
>
  <motion.div
    animate={{
      x: [0, -4, 0],
      scale: [1, 1.15, 1],
      rotate: [0, -12, 0],
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <ArrowLeft className="w-4 h-4" />
  </motion.div>

  <span className="hidden sm:inline">Retour</span>
</motion.button>
  );
};

export default BackButton;
