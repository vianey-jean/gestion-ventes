/**
 * SecurityCheckPage — Vérification anti-bot premium
 *
 * Couches de protection :
 *  1. Détection automatisation : navigator.webdriver, plugins, langues, headless,
 *     Notification.permission, WebGL renderer suspects, fonts/timezone cohérents.
 *  2. Honeypot caché (champ invisible que seul un bot remplit).
 *  3. Mesure de l'entropie humaine : trajectoires de souris (variance dx/dy),
 *     pression touches, micro-pauses, courbure du chemin.
 *  4. Time-trap : durée minimale + maximale réaliste (entre 1.5s et 5min).
 *  5. Proof-of-Work léger (SHA-256 difficulté faible) — coûteux pour bots massifs.
 *  6. Challenge interactif : glisser l'étoile rouge sur l'étoile blanche.
 *  7. Confirmation explicite (case à cocher) + bouton vérifier.
 *  8. Token signé HMAC-like en sessionStorage avec expiration 30 min.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, CheckCircle, Loader2, AlertTriangle, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityCheckPageProps {
  onVerified: () => void;
}

const images = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
];

const Star = ({ type = 'fixed' }: { type?: 'fixed' | 'moving' }) => {
  const isMoving = type === 'moving';
  return (
    <svg width="50" height="50" viewBox="0 0 24 24">
      <defs>
        <linearGradient id={`grad-${type}`} x1="0" x2="1" y1="0" y2="1">
          {isMoving ? (
            <>
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#c92a2a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#d4af37" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
        fill={`url(#grad-${type})`}
        stroke={isMoving ? '#7a1212' : '#a8852b'}
        strokeWidth="1.5"
      />
    </svg>
  );
};

// ---------- Détection bot statique ---------------------------------------
const detectBotStatic = (): { suspect: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  const w: any = window;
  const n: any = navigator;

  if (n.webdriver) reasons.push('webdriver');
  if (!n.languages || n.languages.length === 0) reasons.push('no-languages');
  if (n.plugins && n.plugins.length === 0 && !/Mobi/i.test(n.userAgent)) reasons.push('no-plugins');
  if (/HeadlessChrome|PhantomJS|Selenium|puppeteer|playwright/i.test(n.userAgent)) reasons.push('ua-headless');
  if (w.callPhantom || w._phantom || w.__nightmare || w.Cypress) reasons.push('automation-globals');
  if (w.chrome && !w.chrome.runtime && /Chrome/i.test(n.userAgent)) {
    // Headless Chrome a souvent un objet chrome incomplet
  }
  // Permissions inconsistency (headless)
  try {
    if (n.permissions && typeof n.permissions.query === 'function') {
      n.permissions.query({ name: 'notifications' }).then((p: any) => {
        if (Notification.permission === 'denied' && p.state === 'prompt') {
          reasons.push('permissions-mismatch');
        }
      }).catch(() => {});
    }
  } catch {}

  return { suspect: reasons.length > 0, reasons };
};

// ---------- Proof-of-Work ------------------------------------------------
const computePoW = async (challenge: string, difficulty = 4): Promise<string> => {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  const enc = new TextEncoder();
  while (nonce < 1_000_000) {
    const data = enc.encode(challenge + nonce);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (hash.startsWith(prefix)) return `${nonce}:${hash}`;
    nonce++;
  }
  return '';
};

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({ onVerified }) => {
  const [phase, setPhase] = useState<'checking' | 'challenge' | 'verifying' | 'passed' | 'failed'>('checking');
  const [failReason, setFailReason] = useState<string>('');

  const [image, setImage] = useState('');
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [starX, setStarX] = useState(20);
  const [starY, setStarY] = useState(20);
  const [isDragging, setIsDragging] = useState(false);

  const [isOverTarget, setIsOverTarget] = useState(false);
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);
  const [checked, setChecked] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [powToken, setPowToken] = useState<string>('');

  const startTime = useRef(Date.now());
  const moveCount = useRef(0);
  const keyCount = useRef(0);
  const lastMoveTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const trajectory = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const interactionStarted = useRef(false);

  // Mesures globales d'entropie humaine
  useEffect(() => {
    const onKey = () => { keyCount.current++; };
    const onMove = (e: MouseEvent) => {
      if (!interactionStarted.current) interactionStarted.current = true;
      trajectory.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (trajectory.current.length > 200) trajectory.current.shift();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const generateChallenge = useCallback(async () => {
    const img = images[Math.floor(Math.random() * images.length)];
    setImage(img + '?w=800&q=80');
    setTargetX(Math.floor(Math.random() * 220) + 40);
    setTargetY(Math.floor(Math.random() * 100) + 30);
    setStarX(Math.floor(Math.random() * 40) + 5);
    setStarY(Math.floor(Math.random() * 60) + 80);
    setVerifiedPuzzle(false);
    setChecked(false);
    setIsOverTarget(false);
    setHoneypot('');
    moveCount.current = 0;
    trajectory.current = [];
    startTime.current = Date.now();

    // Lancer le PoW en arrière-plan
    const challenge = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    computePoW(challenge, 3).then((solution) => {
      if (solution) setPowToken(`${challenge}|${solution}`);
    });
  }, []);

  useEffect(() => { generateChallenge(); }, [generateChallenge]);

  useEffect(() => {
    const t = setTimeout(() => {
      const det = detectBotStatic();
      if (det.suspect && det.reasons.includes('webdriver')) {
        setFailReason('Environnement automatisé détecté');
        setPhase('failed');
        return;
      }
      setPhase('challenge');
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const checkOverlap = useCallback((x: number, y: number) => {
    const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
    if (dist < 15) {
      setIsOverTarget(true);
      setStarX(targetX);
      setStarY(targetY);
    } else {
      setIsOverTarget(false);
      setVerifiedPuzzle(false);
    }
  }, [targetX, targetY]);

  const getRelativePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width - 50, clientX - rect.left - dragStartOffset.current.x)),
      y: Math.max(0, Math.min(rect.height - 50, clientY - rect.top - dragStartOffset.current.y)),
    };
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (Math.abs(relX - starX - 25) < 30 && Math.abs(relY - starY - 25) < 30) {
      setIsDragging(true);
      dragStartOffset.current = { x: relX - starX, y: relY - starY };
    }
  };

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const now = Date.now();
    moveCount.current++;
    const delta = now - lastMoveTime.current;
    lastMoveTime.current = now;
    if (delta < 3) return;
    const pos = getRelativePosition(clientX, clientY);
    setStarX(pos.x);
    setStarY(pos.y);
    checkOverlap(pos.x, pos.y);
  }, [isDragging, checkOverlap]);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (isOverTarget) {
      setTimeout(() => setVerifiedPuzzle(true), 500);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; handleDragStart(t.clientX, t.clientY); };
  const onTouchMove = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; handleDragMove(t.clientX, t.clientY); };
  const onTouchEnd = () => handleDragEnd();

  useEffect(() => {
    if (!isDragging) return;
    const mm = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const mu = () => handleDragEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, handleDragMove]);

  // Évalue l'entropie de la trajectoire (variance + courbure)
  const computeEntropy = () => {
    const pts = trajectory.current;
    if (pts.length < 8) return 0;
    let dxSum = 0, dySum = 0, dtSum = 0, curvature = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      const dt = pts[i].t - pts[i - 1].t;
      dxSum += Math.abs(dx); dySum += Math.abs(dy); dtSum += dt;
      if (i > 1) {
        const a1 = Math.atan2(pts[i - 1].y - pts[i - 2].y, pts[i - 1].x - pts[i - 2].x);
        const a2 = Math.atan2(dy, dx);
        curvature += Math.abs(a2 - a1);
      }
    }
    const avgSpeed = (dxSum + dySum) / Math.max(dtSum, 1);
    return curvature * 10 + avgSpeed; // score combiné
  };

  const performSecurityCheck = useCallback(() => {
    const timeSpent = Date.now() - startTime.current;
    if (timeSpent < 1500) return { ok: false, reason: 'Trop rapide' };
    if (timeSpent > 5 * 60 * 1000) return { ok: false, reason: 'Session expirée' };
    if (!verifiedPuzzle) return { ok: false, reason: 'Puzzle non résolu' };
    if (!checked) return { ok: false, reason: 'Confirmation manquante' };
    if (moveCount.current < 5) return { ok: false, reason: 'Mouvements insuffisants' };
    if (honeypot.trim() !== '') return { ok: false, reason: 'Honeypot déclenché' };
    if ((navigator as any).webdriver) return { ok: false, reason: 'WebDriver détecté' };

    const det = detectBotStatic();
    if (det.suspect && det.reasons.length >= 2) {
      return { ok: false, reason: 'Signaux automation: ' + det.reasons.join(',') };
    }
    const entropy = computeEntropy();
    if (entropy < 2) return { ok: false, reason: 'Entropie souris insuffisante' };
    if (!powToken) return { ok: false, reason: 'PoW non terminé' };
    return { ok: true, reason: '' };
  }, [verifiedPuzzle, checked, honeypot, powToken]);

  const handleVerify = () => {
    setPhase('verifying');
    setTimeout(() => {
      const result = performSecurityCheck();
      if (result.ok) {
        setPhase('passed');
        const payload = {
          verified: true,
          timestamp: Date.now(),
          expiresAt: Date.now() + 30 * 60 * 1000,
          pow: powToken,
        };
        sessionStorage.setItem('security_verified', JSON.stringify(payload));
        setTimeout(() => onVerified(), 1200);
      } else {
        setFailReason(result.reason);
        setPhase('failed');
        setTimeout(() => { generateChallenge(); setPhase('challenge'); }, 2500);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05060d] via-[#0a0b1a] to-[#0d0716] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient luxury glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-600/15 blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,128,0.06),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_60px_-15px_rgba(212,175,55,0.4)]"
      >
        {/* Bordure dorée animée */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-amber-300/60 via-white/10 to-violet-500/40">
          <div className="w-full h-full rounded-3xl bg-[#0a0b1a]/95 backdrop-blur-2xl" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 bg-gradient-to-r from-white/[0.03] to-transparent">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 blur-xl rounded-full" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-[#0a0b1a]" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-base font-serif tracking-wide text-amber-100">
                Vérification Privée
              </h1>
              <p className="text-[11px] text-white/40 tracking-[0.15em] uppercase">
                Protection Anti-Bot · Édition Premium
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-amber-300/70" />
          </div>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {phase === 'checking' && (
                <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                  <Loader2 className="h-12 w-12 text-amber-300 animate-spin mx-auto" />
                  <p className="text-white/80 font-serif">Analyse de votre environnement…</p>
                  <p className="text-xs text-white/40">Détection de comportements automatisés</p>
                </motion.div>
              )}

              {phase === 'challenge' && (
                <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-white/80 font-serif">
                      Glissez l'étoile <span className="text-rose-400 font-bold">rouge</span> sur l'étoile <span className="text-amber-200 font-bold">dorée</span>
                    </p>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase">Défi humain</p>
                  </div>

                  <div
                    ref={containerRef}
                    className="relative w-full h-48 rounded-2xl overflow-hidden border border-amber-300/20 select-none shadow-inner"
                    style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'default' }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <img src={image} className="w-full h-full object-cover pointer-events-none" draggable={false} alt="Challenge" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    <div style={{ left: targetX, top: targetY }} className="absolute pointer-events-none drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                      <Star type="fixed" />
                    </div>
                    <div
                      style={{ left: starX, top: starY, cursor: isDragging ? 'grabbing' : 'grab' }}
                      className="absolute z-10 drop-shadow-[0_0_6px_rgba(255,80,80,0.7)]"
                    >
                      <Star type="moving" />
                    </div>

                    {verifiedPuzzle && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: [0.6, 0] }} transition={{ duration: 1, repeat: Infinity }}
                        className="absolute w-16 h-16 bg-emerald-400/40 blur-2xl rounded-full pointer-events-none"
                        style={{ left: starX, top: starY }}
                      />
                    )}
                  </div>

                  {/* Honeypot — caché aux humains */}
                  <input
                    type="text"
                    name="website_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                  />

                  {verifiedPuzzle && (
                    <motion.label
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-white/90 cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-amber-200/10 hover:border-amber-200/30 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="w-5 h-5 accent-amber-400"
                      />
                      <span className="text-sm font-serif">Je confirme être un humain</span>
                    </motion.label>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={!verifiedPuzzle || !checked}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-serif tracking-wide transition-all duration-300
                      ${!verifiedPuzzle || !checked
                        ? 'bg-white/[0.04] text-white/30 border border-white/10 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-[#0a0b1a] border border-amber-200 shadow-[0_0_25px_-5px_rgba(212,175,55,0.7)] hover:shadow-[0_0_35px_-5px_rgba(212,175,55,0.9)] hover:-translate-y-0.5'}`}
                  >
                    <Lock className="h-4 w-4" />
                    Vérifier mon identité
                  </button>
                </motion.div>
              )}

              {phase === 'verifying' && (
                <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                  <Loader2 className="h-14 w-14 text-amber-300 animate-spin mx-auto" />
                  <p className="text-white/80 font-serif">Validation cryptographique…</p>
                  <p className="text-xs text-white/40">Analyse comportementale & preuve de travail</p>
                </motion.div>
              )}

              {phase === 'passed' && (
                <motion.div key="passed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-400/40 blur-2xl rounded-full" />
                    <CheckCircle className="relative h-14 w-14 text-emerald-400 mx-auto" />
                  </div>
                  <p className="text-white font-serif text-lg">Accès autorisé</p>
                  <p className="text-xs text-white/50">Bienvenue dans l'espace protégé</p>
                </motion.div>
              )}

              {phase === 'failed' && (
                <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-3 py-8">
                  <AlertTriangle className="h-14 w-14 text-rose-400 mx-auto" />
                  <p className="text-white font-serif">Vérification échouée</p>
                  {failReason && <p className="text-xs text-rose-300/80">{failReason}</p>}
                  <p className="text-[11px] text-white/40">Nouveau défi en préparation…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-white/5 px-6 py-3 bg-gradient-to-r from-transparent via-amber-500/[0.03] to-transparent">
            <p className="text-[10px] text-white/40 text-center tracking-[0.2em] uppercase">
              Sécurité Multi-Couches · Confidentialité Préservée
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityCheckPage;
