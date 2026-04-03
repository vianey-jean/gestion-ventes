/**
 * SecuriteSection — Section Sécurité dans les paramètres du profil
 * 
 * Contient :
 * - Gestion des rôles
 * - Gestion spécification
 * - Gérance comptes
 * - Cryptage de données
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Eye, EyeOff, UserCog, ArrowUpCircle, ArrowDownCircle,
  Radio, Trash2, Key, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

interface SecuriteSectionProps {
  userRole?: string;
}

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

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
  const [activatingEncryption, setActivatingEncryption] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateKey, setDeactivateKey] = useState('');
  const [showDeactivateKey, setShowDeactivateKey] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (isAdminPrincipal) {
      fetchUsers();
      fetchEncryptionStatus();
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
    if (encryptionKey.length < 10) {
      toast({ title: 'Erreur', description: 'La clé doit contenir au moins 10 caractères', variant: 'destructive' });
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-red-200/30 dark:border-red-800/20 shadow-2xl shadow-red-500/5 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Sécurité</h3>
              <p className="text-xs text-muted-foreground">Gestion des rôles, spécifications, comptes et cryptage</p>
            </div>
          </div>

          {/* ========== GESTION DES RÔLES ========== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <UserCog className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Gestion des rôles</span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.filter(u => u.role !== 'administrateur principale').map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                        u.role === 'administrateur'
                          ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {u.role === 'administrateur' ? 'Administrateur' : 'Simple utilisateur'}
                      </span>
                    </div>
                    <div>
                      {u.role === 'administrateur' ? (
                        <Button
                          size="sm"
                          onClick={() => { setRoleChangeUser(u); setRoleChangeTarget(''); setShowRoleDialog(true); }}
                          className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs hover:from-orange-500/20 hover:to-red-500/20"
                        >
                          <ArrowDownCircle className="w-3 h-3 mr-1" /> Rétrograder
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { setRoleChangeUser(u); setRoleChangeTarget('administrateur'); setShowRoleDialog(true); }}
                          className="rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-300/30 text-violet-600 dark:text-violet-400 text-xs hover:from-violet-500/20 hover:to-fuchsia-500/20"
                        >
                          <ArrowUpCircle className="w-3 h-3 mr-1" /> Promouvoir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {allUsers.filter(u => u.role !== 'administrateur principale').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun autre utilisateur</p>
                )}
              </div>
            )}
          </motion.div>

          {/* ========== GESTION SPÉCIFICATION ========== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Gestion spécification</span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.filter(u => u.role === 'administrateur').map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                        u.specification === 'live'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {u.specification === 'live' ? '🟢 Live' : 'Aucune spécification'}
                      </span>
                    </div>
                    <div>
                      {u.specification === 'live' ? (
                        <Button
                          size="sm"
                          onClick={() => { setSpecChangeUser(u); setSpecChangeTarget(''); setShowSpecDialog(true); }}
                          className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs hover:from-orange-500/20 hover:to-red-500/20"
                        >
                          Retirer Live
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { setSpecChangeUser(u); setSpecChangeTarget('live'); setShowSpecDialog(true); }}
                          className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300/30 text-emerald-600 dark:text-emerald-400 text-xs hover:from-emerald-500/20 hover:to-teal-500/20"
                        >
                          <Radio className="w-3 h-3 mr-1" /> Ajouter Live
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {allUsers.filter(u => u.role === 'administrateur').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun administrateur à configurer</p>
                )}
              </div>
            )}
          </motion.div>

          {/* ========== GÉRANCE COMPTES ========== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Gérance comptes</span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.filter(u => u.role !== 'administrateur principale').map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                        u.role === 'administrateur'
                          ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                          : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {u.role === 'administrateur' ? 'Administrateur' : 'Simple utilisateur'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => { setDeleteTargetUser(u); setShowDeleteUserDialog(true); }}
                      className="rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-300/30 text-red-600 dark:text-red-400 text-xs hover:from-red-500/20 hover:to-rose-500/20"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                    </Button>
                  </div>
                ))}
                {allUsers.filter(u => u.role !== 'administrateur principale').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun compte à gérer</p>
                )}
              </div>
            )}
          </motion.div>

          {/* ========== CRYPTAGE DE DONNÉES ========== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Cryptage de données</span>
            </div>

            {/* Status */}
            <div className={`rounded-xl p-4 mb-4 border ${
              encryptionStatus.enabled
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/50'
                : 'bg-slate-50 dark:bg-slate-900/10 border-slate-200/50'
            }`}>
              <div className="flex items-center gap-2">
                {encryptionStatus.enabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Cryptage actif</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        Toutes les données sont cryptées (AES-256)
                        {encryptionStatus.activatedAt && ` — activé le ${new Date(encryptionStatus.activatedAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Cryptage inactif</p>
                      <p className="text-xs text-slate-500">Les données ne sont pas cryptées</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Activate/Deactivate */}
            {!encryptionStatus.enabled ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Clé de cryptage (minimum 10 caractères)
                </label>
                <div className="relative">
                  <Input
                    type={showEncryptionKey ? 'text' : 'password'}
                    value={encryptionKey}
                    onChange={e => setEncryptionKey(e.target.value)}
                    placeholder="Saisissez une clé de cryptage sécurisée"
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
                {encryptionKey.length > 0 && encryptionKey.length < 10 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Encore {10 - encryptionKey.length} caractère(s) requis
                  </p>
                )}
                {encryptionKey.length >= 10 && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Clé valide
                  </p>
                )}
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Mémorisez cette clé ! Elle est nécessaire pour accéder aux données. Sans elle, les données seront irrécupérables.</span>
                  </p>
                </div>
                <Button
                  onClick={handleActivateEncryption}
                  disabled={encryptionKey.length < 10 || activatingEncryption}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                  {activatingEncryption ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Cryptage en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Activer le cryptage
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeactivateDialog(true)}
                className={`${premiumBtnClass} bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-300/30 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-rose-500/20`}
              >
                <Lock className="w-4 h-4 mr-2" /> Désactiver le cryptage
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ========== DELETE USER DIALOG ========== */}
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

      {/* ========== ROLE CHANGE DIALOG ========== */}
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

      {/* ========== SPECIFICATION DIALOG ========== */}
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

      {/* ========== DEACTIVATE ENCRYPTION DIALOG ========== */}
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
