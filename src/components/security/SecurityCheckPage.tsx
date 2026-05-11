import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Lock,
  Sparkles,
  Fingerprint,
  Eye,
  Cpu,
  ScanFace,
  Radar,
  Orbit,
  ShieldCheck,
  Activity,
  MousePointer2,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

interface SecurityCheckPageProps {
  onVerified: () => void;
}

type Phase =
  | 'boot'
  | 'checking'
  | 'challenge'
  | 'verifying'
  | 'passed'
  | 'failed';

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

const MAX_TRAIL = 14;

const Star = ({
  type = "fixed",
  glow = false,
}: {
  type?: "fixed" | "moving";
  glow?: boolean;
}) => {
  const isMoving = type === "moving";

  return (
    <div className="relative">
      {glow && (
        <>
          <div
            className={`absolute inset-0 rounded-full blur-2xl ${
              isMoving ? 'bg-rose-500/50' : 'bg-white/40'
            }`}
          />
          <div
            className={`absolute inset-0 rounded-full blur-md ${
              isMoving ? 'bg-red-500/40' : 'bg-slate-200/30'
            }`}
          />
        </>
      )}

      <motion.svg
        animate={
          isMoving
            ? {
                rotate: [0, 4, -4, 0],
                scale: [1, 1.04, 1],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        width="54"
        height="54"
        viewBox="0 0 24 24"
        className="relative drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]"
      >
        <defs>
          <linearGradient
            id={isMoving ? 'redGrad' : 'whiteGrad'}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {isMoving ? (
              <>
                <stop offset="0%" stopColor="#ff8fab" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7f1d1d" />
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
          fill={`url(#${isMoving ? 'redGrad' : 'whiteGrad'})`}
          stroke={isMoving ? '#ffe4e6' : '#f8fafc'}
          strokeWidth="1"
        />
      </motion.svg>
    </div>
  );
};

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.2em]">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-white text-sm font-semibold">{value}</p>
    </div>
  );
};

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({
  onVerified,
}) => {
  const [phase, setPhase] = useState<Phase>('boot');

  const [image, setImage] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);

  const [starX, setStarX] = useState(20);
  const [starY, setStarY] = useState(20);

  const [isDragging, setIsDragging] = useState(false);
  const [isOverTarget, setIsOverTarget] = useState(false);
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);

  const [checked, setChecked] = useState(false);

  const [securityScore, setSecurityScore] = useState(0);
  const [networkQuality, setNetworkQuality] = useState("SECURE");
  const [motionTrail, setMotionTrail] = useState<
    { x: number; y: number }[]
  >([]);

  const [honeypot, setHoneypot] = useState("");
  const [timingVariance, setTimingVariance] = useState(0);

  const startTime = useRef(Date.now());
  const moveCount = useRef(0);

  const lastMoveTime = useRef(Date.now());
  const movementIntervals = useRef<number[]>([]);

  const entropyRef = useRef(0);
  const pathLengthRef = useRef(0);

  const lastPosRef = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const dragStartOffset = useRef({ x: 0, y: 0 });

  const velocitySamples = useRef<number[]>([]);

  const challengeId = useMemo(
    () => Math.random().toString(36).slice(2, 12).toUpperCase(),
    []
  );

  const generateChallenge = useCallback(() => {
    const img = images[Math.floor(Math.random() * images.length)];

    setImage(img + "?w=1200&q=90");

    setTargetX(Math.floor(Math.random() * 220) + 40);
    setTargetY(Math.floor(Math.random() * 90) + 40);

    setStarX(Math.floor(Math.random() * 40) + 5);
    setStarY(Math.floor(Math.random() * 60) + 110);

    setVerifiedPuzzle(false);
    setChecked(false);
    setIsOverTarget(false);

    setMotionTrail([]);

    moveCount.current = 0;
    entropyRef.current = 0;
    pathLengthRef.current = 0;
    velocitySamples.current = [];
    movementIntervals.current = [];

    startTime.current = Date.now();

    setSecurityScore(0);
  }, []);

  useEffect(() => {
    generateChallenge();

    const boot = setTimeout(() => {
      setPhase('checking');
    }, 800);

    const challenge = setTimeout(() => {
      setPhase('challenge');
    }, 2400);

    return () => {
      clearTimeout(boot);
      clearTimeout(challenge);
    };
  }, [generateChallenge]);

  const getRelativePosition = (
    clientX: number,
    clientY: number
  ) => {
    if (!containerRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = containerRef.current.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          rect.width - 55,
          clientX - rect.left - dragStartOffset.current.x
        )
      ),

      y: Math.max(
        0,
        Math.min(
          rect.height - 55,
          clientY - rect.top - dragStartOffset.current.y
        )
      ),
    };
  };

  const checkOverlap = useCallback(
    (x: number, y: number) => {
      const dist = Math.sqrt(
        Math.pow(x - targetX, 2) +
          Math.pow(y - targetY, 2)
      );

      if (dist < 18) {
        setIsOverTarget(true);
        setStarX(targetX);
        setStarY(targetY);
      } else {
        setIsOverTarget(false);
      }
    },
    [targetX, targetY]
  );

  const handleDragStart = (
    clientX: number,
    clientY: number
  ) => {
    if (!containerRef.current) return;

    const rect =
      containerRef.current.getBoundingClientRect();

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    if (
      Math.abs(relX - starX - 25) < 35 &&
      Math.abs(relY - starY - 25) < 35
    ) {
      setIsDragging(true);

      dragStartOffset.current = {
        x: relX - starX,
        y: relY - starY,
      };
    }
  };

  const handleDragMove = (
    clientX: number,
    clientY: number
  ) => {
    if (!isDragging) return;

    const now = Date.now();

    moveCount.current++;

    const delta = now - lastMoveTime.current;

    lastMoveTime.current = now;

    movementIntervals.current.push(delta);

    if (movementIntervals.current.length > 20) {
      movementIntervals.current.shift();
    }

    const pos = getRelativePosition(clientX, clientY);

    const dx = pos.x - lastPosRef.current.x;
    const dy = pos.y - lastPosRef.current.y;

    const velocity = Math.sqrt(dx * dx + dy * dy);

    velocitySamples.current.push(velocity);

    pathLengthRef.current += velocity;

    entropyRef.current +=
      Math.abs(dx) +
      Math.abs(dy) +
      Math.random() * 0.4;

    lastPosRef.current = pos;

    setStarX(pos.x);
    setStarY(pos.y);

    setMotionTrail((prev) => {
      const next = [...prev, { x: pos.x, y: pos.y }];

      return next.slice(-MAX_TRAIL);
    });

    checkOverlap(pos.x, pos.y);

    const avg =
      movementIntervals.current.reduce(
        (a, b) => a + b,
        0
      ) / movementIntervals.current.length;

    const variance =
      movementIntervals.current.reduce(
        (acc, val) =>
          acc + Math.pow(val - avg, 2),
        0
      ) / movementIntervals.current.length;

    setTimingVariance(Math.floor(variance));
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (isOverTarget) {
      setTimeout(() => {
        setVerifiedPuzzle(true);
      }, 600);
    }
  };

  const onMouseDown = (e: React.MouseEvent) =>
    handleDragStart(e.clientX, e.clientY);

  const onMouseMove = (e: React.MouseEvent) =>
    handleDragMove(e.clientX, e.clientY);

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

    const handleGlobalMouseMove = (
      e: MouseEvent
    ) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener(
      'mousemove',
      handleGlobalMouseMove
    );

    window.addEventListener(
      'mouseup',
      handleGlobalMouseUp
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        handleGlobalMouseMove
      );

      window.removeEventListener(
        'mouseup',
        handleGlobalMouseUp
      );
    };
  }, [isDragging]);

  const advancedFingerprintCheck = () => {
    const nav = navigator as any;

    if (nav.webdriver) return false;

    if (
      /HeadlessChrome|PhantomJS|Selenium|Crawler/i.test(
        navigator.userAgent
      )
    ) {
      return false;
    }

    if (!navigator.language) return false;

    if (nav.languages?.length === 0) {
      return false;
    }

    if (!window.outerWidth || !window.outerHeight) {
      return false;
    }

    if (!window.crypto) {
      return false;
    }

    return true;
  };

  const performSecurityCheck = useCallback(() => {
    const timeSpent =
      Date.now() - startTime.current;

    const avgVelocity =
      velocitySamples.current.reduce(
        (a, b) => a + b,
        0
      ) / (velocitySamples.current.length || 1);

    let score = 0;

    if (timeSpent > 2500) score += 20;

    if (verifiedPuzzle) score += 20;

    if (checked) score += 15;

    if (moveCount.current > 8) score += 10;

    if (entropyRef.current > 120) score += 15;

    if (pathLengthRef.current > 80) score += 10;

    if (timingVariance > 5) score += 5;

    if (avgVelocity > 1.2) score += 5;

    if (advancedFingerprintCheck()) score += 20;

    setSecurityScore(score);

    if (honeypot.length > 0) {
      return false;
    }

    if (score < 70) {
      return false;
    }

    return true;
  }, [
    verifiedPuzzle,
    checked,
    honeypot,
    timingVariance,
  ]);

  const handleVerify = () => {
    setPhase('verifying');

    const statuses = [
      "SECURE",
      "QUANTUM",
      "TRUSTED",
      "VALIDATED",
    ];

    setNetworkQuality(
      statuses[
        Math.floor(Math.random() * statuses.length)
      ]
    );

    setTimeout(() => {
      const isHuman = performSecurityCheck();

      if (isHuman) {
        setPhase('passed');

        sessionStorage.setItem(
          'security_verified_v3',
          JSON.stringify({
            verified: true,
            timestamp: Date.now(),
            challengeId,
            score: securityScore,
          })
        );

        setTimeout(() => {
          onVerified();
        }, 1400);
      } else {
        setPhase('failed');

        setTimeout(() => {
          generateChallenge();
          setPhase('challenge');
        }, 2600);
      }
    }, 2200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030307] flex items-center justify-center p-5">
      {/* Luxury animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_30%),radial-gradient(circle_at_center,rgba(59,130,246,0.14),transparent_45%)]" />

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full border border-violet-500/10"
        />

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 80,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-60 -right-60 w-[900px] h-[900px] rounded-full border border-fuchsia-500/10"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-violet-600/20 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
          }}
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[160px]"
        />
      </div>

      {/* floating particles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
          }}
          className="absolute w-1 h-1 rounded-full bg-white/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative w-full max-w-xl"
      >
        {/* outer glow */}
        <div className="absolute -inset-[1px] rounded-[34px] bg-gradient-to-br from-white/20 via-violet-500/20 to-fuchsia-500/20 blur-sm" />

        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.06] backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
          {/* chrome */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* header */}
          <div className="relative px-8 pt-7 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-70" />

                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl">
                    <ShieldCheck
                      className="text-white h-7 w-7"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-white text-lg font-semibold tracking-tight">
                      Quantum Security v3
                    </h1>

                    <Sparkles className="w-4 h-4 text-violet-300" />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                      Neural protection active
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.25em]">
                  Challenge ID
                </p>

                <p className="text-white font-mono text-xs mt-1">
                  {challengeId}
                </p>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="relative p-8">
            {/* honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) =>
                setHoneypot(e.target.value)
              }
              style={{
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
              }}
            />

            {/* metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Metric
                icon={<Cpu className="w-3 h-3" />}
                label="ENGINE"
                value={networkQuality}
              />

              <Metric
                icon={<Activity className="w-3 h-3" />}
                label="SCORE"
                value={`${securityScore}%`}
              />

              <Metric
                icon={<Radar className="w-3 h-3" />}
                label="STATUS"
                value={
                  phase === 'passed'
                    ? 'TRUSTED'
                    : 'SCANNING'
                }
              />
            </div>

            <AnimatePresence mode="wait">
              {(phase === 'boot' ||
                phase === 'checking') && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center"
                >
                  <div className="relative w-28 h-28 mx-auto">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border border-violet-500/20"
                    />

                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-4 rounded-full border border-fuchsia-500/20"
                    />

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border-t-2 border-violet-400 border-r-2 border-transparent"
                    />

                    <Fingerprint className="absolute inset-0 m-auto w-10 h-10 text-violet-300" />
                  </div>

                  <h2 className="mt-8 text-white text-lg font-semibold">
                    Analyse comportementale
                  </h2>

                  <p className="mt-2 text-white/45 text-sm">
                    Vérification neuronale • détection
                    biométrique • anti automation
                  </p>
                </motion.div>
              )}

              {phase === 'challenge' && (
                <motion.div
                  key="challenge"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      <Orbit className="w-4 h-4 text-violet-300" />

                      <p className="text-white/80 text-xs font-medium">
                        Synchronisez l'étoile rouge avec
                        la signature blanche
                      </p>
                    </div>
                  </div>

                  {/* challenge area */}
                  <div className="relative">
                    <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-rose-500/30 blur-md" />

                    <div
                      ref={containerRef}
                      className="relative h-72 overflow-hidden rounded-[28px] border border-white/10 bg-black/40"
                      style={{
                        touchAction: 'none',
                        cursor: isDragging
                          ? 'grabbing'
                          : 'default',
                      }}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      {/* image */}
                      <img
                        src={image}
                        draggable={false}
                        className="w-full h-full object-cover scale-105"
                      />

                      {/* overlays */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />

                      <div className="absolute inset-0 backdrop-blur-[1px]" />

                      {/* scanning lines */}
                      <motion.div
                        animate={{
                          y: [-300, 300],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-violet-400/10 to-transparent"
                      />

                      {/* motion trail */}
                      {motionTrail.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            opacity: 0.8,
                          }}
                          animate={{
                            opacity: 0,
                            scale: 0.4,
                          }}
                          transition={{
                            duration: 0.6,
                          }}
                          className="absolute w-4 h-4 rounded-full bg-rose-400/30 blur-sm pointer-events-none"
                          style={{
                            left: p.x + 20,
                            top: p.y + 20,
                          }}
                        />
                      ))}

                      {/* target */}
                      <div
                        style={{
                          left: targetX - 10,
                          top: targetY - 10,
                        }}
                        className="absolute pointer-events-none"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="absolute inset-0 w-20 h-20 rounded-full border border-white/30"
                        />

                        <div className="absolute inset-0 w-20 h-20 rounded-full border border-dashed border-white/40" />
                      </div>

                      <div
                        style={{
                          left: targetX,
                          top: targetY,
                        }}
                        className="absolute pointer-events-none"
                      >
                        <Star
                          type="fixed"
                          glow={isOverTarget}
                        />
                      </div>

                      {/* draggable */}
                      <div
                        style={{
                          left: starX,
                          top: starY,
                          cursor: isDragging
                            ? 'grabbing'
                            : 'grab',
                        }}
                        className="absolute z-20 transition-transform hover:scale-110"
                      >
                        <Star type="moving" glow />
                      </div>

                      {/* corners */}
                      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-white/50" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-white/50" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-white/50" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-white/50" />

                      {/* success */}
                      {verifiedPuzzle && (
                        <motion.div
                          initial={{
                            scale: 0,
                            opacity: 0,
                          }}
                          animate={{
                            scale: [0, 1.4, 1],
                            opacity: [0, 1, 0.7],
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm"
                        >
                          <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />

                            <p className="mt-3 text-white font-semibold">
                              Signature validée
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* human checkbox */}
                  <AnimatePresence>
                    {verifiedPuzzle && (
                      <motion.label
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 cursor-pointer"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setChecked(
                                e.target.checked
                              )
                            }
                            className="peer appearance-none w-6 h-6 rounded-lg border border-white/20 bg-white/5 checked:bg-gradient-to-br checked:from-violet-500 checked:to-fuchsia-500 checked:border-transparent"
                          />

                          <CheckCircle className="absolute inset-0 m-auto w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>

                        <div>
                          <p className="text-white font-medium text-sm">
                            Je confirme être humain
                          </p>

                          <p className="text-white/40 text-xs mt-1">
                            Validation biométrique et
                            comportementale
                          </p>
                        </div>
                      </motion.label>
                    )}
                  </AnimatePresence>

                  {/* button */}
                  <button
                    onClick={handleVerify}
                    disabled={
                      !verifiedPuzzle || !checked
                    }
                    className={`group relative overflow-hidden w-full h-14 rounded-2xl font-semibold transition-all ${
                      !verifiedPuzzle || !checked
                        ? 'bg-white/[0.04] border border-white/10 text-white/30 cursor-not-allowed'
                        : 'text-white hover:-translate-y-1 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.7)]'
                    }`}
                  >
                    {verifiedPuzzle && checked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600" />

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-fuchsia-600 via-rose-600 to-violet-600" />

                        <motion.div
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="absolute inset-y-0 w-24 bg-white/20 blur-2xl rotate-12"
                        />
                      </>
                    )}

                    <span className="relative flex items-center justify-center gap-3">
                      <ScanFace className="w-5 h-5" />

                      Vérification Quantum
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
                  className="py-16 text-center"
                >
                  <div className="relative w-32 h-32 mx-auto">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border border-violet-500/20"
                    />

                    <motion.div
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-5 rounded-full border border-fuchsia-500/30"
                    />

                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border-t-2 border-violet-400 border-r-2 border-transparent"
                    />

                    <Fingerprint className="absolute inset-0 m-auto w-12 h-12 text-violet-300" />
                  </div>

                  <h2 className="mt-8 text-white text-lg font-semibold">
                    Validation cryptographique
                  </h2>

                  <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-300" />

                    <span className="text-white/75 text-sm">
                      Analyse IA comportementale...
                    </span>
                  </div>
                </motion.div>
              )}

              {phase === 'passed' && (
                <motion.div
                  key="passed"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="py-14 text-center"
                >
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -180,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="relative w-28 h-28 mx-auto"
                  >
                    <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-3xl animate-pulse" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(16,185,129,0.7)]">
                      <CheckCircle className="w-14 h-14 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="mt-8 text-white text-2xl font-bold">
                    Accès autorisé
                  </h2>

                  <p className="mt-3 text-white/50">
                    Signature humaine confirmée •
                    environnement sécurisé
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                    <Shield className="w-4 h-4 text-emerald-300" />

                    <span className="text-emerald-200 text-sm font-medium">
                      Security score: 98%
                    </span>
                  </div>
                </motion.div>
              )}

              {phase === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    x: [0, -8, 8, -8, 8, 0],
                  }}
                  className="py-14 text-center"
                >
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-red-500/40 blur-3xl" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-14 h-14 text-white" />
                    </div>
                  </div>

                  <h2 className="mt-8 text-white text-xl font-semibold">
                    Signature invalide
                  </h2>

                  <p className="mt-3 text-white/50">
                    Nouvelle analyse en préparation...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* footer */}
          <div className="relative border-t border-white/10 bg-white/[0.03] px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-white/40" />

                <p className="text-[11px] text-white/45 uppercase tracking-[0.2em]">
                  Quantum encrypted tunnel
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="w-3 h-3 text-white/30" />

                <MousePointer2 className="w-3 h-3 text-white/30" />

                <p className="text-[11px] font-mono text-white/35">
                  v3.0 ULTRA
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityCheckPage;