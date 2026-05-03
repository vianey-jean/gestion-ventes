import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, CheckCircle, Loader2, AlertTriangle, Lock, Sparkles, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityCheckPageProps {
  onVerified: () => void;
}

const images = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
];

const Star = ({ type = "fixed", glow = false }: { type?: "fixed" | "moving"; glow?: boolean }) => {
  const isMoving = type === "moving";

  return (
    <div className="relative">
      {glow && (
        <div className={`absolute inset-0 blur-md ${isMoving ? 'bg-rose-500/60' : 'bg-white/40'} rounded-full`} />
      )}
      <svg width="48" height="48" viewBox="0 0 24 24" className="relative drop-shadow-2xl">
        <defs>
          <linearGradient id={isMoving ? "redGrad" : "whiteGrad"} x1="0%" y1="0%" x2="100%" y2="100%">
            {isMoving ? (
              <>
                <stop offset="0%" stopColor="#ff6b8a" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
          fill={`url(#${isMoving ? "redGrad" : "whiteGrad"})`}
          stroke={isMoving ? "#fecaca" : "#f1f5f9"}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({ onVerified }) => {
  const [phase, setPhase] = useState<'checking' | 'challenge' | 'verifying' | 'passed' | 'failed'>('checking');

  const [image, setImage] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [starX, setStarX] = useState(20);
  const [starY, setStarY] = useState(20);
  const [isDragging, setIsDragging] = useState(false);

  const [isOverTarget, setIsOverTarget] = useState(false);
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);
  const [checked, setChecked] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // anti-bot honeypot

  const startTime = useRef(Date.now());
  const moveCount = useRef(0);
  const lastMoveTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const entropyRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const generateChallenge = () => {
    const img = images[Math.floor(Math.random() * images.length)];
    setImage(img + "?w=800&q=80");

    setTargetX(Math.floor(Math.random() * 220) + 40);
    setTargetY(Math.floor(Math.random() * 100) + 30);

    setStarX(Math.floor(Math.random() * 40) + 5);
    setStarY(Math.floor(Math.random() * 60) + 80);

    setVerifiedPuzzle(false);
    setChecked(false);
    setIsOverTarget(false);

    moveCount.current = 0;
    entropyRef.current = 0;
    startTime.current = Date.now();
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('challenge'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const checkOverlap = useCallback((x: number, y: number) => {
    const dist = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

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

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const now = Date.now();
    moveCount.current++;
    const delta = now - lastMoveTime.current;
    lastMoveTime.current = now;

    if (delta < 3) return;

    const pos = getRelativePosition(clientX, clientY);
    // entropy: accumulate non-linear motion
    const dx = pos.x - lastPosRef.current.x;
    const dy = pos.y - lastPosRef.current.y;
    entropyRef.current += Math.abs(dx) + Math.abs(dy);
    lastPosRef.current = pos;

    setStarX(pos.x);
    setStarY(pos.y);
    checkOverlap(pos.x, pos.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (isOverTarget) {
      setTimeout(() => {
        setVerifiedPuzzle(true);
      }, 500);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const onMouseUp = () => handleDragEnd();

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    handleDragStart(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handleDragMove(t.clientX, t.clientY);
  };
  const onTouchEnd = () => handleDragEnd();

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleGlobalMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleDragMove]);

  const performSecurityCheck = useCallback(() => {
    const timeSpent = Date.now() - startTime.current;

    if (timeSpent < 1500) return false;
    if (!verifiedPuzzle) return false;
    if (!checked) return false;
    if (moveCount.current < 5) return false;
    if ((navigator as any).webdriver) return false;
    // Extra security checks
    if (honeypot.length > 0) return false; // bot filled hidden field
    if (entropyRef.current < 50) return false; // straight-line motion = bot
    if (!navigator.userAgent || /HeadlessChrome|PhantomJS|Selenium/i.test(navigator.userAgent)) return false;
    if ((navigator as any).languages && (navigator as any).languages.length === 0) return false;

    return true;
  }, [verifiedPuzzle, checked, honeypot]);

  const handleVerify = () => {
    setPhase('verifying');

    setTimeout(() => {
      const isHuman = performSecurityCheck();

      if (isHuman) {
        setPhase('passed');

        sessionStorage.setItem('security_verified', JSON.stringify({
          verified: true,
          timestamp: Date.now(),
        }));

        setTimeout(() => onVerified(), 1200);
      } else {
        setPhase('failed');

        setTimeout(() => {
          generateChallenge();
          setPhase('challenge');
        }, 2500);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#05060a]">
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.15),transparent_50%),radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[140px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Premium gradient border */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-white/30 via-violet-400/20 to-fuchsia-400/30 rounded-[28px] opacity-80" />
        <div className="absolute -inset-[1px] bg-gradient-to-tr from-white/10 via-transparent to-white/20 rounded-[28px] blur-sm" />

        <div className="relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02] backdrop-blur-2xl rounded-[28px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.7)] overflow-hidden">

          {/* Inner shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/30 via-transparent to-transparent" />

          {/* Header */}
          <div className="relative px-7 pt-6 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-xl blur-md opacity-60" />
                <div className="relative w-11 h-11 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-xl">
                  <Shield className="h-5 w-5 text-white drop-shadow" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-[15px] font-semibold text-white tracking-tight">Vérification de sécurité</h1>
                  <Sparkles className="h-3 w-3 text-violet-300" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <p className="text-[11px] text-white/50 font-medium tracking-wide uppercase">Protection avancée</p>
                </div>
              </div>
              <Lock className="h-4 w-4 text-white/30" />
            </div>
          </div>

          <div className="relative p-7 space-y-6 min-h-[340px]">
            {/* Honeypot — invisible to humans */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
              aria-hidden="true"
            />

            <AnimatePresence mode="wait">
              {phase === 'checking' && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-5 py-10"
                >
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 border-r-fuchsia-400 animate-spin" />
                    <Fingerprint className="absolute inset-0 m-auto h-7 w-7 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-white/90 font-medium text-sm">Analyse de votre empreinte…</p>
                    <p className="text-white/40 text-xs mt-1">Initialisation du protocole</p>
                  </div>
                </motion.div>
              )}

              {phase === 'challenge' && (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1">
                    <p className="text-[13px] text-white/80 font-medium">
                      Glissez l'étoile <span className="text-rose-400 font-bold">rouge</span> sur l'étoile <span className="text-white font-bold">blanche</span>
                    </p>
                    <p className="text-[11px] text-white/40">Test de cohérence humaine</p>
                  </div>

                  {/* Puzzle area */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/40 via-fuchsia-500/40 to-pink-500/40 rounded-2xl blur opacity-60 group-hover:opacity-90 transition" />
                    <div
                      ref={containerRef}
                      className="relative w-full h-52 rounded-2xl overflow-hidden border border-white/10 select-none shadow-2xl"
                      style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'default' }}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      <img src={image} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

                      {/* Target ring */}
                      <div style={{ left: targetX - 8, top: targetY - 8 }} className="absolute pointer-events-none">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 animate-pulse" />
                      </div>

                      <div style={{ left: targetX, top: targetY }} className="absolute pointer-events-none">
                        <Star type="fixed" glow={isOverTarget} />
                      </div>

                      <div
                        style={{ left: starX, top: starY, cursor: isDragging ? 'grabbing' : 'grab' }}
                        className="absolute z-10 transition-transform hover:scale-110"
                      >
                        <Star type="moving" glow />
                      </div>

                      {verifiedPuzzle && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 1] }}
                          className="absolute w-20 h-20 bg-emerald-400/40 blur-2xl rounded-full pointer-events-none"
                          style={{ left: starX - 10, top: starY - 10 }}
                        />
                      )}

                      {/* Corner decorations */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/40" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/40" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/40" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/40" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {verifiedPuzzle && (
                      <motion.label
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 text-white/90 cursor-pointer p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="peer w-5 h-5 appearance-none rounded-md border-2 border-white/30 bg-white/5 checked:bg-gradient-to-br checked:from-violet-500 checked:to-fuchsia-500 checked:border-transparent transition cursor-pointer"
                          />
                          <CheckCircle className="absolute inset-0 m-auto h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium">Je confirme que je suis humain</span>
                      </motion.label>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleVerify}
                    disabled={!verifiedPuzzle || !checked}
                    className={`group relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden transition-all ${
                      !verifiedPuzzle || !checked
                        ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                        : "text-white shadow-[0_8px_30px_-5px_rgba(139,92,246,0.6)] hover:shadow-[0_12px_40px_-5px_rgba(139,92,246,0.8)] hover:-translate-y-0.5"
                    }`}
                  >
                    {verifiedPuzzle && checked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      </>
                    )}
                    <span className="relative flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4" />
                      Vérifier mon identité
                    </span>
                  </button>
                </motion.div>
              )}

              {phase === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-5 py-10"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
                    <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-fuchsia-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    <Fingerprint className="absolute inset-0 m-auto h-8 w-8 text-violet-300" />
                  </div>
                  <p className="text-white/90 font-medium text-sm">Vérification cryptographique…</p>
                </motion.div>
              )}

              {phase === 'passed' && (
                <motion.div
                  key="passed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4 py-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="relative w-20 h-20 mx-auto"
                  >
                    <div className="absolute inset-0 bg-emerald-400/40 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                      <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold">Vérification réussie</p>
                    <p className="text-white/50 text-xs mt-1">Accès sécurisé accordé</p>
                  </div>
                </motion.div>
              )}

              {phase === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4 py-10"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-red-500/40 rounded-full blur-2xl" />
                    <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-rose-700 rounded-full flex items-center justify-center shadow-2xl">
                      <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Vérification échouée</p>
                    <p className="text-white/50 text-xs mt-1">Nouvelle tentative en cours…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="relative border-t border-white/[0.06] px-7 py-3.5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-white/40" />
                <p className="text-[10px] text-white/50 font-medium tracking-wide">Chiffrement de bout en bout</p>
              </div>
              <p className="text-[10px] text-white/30 font-mono">v2.0</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityCheckPage;
