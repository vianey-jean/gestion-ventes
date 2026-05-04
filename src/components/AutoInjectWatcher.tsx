/**
 * AutoInjectWatcher — Modal globale persistante (bas-gauche)
 * Vérifie 5min après connexion admin si la base est vide.
 * Si oui, propose de restaurer depuis un fichier crypté.
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';
import settingsApi from '@/services/api/settingsApi';

const CHRONO_MS = 5 * 60 * 1000;

const AutoInjectWatcher: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreFile, setRestoreFile] = useState<any>(null);
  const [restoreFileName, setRestoreFileName] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const role = (user as any)?.role;
  const isAdmin = role === 'administrateur' || role === 'administrateur principale';

  const checkNeeds = async (): Promise<boolean> => {
    try {
      const res = await api.get('/api/settings/needs-injection');
      return !!res.data?.needsInjection;
    } catch { return false; }
  };

  useEffect(() => {
    const cleanup = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
    cleanup();
    if (!isAuthenticated || !isAdmin) { setShowModal(false); return cleanup; }

    let cancelled = false;
    (async () => {
      const needs = await checkNeeds();
      if (cancelled || !needs) return;
      // Démarrer chrono 5min
      timerRef.current = setTimeout(async () => {
        const stillNeeds = await checkNeeds();
        if (stillNeeds) setShowModal(true);
      }, CHRONO_MS);
      // Poll toutes les 30s : si données injectées entre temps, on annule
      pollRef.current = setInterval(async () => {
        const stillNeeds = await checkNeeds();
        if (!stillNeeds) {
          if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
          setShowModal(false);
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      }, 30000);
    })();

    return () => { cancelled = true; cleanup(); };
  }, [isAuthenticated, isAdmin]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setRestoreFileName(f.name);
    const r = new FileReader();
    r.onload = (ev) => {
      try { setRestoreFile(JSON.parse(ev.target?.result as string)); setShowRestore(true); }
      catch { toast({ title: 'Erreur', description: 'Fichier invalide', variant: 'destructive' }); }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  const handleRestore = async () => {
    if (!restoreFile || !code) return;
    try {
      setRestoring(true);
      const res = await settingsApi.restoreData(restoreFile, code);
      if (res.success) {
        toast({ title: '✅ Données injectées', description: res.message, className: 'bg-green-600 text-white border-green-600' });
        setShowRestore(false); setShowModal(false); setCode(''); setRestoreFile(null);
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Code incorrect', variant: 'destructive' });
    } finally { setRestoring(false); }
  };

  if (!isAdmin || !isAuthenticated) return null;

  return (
    <>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      <AnimatePresence>
        {showModal && !showRestore && (
          <>
            {/* Overlay bloquant : aucune interaction possible ailleurs */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: -50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -50, y: 20 }}
              className="fixed bottom-4 left-4 z-[9998] max-w-sm"
            >
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-slate-900/95 via-violet-950/90 to-indigo-950/95 border border-violet-400/30 shadow-2xl shadow-violet-500/30 p-5">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 animate-pulse" />
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50 shrink-0">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Injection requise</h3>
                    <p className="text-xs text-violet-200/80 leading-relaxed">
                      Une ou plusieurs bases de données sont vides. Veuillez injecter des données avant de continuer.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowModal(false)}
                    className="rounded-xl text-xs bg-white/5 border-white/20 text-white hover:bg-white/10">Non</Button>
                  <Button size="sm" onClick={() => fileRef.current?.click()}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:scale-105 transition text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Oui, injecter
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRestore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-slate-900/95 via-violet-950/90 to-indigo-950/95 border border-violet-400/30 shadow-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-violet-400" /> Restaurer les données
              </h3>
              <p className="text-xs text-violet-200/70 mb-4">
                Fichier : <strong className="text-white">{restoreFileName}</strong>
              </p>
              <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider block mb-2">Code de cryptage</label>
              <div className="relative mb-4">
                <Input type={showCode ? 'text' : 'password'} value={code} onChange={e => setCode(e.target.value)}
                  placeholder="Saisissez le code"
                  className="rounded-xl bg-white/5 border-violet-400/30 text-white pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-300 hover:text-white">
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowRestore(false); setCode(''); setRestoreFile(null); }}
                  className="rounded-xl">Annuler</Button>
                <Button size="sm" onClick={handleRestore} disabled={!code || restoring}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                  {restoring ? 'Restauration...' : '📥 Restaurer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AutoInjectWatcher;
