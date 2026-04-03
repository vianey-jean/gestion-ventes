import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
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

const Star = ({ type = "fixed" }: { type?: "fixed" | "moving" }) => {
  const isMoving = type === "moving";

  return (
    <svg width="50" height="50" viewBox="0 0 24 24">
      <path
        d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
        fill={isMoving ? "#ff4d4d" : "#ffffff"}
        stroke={isMoving ? "#ff0000" : "#999999"}
        strokeWidth="2"
      />
    </svg>
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

  const [isOverTarget, setIsOverTarget] = useState(false); // 👈 NEW
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);
  const [checked, setChecked] = useState(false);

  const startTime = useRef(Date.now());
  const moveCount = useRef(0);
  const lastMoveTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });

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
    startTime.current = Date.now();
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('challenge'), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ détecte seulement (NE VALIDE PAS)
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
    setStarX(pos.x);
    setStarY(pos.y);
    checkOverlap(pos.x, pos.y);
  };

  // ✅ ICI LA LOGIQUE DEMANDÉE
  const handleDragEnd = () => {
    setIsDragging(false);

    if (isOverTarget) {
      setTimeout(() => {
        setVerifiedPuzzle(true);
      }, 500); // ⏱️ délai 0.5s
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

    return true;
  }, [verifiedPuzzle, checked]);

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">

      {/* Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[140px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-white/80" />
          <div>
            <h1 className="text-sm font-semibold text-white">Vérification de sécurité</h1>
            <p className="text-xs text-white/50">Protection anti-bot</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">

            {phase === 'checking' && (
              <motion.div key="checking" className="text-center space-y-4">
                <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
                <p className="text-white">Vérification de sécurité en cours…</p>
              </motion.div>
            )}

            {phase === 'challenge' && (
              <motion.div key="challenge" className="space-y-5">

                <p className="text-sm text-white/60 text-center">
                  Glissez l'étoile <span className="text-red-400 font-bold">rouge</span> sur l'étoile <span className="text-gray-300 font-bold">blanche</span>
                </p>

                <div
                  ref={containerRef}
                  className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 select-none"
                  style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'default' }}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <img src={image} className="w-full h-full object-cover pointer-events-none" draggable={false} />

                  {/* ⭐ étoile fixe (blanche/grise) */}
                  <div style={{ left: targetX, top: targetY }} className="absolute pointer-events-none">
                    <Star type="fixed" />
                  </div>

                  {/* 🔴 étoile mobile (rouge) - draggable */}
                  <div
                    style={{ left: starX, top: starY, cursor: isDragging ? 'grabbing' : 'grab' }}
                    className="absolute z-10"
                  >
                    <Star type="moving" />
                  </div>

                  {verifiedPuzzle && (
                    <div
                      className="absolute w-14 h-14 bg-green-400/30 blur-xl rounded-full pointer-events-none"
                      style={{ left: starX, top: starY }}
                    />
                  )}
                </div>

                {/* ✅ CHECKBOX - visible uniquement quand l'étoile rouge est sur l'étoile grise */}
                {verifiedPuzzle && (
                  <label className="flex items-center gap-3 text-white cursor-pointer animate-fadeIn">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="w-5 h-5"
                    />
                    Je confirme que je suis un humain
                  </label>
                )}

                <button
                  onClick={handleVerify}
                  disabled={!verifiedPuzzle || !checked}
                  className={`w-full flex items-center justify-center p-3 rounded-xl border transition-all
                      ${!verifiedPuzzle || !checked
                      ? "bg-white/5 border-white/20 opacity-40 cursor-not-allowed"
                      : "bg-green-500 border-green-400 hover:bg-green-600 text-white"
                    }`}
                >
                  Vérifier
                </button>

              </motion.div>
            )}

            {phase === 'verifying' && (
              <motion.div key="verifying" className="text-center space-y-4">
                <Loader2 className="h-14 w-14 text-white animate-spin mx-auto" />
                <p className="text-white">Vérification en cours…</p>
              </motion.div>
            )}

            {phase === 'passed' && (
              <motion.div key="passed" className="text-center space-y-4">
                <CheckCircle className="h-14 w-14 text-green-400 mx-auto" />
                <p className="text-white">Vérification réussie</p>
              </motion.div>
            )}

            {phase === 'failed' && (
              <motion.div key="failed" className="text-center space-y-4">
                <AlertTriangle className="h-14 w-14 text-red-400 mx-auto" />
                <p className="text-white">Vérification échouée</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 px-6 py-3">
          <p className="text-[10px] text-white/40 text-center">
            Protection par vérification de sécurité • Confidentialité respectée
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default SecurityCheckPage;
