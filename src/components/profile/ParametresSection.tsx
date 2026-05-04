import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Trash2, Upload, Download, Shield, Eye, EyeOff, AlertTriangle,
  ChevronDown, ChevronUp, CalendarOff,
  StopCircle, PlayCircle, DatabaseZap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import settingsApi, { AppSettings } from '@/services/api/settingsApi';
import api from '@/service/api';
import IndisponibiliteSection from './IndisponibiliteSection';
import ModuleSettingsSection from './ModuleSettingsSection';
import BulkDeleteModal from './BulkDeleteModal';
import PremiumLoading from '@/components/ui/premium-loading';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

interface ParametresSectionProps {
  userRole?: string;
}

const ParametresSection: React.FC<ParametresSectionProps> = ({ userRole }) => {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminPrincipal = userRole === 'administrateur principale';
  const isAdmin = userRole === 'administrateur' || isAdminPrincipal;

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [, setIsAdminFromServer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    notifications: true,
    display: true,
    security: true,
    backup: false
  });

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);
  const [isDeletePasswordValid, setIsDeletePasswordValid] = useState(false);

  // Backup state
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [isBackupCodeValid, setIsBackupCodeValid] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Restore state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [showRestoreCode, setShowRestoreCode] = useState(false);
  const [isRestoreCodeValid, setIsRestoreCodeValid] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<any>(null);
  const [restoreFileName, setRestoreFileName] = useState('');

  // Bulk delete modal state
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Auto-backup state
  const autoBackupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastServerChangeAtRef = useRef<string | null>(null);
  const countdownActivationIdRef = useRef<string | null>(null);
  const blockedActivationIdRef = useRef<string | null>(null);
  const autoBackupInProgressRef = useRef(false);
  const manualBackupDoneRef = useRef(false);
  const [autoBackupPending, setAutoBackupPending] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [autoBackupPaused, setAutoBackupPaused] = useState(false);
  const [autoInjecter, setAutoInjecter] = useState(true);

  // Load auto-sauvegarde status from server on mount
  useEffect(() => {
    const loadAutoSauvegardeStatus = async () => {
      try {
        const response = await api.get('/api/settings/auto-sauvegarde');
        if (response.data && typeof response.data.autoSauvegarde === 'boolean') {
          setAutoBackupPaused(!response.data.autoSauvegarde);
        }
      } catch (e) {
        console.error('Error loading auto-sauvegarde status:', e);
      }
    };
    if (isAdmin) {
      loadAutoSauvegardeStatus();
      api.get('/api/settings/auto-injecter').then(r => {
        if (typeof r.data?.autoInjecter === 'boolean') setAutoInjecter(r.data.autoInjecter);
      }).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const clearAutoBackupCountdown = useCallback(() => {
    if (autoBackupTimerRef.current) {
      clearTimeout(autoBackupTimerRef.current);
      autoBackupTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    countdownActivationIdRef.current = null;
    setAutoBackupPending(false);
    setCountdownSeconds(0);
  }, []);

  const triggerAutoBackup = useCallback(async () => {
    if (manualBackupDoneRef.current || autoBackupInProgressRef.current || autoBackupPaused) {
      setAutoBackupPending(false);
      return;
    }

    autoBackupInProgressRef.current = true;

    try {
      const currentActivationId = countdownActivationIdRef.current;

      // Get the stored password from sessionStorage
      const encodedPw = sessionStorage.getItem('_abk');
      if (!encodedPw) {
        console.warn('Auto-backup: no password available');
        blockedActivationIdRef.current = currentActivationId;
        clearAutoBackupCountdown();
        return;
      }

      const password = atob(encodedPw);
      const result = await settingsApi.autoBackup(password);

      if (result.success) {
        // Download the backup file automatically
        const blob = new Blob([JSON.stringify(result.backup)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Generate auto-backup filename: auto-backup-riziky-{nom}-{date}
        // Use server-provided filename first, fallback to localStorage user_name, then auth user
        const serverFilename = result.filename;
        let autoBackupFilename: string;
        if (serverFilename && !serverFilename.includes('inconnu')) {
          autoBackupFilename = serverFilename;
        } else {
          const storedName = localStorage.getItem('user_name');
          const authName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
          const userName = storedName || authName || 'inconnu';
          const today = new Date().toISOString().split('T')[0];
          autoBackupFilename = `auto-backup-riziky-${userName.replace(/\s+/g, '-')}-${today}.json`;
        }
        a.download = autoBackupFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: '🔄 Sauvegarde automatique effectuée',
          description: 'Le fichier de sauvegarde a été téléchargé automatiquement (crypté avec votre mot de passe)',
          className: 'bg-blue-600 text-white border-blue-600'
        });

        clearAutoBackupCountdown();
        manualBackupDoneRef.current = true; // Prevent further auto-backups until new data
      }
    } catch (e) {
      console.error('Auto-backup failed:', e);
      blockedActivationIdRef.current = countdownActivationIdRef.current;
      toast({
        title: 'Sauvegarde automatique échouée',
        description: 'La sauvegarde automatique n\'a pas pu être effectuée',
        variant: 'destructive'
      });
      clearAutoBackupCountdown();
    } finally {
      autoBackupInProgressRef.current = false;
    }
  }, [clearAutoBackupCountdown, toast, autoBackupPaused]);

  const startAutoBackupCountdown = useCallback((serverState: any) => {
    if (!serverState?.activationId || manualBackupDoneRef.current || autoBackupPaused) {
      return;
    }

    const countdownStartedAt = serverState.countdownStartedAt
      ? new Date(serverState.countdownStartedAt).getTime()
      : Date.now();
    const countdownDurationMs = Number(serverState.countdownDurationMs) > 0
      ? Number(serverState.countdownDurationMs)
      : 5 * 60 * 1000;

    const getRemainingSeconds = () => Math.max(
      0,
      Math.ceil((countdownDurationMs - (Date.now() - countdownStartedAt)) / 1000)
    );

    clearAutoBackupCountdown();
    countdownActivationIdRef.current = serverState.activationId;

    const initialSeconds = getRemainingSeconds();
    if (initialSeconds <= 0) {
      triggerAutoBackup();
      return;
    }

    setAutoBackupPending(true);
    setCountdownSeconds(initialSeconds);

    countdownIntervalRef.current = setInterval(() => {
      const remainingSeconds = getRemainingSeconds();
      setCountdownSeconds(remainingSeconds);

      if (remainingSeconds <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        triggerAutoBackup();
      }
    }, 1000);
  }, [clearAutoBackupCountdown, triggerAutoBackup, autoBackupPaused]);

  // ========== AUTO-BACKUP: piloté par l'état stable du serveur ==========
  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    const syncAutoBackupState = async () => {
      try {
        // Check server-side auto-sauvegarde flag
        try {
          const autoSavResponse = await api.get('/api/settings/auto-sauvegarde');
          if (!isMounted) return;
          if (autoSavResponse.data && autoSavResponse.data.autoSauvegarde === false) {
            setAutoBackupPaused(true);
            clearAutoBackupCountdown();
            return;
          }
        } catch { /* silent */ }

        const response = await api.get('/api/sync/status');
        if (!isMounted) return;

        const serverState = response.data?.autoBackupState;
        if (!serverState) return;

        if (serverState.lastChangeAt && serverState.lastChangeAt !== lastServerChangeAtRef.current) {
          lastServerChangeAtRef.current = serverState.lastChangeAt;
          manualBackupDoneRef.current = false;
          blockedActivationIdRef.current = null;
        }

        if (serverState.signal && serverState.activationId) {
          if (blockedActivationIdRef.current === serverState.activationId) {
            return;
          }

          if (countdownActivationIdRef.current !== serverState.activationId) {
            startAutoBackupCountdown(serverState);
          }
          return;
        }

        if (countdownActivationIdRef.current) {
          clearAutoBackupCountdown();
        }
      } catch {
        // Silent
      }
    };

    const pollInterval = setInterval(syncAutoBackupState, 5000);
    syncAutoBackupState();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearAutoBackupCountdown();
    };
  }, [clearAutoBackupCountdown, isAdmin, startAutoBackupCountdown]);

  const defaultSettings: AppSettings = {
    siteName: 'Riziky', language: 'fr', timezone: 'Indian/Reunion', currency: 'EUR', dateFormat: 'DD/MM/YYYY',
    notifications: { rdvReminder: true, rdvReminderMinutes: 30, tacheReminder: true, emailNotifications: false, soundEnabled: true },
    display: { itemsPerPage: 10, theme: 'system', compactMode: false, showWelcomeMessage: true },
    security: { sessionTimeoutMinutes: 60, maxLoginAttempts: 5, requireStrongPassword: true },
    backup: { lastBackupDate: null, autoBackup: false, autoBackupIntervalDays: 7 },
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsApi.getSettings();
      // Merge with defaults to prevent undefined nested objects
      const merged: AppSettings = {
        ...defaultSettings,
        ...result.settings,
        notifications: { ...defaultSettings.notifications, ...(result.settings?.notifications || {}) },
        display: { ...defaultSettings.display, ...(result.settings?.display || {}) },
        security: { ...defaultSettings.security, ...(result.settings?.security || {}) },
        backup: { ...defaultSettings.backup, ...(result.settings?.backup || {}) },
      };
      setSettings(merged);
      setIsAdminFromServer(result.isAdmin);
    } catch (e) {
      console.error('Error fetching settings:', e);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(p => ({ ...p, [key]: !p[key] }));
  };

  // ========== BACKUP (manual - cancels auto-backup) ==========
  const handleBackup = async () => {
    try {
      setBackingUp(true);
      const result = await settingsApi.backupData(backupCode);
      if (result.success) {
        // Cancel auto-backup since manual backup was done
        manualBackupDoneRef.current = true;
        clearAutoBackupCountdown();

        const blob = new Blob([JSON.stringify(result.backup)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: '✅ Sauvegarde réussie', description: 'Le fichier a été téléchargé. Gardez votre code en sécurité !', className: 'bg-green-600 text-white border-green-600' });
        setShowBackupDialog(false);
        setBackupCode('');
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'destructive' });
    } finally {
      setBackingUp(false);
    }
  };

  // ========== RESTORE ==========
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setRestoreFile(data);
        setShowRestoreDialog(true);
      } catch {
        toast({ title: 'Erreur', description: 'Fichier invalide. Sélectionnez un fichier de sauvegarde valide.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    try {
      setRestoring(true);
      const result = await settingsApi.restoreData(restoreFile, restoreCode);
      if (result.success) {
        if (result.status === 'unchanged') {
          toast({
            title: '⚠️ Aucune nouvelle donnée',
            description: result.message,
            className: 'bg-yellow-500 text-black border-yellow-500'
          });
        } else {
          toast({
            title: '✅ Restauration réussie',
            description: result.message,
            className: 'bg-green-600 text-white border-green-600'
          });
        }
        setShowRestoreDialog(false);
        setRestoreCode('');
        setRestoreFile(null);
        fetchSettings();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Code incorrect ou fichier corrompu';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setRestoring(false);
    }
  };

  // Toggle component
  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${value ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  // Section header
  const SectionHeader = ({ icon: Icon, title, sectionKey, color }: { icon: any; title: string; sectionKey: string; color: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-3 group"
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {expandedSections[sectionKey] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <PremiumLoading text="Chargement des paramètres..." size="lg" overlay={false} variant="default" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Paramètres</h3>
              <p className="text-xs text-muted-foreground">Configuration du site et gestion des données</p>
            </div>
           </div>

          {/* Indisponibilités / Congés */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <IndisponibiliteSection />
          </div>

          {/* Module Settings */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">Paramètres des modules</span>
            </div>
            <ModuleSettingsSection />
          </div>

          {/* BULK DELETE BUTTON - admin principale only */}
          {isAdminPrincipal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-6">
              <Button
                onClick={() => setShowBulkDelete(true)}
                className="w-full group relative overflow-hidden rounded-2xl backdrop-blur-xl border border-red-300/30 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-rose-500/20 hover:scale-[1.02] transition-all duration-300 px-5 py-3 text-sm font-bold shadow-lg shadow-red-500/5 hover:shadow-red-500/15"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Suppression des données
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 font-mono">Sélectif</span>
              </Button>
            </motion.div>
          )}

          {/* ADMIN BUTTONS: Backup/Restore for both admin roles, Delete only for admin principale */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Zone Administrateur</span>
                {!autoBackupPaused ? (
                  <button
                    onClick={async () => {
                      setAutoBackupPaused(true);
                      clearAutoBackupCountdown();
                      try {
                        await api.put('/api/settings/auto-sauvegarde', { autoSauvegarde: false });
                      } catch (e) { console.error('Error saving auto-sauvegarde:', e); }
                      toast({ title: '⏹ Sauvegarde auto arrêtée', description: 'La sauvegarde automatique est désactivée', className: 'bg-red-600 text-white border-red-600' });
                    }}
                    title="Arrêter la sauvegarde automatique"
                    className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <StopCircle className="w-4 h-4 text-red-500" />
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setAutoBackupPaused(false);
                      manualBackupDoneRef.current = false;
                      lastServerChangeAtRef.current = null;
                      try {
                        await api.put('/api/settings/auto-sauvegarde', { autoSauvegarde: true });
                      } catch (e) { console.error('Error saving auto-sauvegarde:', e); }
                      toast({ title: '▶ Sauvegarde auto relancée', description: 'La sauvegarde automatique est réactivée', className: 'bg-green-600 text-white border-green-600' });
                    }}
                    title="Relancer la sauvegarde automatique"
                    className="p-0.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 text-green-500" />
                  </button>
                )}
                {autoBackupPending && countdownSeconds > 0 && !autoBackupPaused && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse font-mono">
                    Sauvegarde auto dans {Math.floor(countdownSeconds / 60)} min {String(countdownSeconds % 60).padStart(2, '0')} s
                  </span>
                )}
                {autoBackupPaused && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-mono">
                    Auto-sauvegarde arrêté
                  </span>
                )}
                <button
                  onClick={async () => {
                    const next = !autoInjecter;
                    setAutoInjecter(next);
                    try {
                      await api.put('/api/settings/auto-injecter', { autoInjecter: next });
                      toast({
                        title: next ? '✅ Auto-injection activée' : '⏹ Auto-injection désactivée',
                        description: next ? 'La détection automatique d\'injection est active' : 'La détection automatique est désactivée',
                        className: next ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                      });
                    } catch { /* silent */ }
                  }}
                  title={autoInjecter ? 'Désactiver demande injection automatique' : 'Activer demande injection automatique'}
                  className={`ml-1 p-0.5 rounded-full transition-colors ${autoInjecter ? 'hover:bg-violet-100 dark:hover:bg-violet-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                  <DatabaseZap className={`w-4 h-4 ${autoInjecter ? 'text-violet-500' : 'text-gray-400'}`} />
                </button>
                {!autoInjecter && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                    Auto-injection arrêtée
                  </span>
                )}
              </div>

              <div className={`grid grid-cols-1 ${isAdminPrincipal ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                {/* SAVE BUTTON */}
                <Button
                  onClick={() => setShowBackupDialog(true)}
                  className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-300/30 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>

                {/* INJECT BUTTON */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className={`${premiumBtnClass} bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-300/30 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-indigo-500/20`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Injecter
                </Button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

                {/* DELETE BUTTON - Only for administrateur principale */}
                {isAdminPrincipal && (
                  <Button
                    onClick={() => { setShowDeleteDialog(true); setDeletePassword(''); setConfirmDeleteStep(false); setIsDeletePasswordValid(false); }}
                    className={`${premiumBtnClass} bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-300/30 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-rose-500/20`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer tout
                  </Button>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>


      {/* ========== DELETE ALL DIALOG ========== */}
      <AlertDialog open={showDeleteDialog} onOpenChange={v => { setShowDeleteDialog(v); if (!v) { setDeletePassword(''); setConfirmDeleteStep(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Supprimer toutes les données
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {!confirmDeleteStep ? (
                <>
                  <span className="block text-red-500 font-bold">⚠️ Cette action est IRRÉVERSIBLE !</span>
                  <span className="block">Toutes les données seront supprimées sauf votre compte administrateur principal. Saisissez votre mot de passe pour continuer.</span>
                </>
              ) : (
                <>
                  <span className="block text-red-500 font-bold">⚠️ DERNIÈRE CONFIRMATION</span>
                  <span className="block">Êtes-vous absolument certain de vouloir supprimer toutes les données ? Cette action ne peut pas être annulée. Vous serez déconnecté automatiquement après la suppression.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!confirmDeleteStep && (
            <div className="space-y-4 py-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showDeletePw ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  autoComplete="current-password"
                  className="rounded-xl border-red-200/30 dark:border-red-800/20 pr-10"
                />
                <button type="button" onClick={() => setShowDeletePw(!showDeletePw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showDeletePw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthChecker password={deletePassword} onValidityChange={setIsDeletePasswordValid} />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            {!confirmDeleteStep ? (
              <Button
                onClick={async () => {
                  if (!deletePassword) return;
                  try {
                    const result = await settingsApi.verifyPassword(deletePassword);
                    if (result.valid) {
                      setConfirmDeleteStep(true);
                    } else {
                      toast({ title: 'Erreur', description: 'Mot de passe incorrect', variant: 'destructive' });
                    }
                  } catch (e: any) {
                    toast({ title: 'Erreur', description: e?.response?.data?.message || 'Mot de passe incorrect', variant: 'destructive' });
                  }
                }}
                disabled={!deletePassword || !isDeletePasswordValid}
                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
              >
                Vérifier le mot de passe
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    setDeleting(true);
                    const result = await settingsApi.deleteAllData(deletePassword);
                    if (result.success) {
                      toast({ title: '✅ Données supprimées', description: result.message, className: 'bg-green-600 text-white border-green-600' });
                      setShowDeleteDialog(false);
                      setDeletePassword('');
                      setConfirmDeleteStep(false);
                      // Auto-logout after deletion
                      setTimeout(() => {
                        logout();
                      }, 1500);
                    }
                  } catch (e: any) {
                    toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la suppression', variant: 'destructive' });
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
              >
                {deleting ? 'Suppression...' : '🗑️ Supprimer définitivement'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== BACKUP DIALOG ========== */}
      <AlertDialog open={showBackupDialog} onOpenChange={v => { setShowBackupDialog(v); if (!v) { setBackupCode(''); setIsBackupCodeValid(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-emerald-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <Download className="w-5 h-5" /> Sauvegarder les données
            </AlertDialogTitle>
            <AlertDialogDescription>
              Créez un code de cryptage pour protéger votre sauvegarde. Ce code sera nécessaire pour restaurer les données.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Code de cryptage
            </label>
            <div className="relative">
              <Input
                type={showBackupCode ? 'text' : 'password'}
                value={backupCode}
                onChange={e => setBackupCode(e.target.value)}
                placeholder="Créez un code de cryptage sécurisé"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="rounded-xl border-emerald-200/30 dark:border-emerald-800/20 pr-10"
              />
              <button type="button" onClick={() => setShowBackupCode(!showBackupCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showBackupCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthChecker password={backupCode} onValidityChange={setIsBackupCodeValid} />
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Mémorisez bien ce code ! Sans lui, les données ne pourront pas être restaurées.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={handleBackup}
              disabled={!isBackupCodeValid || backingUp}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            >
              {backingUp ? 'Sauvegarde...' : '📦 Sauvegarder et télécharger'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== RESTORE DIALOG ========== */}
      <AlertDialog open={showRestoreDialog} onOpenChange={v => { setShowRestoreDialog(v); if (!v) { setRestoreCode(''); setRestoreFile(null); setIsRestoreCodeValid(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-blue-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-600">
              <Upload className="w-5 h-5" /> Restaurer les données
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fichier sélectionné : <strong>{restoreFileName}</strong>
              <br />Saisissez le code de cryptage utilisé lors de la sauvegarde.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Code de décryptage
            </label>
            <div className="relative">
              <Input
                type={showRestoreCode ? 'text' : 'password'}
                value={restoreCode}
                onChange={e => setRestoreCode(e.target.value)}
                placeholder="Saisissez le code de sauvegarde"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="rounded-xl border-blue-200/30 dark:border-blue-800/20 pr-10"
              />
              <button type="button" onClick={() => setShowRestoreCode(!showRestoreCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showRestoreCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthChecker password={restoreCode} onValidityChange={setIsRestoreCodeValid} />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={handleRestore}
              disabled={!isRestoreCodeValid || restoring}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              {restoring ? 'Restauration...' : '📥 Restaurer les données'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK DELETE MODAL */}
      <BulkDeleteModal open={showBulkDelete} onOpenChange={setShowBulkDelete} />
    </>
  );
};

export default ParametresSection;
