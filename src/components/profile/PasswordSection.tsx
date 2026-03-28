/**
 * PasswordSection — Section de changement de mot de passe
 * 
 * Affiche un bouton "Changer le mot de passe" qui révèle un formulaire avec :
 * - Mot de passe actuel (vérifié côté serveur)
 * - Nouveau mot de passe (avec PasswordStrengthChecker pour vérifier la force)
 * - Confirmation du nouveau mot de passe
 * 
 * Chaque champ a un toggle visibilité (œil).
 * Le bouton "Valider" est désactivé tant que tous les champs ne sont pas remplis
 * et que le PasswordStrengthChecker n'a pas validé le nouveau mot de passe.
 * 
 * Règles backend (server/routes/profile.js) :
 * - Mot de passe min 6 caractères
 * - Doit contenir majuscule, minuscule, chiffre et caractère spécial
 * - Nouveau mot de passe ≠ ancien mot de passe
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';

/** Classe CSS commune pour les boutons premium */
const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

interface PasswordSectionProps {
  showPasswordForm: boolean;
  setShowPasswordForm: (v: boolean) => void;
  pwForm: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPwForm: React.Dispatch<React.SetStateAction<{ currentPassword: string; newPassword: string; confirmPassword: string }>>;
  showPw: { current: boolean; new: boolean; confirm: boolean };
  setShowPw: React.Dispatch<React.SetStateAction<{ current: boolean; new: boolean; confirm: boolean }>>;
  /** Indique si le nouveau mot de passe satisfait les critères de force */
  isNewPasswordValid: boolean;
  setIsNewPasswordValid: (v: boolean) => void;
  /** Callback déclenché au clic sur Valider (ouvre le dialogue de confirmation) */
  onSubmit: () => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  showPasswordForm, setShowPasswordForm, pwForm, setPwForm, showPw, setShowPw,
  isNewPasswordValid, setIsNewPasswordValid, onSubmit
}) => {
  /** Configuration des 3 champs du formulaire de mot de passe */
  const fields = [
    { key: 'currentPassword' as const, label: 'Mot de passe actuel', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
    { key: 'newPassword' as const, label: 'Nouveau mot de passe', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
    { key: 'confirmPassword' as const, label: 'Confirmer le nouveau mot de passe', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
    >
      {/* Ligne gradient décorative (rose → orange → ambre) */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-500" /> Sécurité — Mot de passe
        </h3>
        {/* Bouton pour révéler le formulaire (masqué si déjà ouvert) */}
        {!showPasswordForm && (
          <Button onClick={() => setShowPasswordForm(true)} className={`${premiumBtnClass} bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-300/30 text-rose-600 dark:text-rose-400`}>
            <Lock className="w-4 h-4 mr-2" /> Changer le mot de passe
          </Button>
        )}
      </div>

      {/* Formulaire de changement de mot de passe */}
      {showPasswordForm && (
        <div className="space-y-4 max-w-md">
          {fields.map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
              <div className="relative">
                <Input type={show ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  autoComplete="new-password" data-lpignore="true" data-form-type="other"
                  className="rounded-xl border-violet-200/30 dark:border-violet-800/20 pr-10" />
                {/* Toggle visibilité du mot de passe */}
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Indicateur de force du mot de passe (uniquement pour le nouveau) */}
              <PasswordStrengthChecker password={pwForm[key]} onValidityChange={(isValid) => { if (key === "newPassword") setIsNewPasswordValid(isValid); }} />
            </div>
          ))}
          {/* Boutons Annuler / Valider */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => { setShowPasswordForm(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setIsNewPasswordValid(false); }}
              variant="ghost" className="rounded-xl text-rose-500">
              <X className="w-4 h-4 mr-1" /> Annuler
            </Button>
            <Button onClick={onSubmit}
              disabled={!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword || !isNewPasswordValid}
              className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30`}>
              <Check className="w-4 h-4 mr-2" /> Valider
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PasswordSection;
