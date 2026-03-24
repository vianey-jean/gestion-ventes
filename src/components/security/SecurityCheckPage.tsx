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
];

// ⭐ Composant étoile
const Star = ({ type = "fixed" }: { type?: "fixed" | "moving" }) => {
  const isMoving = type === "moving";

  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      className={`drop-shadow-[0_0_10px_${isMoving ? "rgba(255,0,0,0.9)" : "rgba(0,0,0,0.6)"}]`}
    >
      <path
        d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
        fill={isMoving ? "#ff4d4d" : "#ffffff"}   // intérieur blanc pour fixe
        stroke={isMoving ? "#ff0000" : "#999999"} // contour gris pour fixe
        strokeWidth="2"
      />
    </svg>
  );
};

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({ onVerified }) => {
  const [phase, setPhase] = useState<'checking' | 'challenge' | 'verifying' | 'passed' | 'failed'>('checking');
  const [challengeClicked, setChallengeClicked] = useState(false);

  const [image, setImage] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [slider, setSlider] = useState(0);
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);

  const startTime = useRef(Date.now());

  useEffect(() => {
    const img = images[Math.floor(Math.random() * images.length)];
    setImage(img + "?w=800&q=80");

    const randomX = Math.floor(Math.random() * 200) + 40;
    setTargetX(randomX);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('challenge'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSlider = (val: number) => {
    setSlider(val);

    if (Math.abs(val - targetX) < 8) {
      setVerifiedPuzzle(true);
    } else {
      setVerifiedPuzzle(false);
    }
  };

  const performSecurityCheck = useCallback(() => {
    const timeSpent = Date.now() - startTime.current;
    if (timeSpent < 1200) return false;
    if (!verifiedPuzzle) return false;

    const hasWebdriver = !!(navigator as any).webdriver;
    if (hasWebdriver) return false;

    return true;
  }, [verifiedPuzzle]);

  const handleHumanClick = useCallback(() => {
    if (challengeClicked || !verifiedPuzzle) return;

    setChallengeClicked(true);
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
        setChallengeClicked(false);
        setSlider(0);
        setVerifiedPuzzle(false);

        setTimeout(() => setPhase('challenge'), 3000);
      }
    }, 1500);
  }, [challengeClicked, performSecurityCheck, onVerified, verifiedPuzzle]);

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
                  Alignez l'étoile rouge avec l'étoile blanche
                </p>

                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                  <img src={image} className="w-full h-full object-cover" />

                  {/* ⭐ étoile fixe (blanc + contour gris) */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: targetX }}
                  >
                    <Star type="fixed" />
                  </div>

                  {/* 🔴 étoile mobile */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-150"
                    style={{ left: slider }}
                  >
                    <Star type="moving" />
                  </div>

                  {/* Glow quand aligné */}
                  {verifiedPuzzle && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-green-400/30 blur-xl rounded-full"
                      style={{ left: slider }}
                    />
                  )}
                </div>

                <input
                  type="range"
                  min={0}
                  max={260}
                  value={slider}
                  onChange={(e) => handleSlider(Number(e.target.value))}
                  className="w-full"
                />

                <button
                  onClick={handleHumanClick}
                  disabled={!verifiedPuzzle}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/20 bg-white/5 disabled:opacity-40"
                >
                  <div className="h-6 w-6 border border-white/40 rounded-md" />
                  <span className="text-white text-sm">
                    Je confirme que je suis un humain
                  </span>
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