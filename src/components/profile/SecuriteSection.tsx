/**
 * SecuriteSection — Section Sécurité dans les paramètres du profil
 * 
 * Layout: 2x2 grid luxe design
 * - Top: Gestion des rôles | Gérance comptes
 * - Bottom: Paramètres de connexion | Cryptage de données
 * + Temps d'utilisation (timeout & inactivité)
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Eye, EyeOff, UserCog, ArrowUpCircle, ArrowDownCircle,
  Radio, Trash2, Key, CheckCircle, XCircle, AlertTriangle, Timer, Hash, Clock, Hourglass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';

interface SecuriteSectionProps {
  userRole?: string;
}

const cardClass = "relative rounded-2xl backdrop-blur-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden";
const cardHeaderClass = "flex items-center gap-3 mb-5";
const iconBoxClass = "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg";
const sectionLabelClass = "text-xs font-bold uppercase tracking-wider";

const SecuriteSection: React.FC<SecuriteSectionProps> = ({ userRole }) => {
  const { toast } = useToast();
  const isAdminPrincipal = userRole === 'administrateur principale';

  // Users state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Role management
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<any>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  // Specification management
  const [showSpecDialog, setShowSpecDialog] = useState(false);
  const [specChangeUser, setSpecChangeUser] = useState<any>(null);
  const [specChangeTarget, setSpecChangeTarget] = useState('');
  const [changingSpec, setChangingSpec] = useState(false);

  // Account delete management
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Encryption state
  const [encryptionStatus, setEncryptionStatus] = useState<{ enabled: boolean; hasKey: boolean; activatedAt: string | null }>({ enabled: false, hasKey: false, activatedAt: null });
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [isEncryptionKeyValid, setIsEncryptionKeyValid] = useState(false);
  const [activatingEncryption, setActivatingEncryption] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateKey, setDeactivateKey] = useState('');
  const [showDeactivateKey, setShowDeactivateKey] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Login security settings
  const [nombreConnexion, setNombreConnexion] = useState(5);
  const [tempsBlocage, setTempsBlocage] = useState(15);
  const [savingSecuritySettings, setSavingSecuritySettings] = useState(false);

  // Timeout & Inactivity settings
  const [inactiveMinutes, setInactiveMinutes] = useState(10);
  const [timeoutHours, setTimeoutHours] = useState(7);
  const [savingTimeout, setSavingTimeout] = useState(false);

  useEffect(() => {
    if (isAdminPrincipal) {
      fetchUsers();
      fetchEncryptionStatus();
      fetchSecuritySettings();
      fetchTimeoutSettings();
    }
  }, [isAdminPrincipal]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/api/settings/users');
      setAllUsers(response.data.users || []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEncryptionStatus = async () => {
    try {
      const response = await api.get('/api/encryption/status');
      setEncryptionStatus(response.data);
    } catch (e) {
      console.error('Error fetching encryption status:', e);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      // Source de vérité : tentativeblocage.json côté serveur
      const response = await api.get('/api/profile/security-settings');
      if (response.data) {
        setNombreConnexion(Number(response.data.nombreConnexion) || 5);
        setTempsBlocage(Number(response.data.tempsBlocage) || 15);
      }
    } catch (e) {
      console.error('Error fetching security settings:', e);
      setNombreConnexion(5);
      setTempsBlocage(15);
    }
  };

  const fetchTimeoutSettings = async () => {
    try {
      // Source de vérité : timeoutinactive.json côté serveur
      const response = await api.get('/api/profile/timeout-settings');
      if (response.data) {
        setInactiveMinutes(Number(response.data.active) || 10);
        setTimeoutHours(Number(response.data.timeout) || 7);
      }
    } catch (e) {
      console.error('Error fetching timeout settings:', e);
      setInactiveMinutes(10);
      setTimeoutHours(7);
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      setSavingSecuritySettings(true);
      const response = await api.put('/api/profile/security-settings', {
        nombreConnexion,
        tempsBlocage
      });
      if (response.data.success) {
        toast({ title: '✅ Paramètres de sécurité sauvegardés', description: `Max ${nombreConnexion} tentatives, blocage ${tempsBlocage} min`, className: 'bg-green-600 text-white border-green-600' });
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setSavingSecuritySettings(false);
    }
  };

  const handleSaveTimeoutSettings = async () => {
    try {
      setSavingTimeout(true);
      const response = await api.put('/api/profile/timeout-settings', {
        active: inactiveMinutes,
        timeout: timeoutHours
      });
      if (response.data.success) {
        // Update localStorage so the hook picks it up immediately
        localStorage.setItem('timeout_settings', JSON.stringify({ active: inactiveMinutes, timeout: timeoutHours }));
        window.dispatchEvent(new CustomEvent('timeout:updated'));
        toast({ title: '✅ Temps d\'utilisation sauvegardé', description: `Inactivité: ${inactiveMinutes} min, Timeout: ${timeoutHours}h`, className: 'bg-green-600 text-white border-green-600' });
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setSavingTimeout(false);
    }
  };

  // ========== ROLE CHANGE ==========
  const handleRoleChange = async () => {
    if (!roleChangeUser) return;
    try {
      setChangingRole(true);
      const response = await api.put('/api/settings/user-role', {
        userId: roleChangeUser.id,
        newRole: roleChangeTarget
      });
      if (response.data.success) {
        toast({ title: '✅ Rôle modifié', description: `Le rôle de ${roleChangeUser.firstName} a été mis à jour`, className: 'bg-green-600 text-white border-green-600' });
        setShowRoleDialog(false);
        fetchUsers();
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors du changement de rôle', variant: 'destructive' });
    } finally {
      setChangingRole(false);
    }
  };

  // ========== SPECIFICATION CHANGE ==========
  const handleSpecChange = async () => {
    if (!specChangeUser) return;
    try {
      setChangingSpec(true);
      const response = await api.put('/api/settings/user-specification', {
        userId: specChangeUser.id,
        specification: specChangeTarget
      });
      if (response.data.success) {
        toast({ title: '✅ Spécification modifiée', description: `La spécification de ${specChangeUser.firstName} a été mise à jour`, className: 'bg-green-600 text-white border-green-600' });
        setShowSpecDialog(false);
        fetchUsers();
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors du changement de spécification', variant: 'destructive' });
    } finally {
      setChangingSpec(false);
    }
  };

  // ========== DELETE USER ACCOUNT ==========
  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      setDeletingUser(true);
      const response = await api.delete(`/api/settings/user/${deleteTargetUser.id}`);
      if (response.data.success) {
        toast({ title: '✅ Compte supprimé', description: response.data.message, className: 'bg-green-600 text-white border-green-600' });
        setShowDeleteUserDialog(false);
        setDeleteTargetUser(null);
        fetchUsers();
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la suppression du compte', variant: 'destructive' });
    } finally {
      setDeletingUser(false);
    }
  };

  // ========== ENCRYPTION ==========
  const handleActivateEncryption = async () => {
    if (!isEncryptionKeyValid) {
      toast({ title: 'Erreur', description: 'La clé de cryptage ne respecte pas les critères de sécurité', variant: 'destructive' });
      return;
    }
    try {
      setActivatingEncryption(true);
      const response = await api.post('/api/encryption/activate', { encryptionKey });
      if (response.data.success) {
        toast({ title: '🔒 Cryptage activé', description: response.data.message, className: 'bg-green-600 text-white border-green-600' });
        setEncryptionKey('');
        fetchEncryptionStatus();
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de l\'activation', variant: 'destructive' });
    } finally {
      setActivatingEncryption(false);
    }
  };

  const handleDeactivateEncryption = async () => {
    try {
      setDeactivating(true);
      const response = await api.post('/api/encryption/deactivate', { encryptionKey: deactivateKey });
      if (response.data.success) {
        toast({ title: '🔓 Cryptage désactivé', description: response.data.message, className: 'bg-green-600 text-white border-green-600' });
        setDeactivateKey('');
        setShowDeactivateDialog(false);
        fetchEncryptionStatus();
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Clé incorrecte', variant: 'destructive' });
    } finally {
      setDeactivating(false);
    }
  };

  if (!isAdminPrincipal) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Accès réservé à l'administrateur principal</p>
      </div>
    );
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className={`${iconBoxClass} bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Sécurité</h3>
            <p className="text-xs text-muted-foreground">Gestion des rôles, comptes, connexion, cryptage et temps d'utilisation</p>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-red-500/50 via-rose-500/30 to-transparent" />
      </motion.div>

      {/* ===== 2x2 GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ========== CARD 1: GESTION DES RÔLES ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500" />
          <div className="p-5">
            <div className={cardHeaderClass}>
              <div className={`${iconBoxClass} bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/30`}>
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`${sectionLabelClass} text-violet-600 dark:text-violet-400`}>Gestion des rôles</span>
                <p className="text-xs text-muted-foreground mt-0.5">Promouvoir ou rétrograder</p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {allUsers.filter(u => u.role !== 'administrateur principale').map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-white/[0.02] border border-violet-200/20 dark:border-violet-800/10 p-3 hover:shadow-md transition-shadow">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        u.role === 'administrateur'
                          ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {u.role === 'administrateur' ? 'Administrateur' : 'Simple utilisateur'}
                      </span>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {u.role === 'administrateur' ? (
                        <Button size="sm"
                          onClick={() => { setRoleChangeUser(u); setRoleChangeTarget(''); setShowRoleDialog(true); }}
                          className="rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs hover:from-orange-500/20 hover:to-red-500/20 h-8 px-3"
                        >
                          <ArrowDownCircle className="w-3 h-3 mr-1" /> Rétrograder
                        </Button>
                      ) : (
                        <Button size="sm"
                          onClick={() => { setRoleChangeUser(u); setRoleChangeTarget('administrateur'); setShowRoleDialog(true); }}
                          className="rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-300/30 text-violet-600 dark:text-violet-400 text-xs hover:from-violet-500/20 hover:to-fuchsia-500/20 h-8 px-3"
                        >
                          <ArrowUpCircle className="w-3 h-3 mr-1" /> Promouvoir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {allUsers.filter(u => u.role !== 'administrateur principale').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun autre utilisateur</p>
                )}
              </div>
            )}

            {/* Gestion spécification inline */}
            {allUsers.filter(u => u.role === 'administrateur').length > 0 && (
              <div className="mt-4 pt-4 border-t border-violet-200/20 dark:border-violet-800/10">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Spécifications</span>
                </div>
                <div className="space-y-2">
                  {allUsers.filter(u => u.role === 'administrateur').map(u => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/20 p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{u.firstName}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          u.specification === 'live' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {u.specification === 'live' ? '🟢 Live' : 'Aucune'}
                        </span>
                      </div>
                      <Button size="sm"
                        onClick={() => { setSpecChangeUser(u); setSpecChangeTarget(u.specification === 'live' ? '' : 'live'); setShowSpecDialog(true); }}
                        className={`rounded-lg text-xs h-7 px-2.5 ${u.specification === 'live'
                          ? 'bg-orange-500/10 border border-orange-300/30 text-orange-600 hover:bg-orange-500/20'
                          : 'bg-emerald-500/10 border border-emerald-300/30 text-emerald-600 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.specification === 'live' ? 'Retirer' : <><Radio className="w-3 h-3 mr-1" /> Live</>}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ========== CARD 2: GÉRANCE COMPTES ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={cardClass}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
          <div className="p-5">
            <div className={cardHeaderClass}>
              <div className={`${iconBoxClass} bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30`}>
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`${sectionLabelClass} text-red-600 dark:text-red-400`}>Gérance comptes</span>
                <p className="text-xs text-muted-foreground mt-0.5">Supprimer des comptes</p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {allUsers.filter(u => u.role !== 'administrateur principale').map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-red-50/30 to-white dark:from-red-950/10 dark:to-white/[0.02] border border-red-200/20 dark:border-red-800/10 p-3 hover:shadow-md transition-shadow">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        u.role === 'administrateur'
                          ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {u.role === 'administrateur' ? 'Administrateur' : 'Simple utilisateur'}
                      </span>
                    </div>
                    <Button size="sm"
                      onClick={() => { setDeleteTargetUser(u); setShowDeleteUserDialog(true); }}
                      className="ml-2 flex-shrink-0 rounded-lg bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-300/30 text-red-600 dark:text-red-400 text-xs hover:from-red-500/20 hover:to-rose-500/20 h-8 px-3"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                    </Button>
                  </div>
                ))}
                {allUsers.filter(u => u.role !== 'administrateur principale').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun compte à gérer</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ========== CARD 3: PARAMÈTRES DE CONNEXION ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
          <div className="p-5">
            <div className={cardHeaderClass}>
              <div className={`${iconBoxClass} bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30`}>
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`${sectionLabelClass} text-blue-600 dark:text-blue-400`}>Paramètres de connexion</span>
                <p className="text-xs text-muted-foreground mt-0.5">Tentatives et blocage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Tentatives max
                  </label>
                  <Input type="number" min={1} max={20} value={nombreConnexion}
                    onChange={e => setNombreConnexion(parseInt(e.target.value) || 5)}
                    className="rounded-xl border-blue-200/30 dark:border-blue-800/20"
                  />
                  <p className="text-[10px] text-muted-foreground">1-20 tentatives</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-3 h-3" /> Blocage (min)
                  </label>
                  <Input type="number" min={1} max={1440} value={tempsBlocage}
                    onChange={e => setTempsBlocage(parseInt(e.target.value) || 15)}
                    className="rounded-xl border-blue-200/30 dark:border-blue-800/20"
                  />
                  <p className="text-[10px] text-muted-foreground">1-1440 minutes</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30 p-2.5">
                <p className="text-[11px] text-blue-700 dark:text-blue-400 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>Après {nombreConnexion} tentatives échouées, blocage de {tempsBlocage} min.</span>
                </p>
              </div>

              <Button onClick={handleSaveSecuritySettings} disabled={savingSecuritySettings}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 h-9 text-sm"
              >
                {savingSecuritySettings ? (
                  <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Sauvegarde...</span>
                ) : (
                  <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Sauvegarder</span>
                )}
              </Button>
            </div>

            {/* Temps d'utilisation sous-section */}
            <div className="mt-5 pt-4 border-t border-blue-200/20 dark:border-blue-800/10">
              <div className="flex items-center gap-2 mb-3">
                <Hourglass className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Temps d'utilisation</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Inactivité (min)
                  </label>
                  <Input type="number" min={1} max={120} value={inactiveMinutes}
                    onChange={e => setInactiveMinutes(parseInt(e.target.value) || 10)}
                    className="rounded-xl border-cyan-200/30 dark:border-cyan-800/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Hourglass className="w-3 h-3" /> Timeout (heures)
                  </label>
                  <Input type="number" min={1} max={24} value={timeoutHours}
                    onChange={e => setTimeoutHours(parseInt(e.target.value) || 7)}
                    className="rounded-xl border-cyan-200/30 dark:border-cyan-800/20"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-200/30 p-2.5 mt-3">
                <p className="text-[11px] text-cyan-700 dark:text-cyan-400 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>Déconnexion auto après {inactiveMinutes} min d'inactivité. Session max: {timeoutHours}h.</span>
                </p>
              </div>
              <Button onClick={handleSaveTimeoutSettings} disabled={savingTimeout}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 h-9 text-sm mt-3"
              >
                {savingTimeout ? (
                  <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Sauvegarde...</span>
                ) : (
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Sauvegarder temps</span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ========== CARD 4: CRYPTAGE DE DONNÉES ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className={cardClass}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
          <div className="p-5">
            <div className={cardHeaderClass}>
              <div className={`${iconBoxClass} bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30`}>
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`${sectionLabelClass} text-amber-600 dark:text-amber-400`}>Cryptage de données</span>
                <p className="text-xs text-muted-foreground mt-0.5">Chiffrement AES-256</p>
              </div>
            </div>

            {/* Status */}
            <div className={`rounded-xl p-3 mb-4 border ${
              encryptionStatus.enabled
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/30'
                : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/30'
            }`}>
              <div className="flex items-center gap-2">
                {encryptionStatus.enabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Cryptage actif</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                        AES-256 actif{encryptionStatus.activatedAt && ` — ${new Date(encryptionStatus.activatedAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Cryptage inactif</p>
                      <p className="text-[10px] text-slate-500">Données non cryptées</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!encryptionStatus.enabled ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Clé de cryptage (min 10 caractères)
                </label>
                <div className="relative">
                  <Input
                    type={showEncryptionKey ? 'text' : 'password'}
                    value={encryptionKey}
                    onChange={e => setEncryptionKey(e.target.value)}
                    placeholder="Clé de cryptage sécurisée"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    className="rounded-xl border-amber-200/30 dark:border-amber-800/20 pr-10"
                  />
                  <button type="button" onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showEncryptionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthChecker password={encryptionKey} onValidityChange={setIsEncryptionKeyValid} />
                <div className="rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 p-2.5">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Mémorisez cette clé ! Sans elle, données irrécupérables.</span>
                  </p>
                </div>
                <Button onClick={handleActivateEncryption} disabled={!isEncryptionKeyValid || activatingEncryption}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 h-9 text-sm"
                >
                  {activatingEncryption ? (
                    <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Cryptage...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Activer le cryptage</span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeactivateDialog(true)}
                className="rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-300/30 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-rose-500/20 text-sm"
              >
                <Lock className="w-4 h-4 mr-2" /> Désactiver le cryptage
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ========== DIALOGS ========== */}

      {/* DELETE USER DIALOG */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={v => { setShowDeleteUserDialog(v); if (!v) setDeleteTargetUser(null); }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Supprimer le compte
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {deleteTargetUser && (
                <>
                  <span className="block text-red-500 font-bold">⚠️ Cette action est IRRÉVERSIBLE !</span>
                  <span className="block">Voulez-vous vraiment supprimer le compte de <strong>{deleteTargetUser.firstName} {deleteTargetUser.lastName}</strong> ({deleteTargetUser.email}) ?</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleDeleteUser} disabled={deletingUser}
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700">
              {deletingUser ? 'Suppression...' : '🗑️ Supprimer définitivement'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ROLE CHANGE DIALOG */}
      <AlertDialog open={showRoleDialog} onOpenChange={v => { setShowRoleDialog(v); if (!v) setRoleChangeUser(null); }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-violet-600">
              <UserCog className="w-5 h-5" /> Modifier le rôle
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser && (
                <>
                  <span className="font-semibold">{roleChangeUser.firstName} {roleChangeUser.lastName}</span><br />
                  {roleChangeTarget === 'administrateur' ? 'Promouvoir en Administrateur ?' : 'Rétrograder en simple utilisateur ?'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleRoleChange} disabled={changingRole}
              className={`rounded-xl text-white ${roleChangeTarget === 'administrateur' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
              {changingRole ? 'Modification...' : 'Confirmer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SPECIFICATION DIALOG */}
      <AlertDialog open={showSpecDialog} onOpenChange={v => { setShowSpecDialog(v); if (!v) setSpecChangeUser(null); }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-emerald-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <Radio className="w-5 h-5" /> Modifier la spécification
            </AlertDialogTitle>
            <AlertDialogDescription>
              {specChangeUser && (
                <>
                  <span className="font-semibold">{specChangeUser.firstName} {specChangeUser.lastName}</span><br />
                  {specChangeTarget === 'live'
                    ? 'Ajouter la spécification Live ? Cet admin pourra recevoir les messages du chat en direct.'
                    : 'Retirer la spécification Live ?'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleSpecChange} disabled={changingSpec}
              className={`rounded-xl text-white ${specChangeTarget === 'live' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
              {changingSpec ? 'Modification...' : 'Confirmer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DEACTIVATE ENCRYPTION DIALOG */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={v => { setShowDeactivateDialog(v); if (!v) { setDeactivateKey(''); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" /> Désactiver le cryptage
            </AlertDialogTitle>
            <AlertDialogDescription>
              Saisissez votre clé de cryptage pour désactiver le cryptage et décrypter toutes les données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type={showDeactivateKey ? 'text' : 'password'}
                value={deactivateKey}
                onChange={e => setDeactivateKey(e.target.value)}
                placeholder="Clé de cryptage actuelle"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="rounded-xl border-red-200/30 dark:border-red-800/20 pr-10"
              />
              <button type="button" onClick={() => setShowDeactivateKey(!showDeactivateKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showDeactivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleDeactivateEncryption} disabled={!deactivateKey || deactivating}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600">
              {deactivating ? 'Décryptage...' : '🔓 Désactiver'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SecuriteSection;
