import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  Shield,
  CheckCircle2,
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
  Globe,
  Wifi,
  Binary,
  ShieldAlert,
  Bot,
  Flame,
  ScanSearch,
} from 'lucide-react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

interface SecurityCheckPageProps {
  onVerified: () => void;
}

type Phase =
  | 'boot'
  | 'checking'
  | 'challenge'
  | 'captcha'
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

const MAX_TRAIL = 18;

const randomString = (length: number) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .toUpperCase();

const generateCaptcha = () => {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let value = '';

  for (let i = 0; i < 6; i++) {
    value += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return value;
};

const Star = ({
  type = "fixed",
  glow = false,
}: {
  type?: "fixed" | "moving";
  glow?: boolean;
}) => {
  const moving = type === 'moving';

  return (
    <div className="relative">
      {glow && (
        <>
          <div
            className={`absolute inset-0 rounded-full blur-2xl ${moving
              ? 'bg-rose-500/50'
              : 'bg-white/40'
              }`}
          />

          <div
            className={`absolute inset-0 rounded-full blur-md ${moving
              ? 'bg-red-500/30'
              : 'bg-slate-200/20'
              }`}
          />
        </>
      )}

      <motion.svg
        animate={
          moving
            ? {
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
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
        className="relative drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
      >
        <defs>
          <linearGradient
            id={moving ? 'r' : 'w'}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {moving ? (
              <>
                <stop
                  offset="0%"
                  stopColor="#ffb4c6"
                />
                <stop
                  offset="50%"
                  stopColor="#ef4444"
                />
                <stop
                  offset="100%"
                  stopColor="#7f1d1d"
                />
              </>
            ) : (
              <>
                <stop
                  offset="0%"
                  stopColor="#ffffff"
                />
                <stop
                  offset="100%"
                  stopColor="#cbd5e1"
                />
              </>
            )}
          </linearGradient>
        </defs>

        <path
          d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
          fill={`url(#${moving ? 'r' : 'w'})`}
          stroke="#ffffff"
          strokeWidth="0.8"
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
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-3">
    <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.22em]">
      {icon}
      {label}
    </div>

    <p className="mt-2 text-white text-sm font-semibold">
      {value}
    </p>
  </div>
);

const SecurityCheckPage: React.FC<
  SecurityCheckPageProps
> = ({ onVerified }) => {
  const [phase, setPhase] =
    useState<Phase>('boot');

  const [image, setImage] = useState('');
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);

  const [starX, setStarX] = useState(30);
  const [starY, setStarY] = useState(120);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isOverTarget, setIsOverTarget] =
    useState(false);

  const [verifiedPuzzle, setVerifiedPuzzle] =
    useState(false);

  const [checked, setChecked] =
    useState(false);

  const [securityScore, setSecurityScore] =
    useState(0);

  const [networkQuality, setNetworkQuality] =
    useState('ULTRA SECURE');

  const [motionTrail, setMotionTrail] =
    useState<{ x: number; y: number }[]>(
      []
    );

  const [timingVariance, setTimingVariance] =
    useState(0);

  const [botReasons, setBotReasons] =
    useState<string[]>([]);

  const [honeypot, setHoneypot] =
    useState('');

  const [captchaRequired, setCaptchaRequired] =
    useState(false);

  const [captchaInput, setCaptchaInput] =
    useState('');

  const [captchaText, setCaptchaText] =
    useState(generateCaptcha());

  const [captchaPassed, setCaptchaPassed] =
    useState(false);

  const [riskLevel, setRiskLevel] =
    useState('LOW');

  const [failedAttempts, setFailedAttempts] =
    useState(0);

  const [ipReputation] =
    useState(
      [
        'TRUSTED',
        'CLEAN',
        'SECURE',
        'PRIVATE',
      ][Math.floor(Math.random() * 4)]
    );

  const containerRef =
    useRef<HTMLDivElement>(null);

  const dragStartOffset = useRef({
    x: 0,
    y: 0,
  });

  const startTime = useRef(Date.now());

  const moveCount = useRef(0);

  const entropyRef = useRef(0);

  const pathLengthRef = useRef(0);

  const velocitySamples = useRef<number[]>(
    []
  );

  const movementIntervals = useRef<number[]>(
    []
  );

  const lastMoveTime = useRef(Date.now());

  const lastPosRef = useRef({
    x: 0,
    y: 0,
  });

  const challengeId = useMemo(
    () => randomString(12),
    []
  );

  const generateChallenge = useCallback(() => {
    const img =
      images[
      Math.floor(Math.random() * images.length)
      ];

    setImage(img + '?w=1200&q=95');

    setTargetX(
      Math.floor(Math.random() * 220) + 40
    );

    setTargetY(
      Math.floor(Math.random() * 100) + 35
    );

    setStarX(
      Math.floor(Math.random() * 40) + 10
    );

    setStarY(
      Math.floor(Math.random() * 50) + 150
    );

    setVerifiedPuzzle(false);
    setChecked(false);
    setCaptchaPassed(false);
    setCaptchaInput('');
    setCaptchaText(generateCaptcha());

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
    }, 2500);

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

    const rect =
      containerRef.current.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          rect.width - 55,
          clientX -
          rect.left -
          dragStartOffset.current.x
        )
      ),

      y: Math.max(
        0,
        Math.min(
          rect.height - 55,
          clientY -
          rect.top -
          dragStartOffset.current.y
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

    if (
      movementIntervals.current.length > 20
    ) {
      movementIntervals.current.shift();
    }

    const pos = getRelativePosition(
      clientX,
      clientY
    );

    const dx =
      pos.x - lastPosRef.current.x;

    const dy =
      pos.y - lastPosRef.current.y;

    const velocity = Math.sqrt(
      dx * dx + dy * dy
    );

    velocitySamples.current.push(velocity);

    pathLengthRef.current += velocity;

    entropyRef.current +=
      Math.abs(dx) +
      Math.abs(dy) +
      Math.random() * 0.8;

    lastPosRef.current = pos;

    setStarX(pos.x);
    setStarY(pos.y);

    setMotionTrail((prev) => {
      const next = [
        ...prev,
        { x: pos.x, y: pos.y },
      ];

      return next.slice(-MAX_TRAIL);
    });

    checkOverlap(pos.x, pos.y);

    const avg =
      movementIntervals.current.reduce(
        (a, b) => a + b,
        0
      ) /
      movementIntervals.current.length;

    const variance =
      movementIntervals.current.reduce(
        (acc, val) =>
          acc + Math.pow(val - avg, 2),
        0
      ) /
      movementIntervals.current.length;

    setTimingVariance(Math.floor(variance));
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (isOverTarget) {
      setTimeout(() => {
        setVerifiedPuzzle(true);

        if (
          securityScore < 80 ||
          failedAttempts > 0
        ) {
          setCaptchaRequired(true);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const move = (e: MouseEvent) => {
      handleDragMove(
        e.clientX,
        e.clientY
      );
    };

    const up = () => handleDragEnd();

    window.addEventListener(
      'mousemove',
      move
    );

    window.addEventListener(
      'mouseup',
      up
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        move
      );

      window.removeEventListener(
        'mouseup',
        up
      );
    };
  }, [isDragging]);

  const advancedBotDetection =
    useCallback(() => {
      const nav = navigator as any;
      const win = window as any;

      const reasons: string[] = [];

      let bonus = 0;

      if (nav.webdriver)
        reasons.push('webdriver');

      if (
        /HeadlessChrome|PhantomJS|Selenium|Puppeteer|Playwright|Bot|Crawler|Spider/i.test(
          navigator.userAgent
        )
      ) {
        reasons.push('ua-bot');
      }

      if (
        Object.keys(win).some((k) =>
          /^cdc_|^__webdriver|^__driver/i.test(
            k
          )
        )
      ) {
        reasons.push('automation');
      }

      if (
        !navigator.language ||
        navigator.languages.length === 0
      ) {
        reasons.push('languages');
      }

      try {
        const canvas =
          document.createElement('canvas');

        const gl =
          canvas.getContext('webgl');

        if (!gl) {
          reasons.push('webgl');
        } else {
          bonus += 8;
        }
      } catch {
        reasons.push('webgl-error');
      }

      if (
        !window.crypto ||
        !window.crypto.subtle
      ) {
        reasons.push('crypto');
      } else {
        bonus += 5;
      }

      if (
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency >= 4
      ) {
        bonus += 4;
      }

      return {
        passed: reasons.length === 0,
        reasons,
        bonus,
      };
    }, []);

  const computeLiveScore =
    useCallback(() => {
      const timeSpent =
        Date.now() - startTime.current;

      let score = 0;

      if (timeSpent > 2500) score += 15;

      if (moveCount.current > 8)
        score += 10;

      if (entropyRef.current > 100)
        score += 15;

      if (pathLengthRef.current > 120)
        score += 10;

      if (timingVariance > 5)
        score += 10;

      if (verifiedPuzzle)
        score += 20;

      if (checked) score += 10;

      if (captchaPassed)
        score += 20;

      const bot =
        advancedBotDetection();

      if (bot.passed) score += 10;

      score += bot.bonus;

      if (honeypot.length > 0)
        score = 0;

      score = Math.min(
        100,
        Math.max(0, score)
      );

      setSecurityScore(score);

      setBotReasons(bot.reasons);

      if (score > 90)
        setRiskLevel('MINIMAL');
      else if (score > 75)
        setRiskLevel('LOW');
      else if (score > 50)
        setRiskLevel('MEDIUM');
      else setRiskLevel('HIGH');

      return {
        score,
        bot,
      };
    }, [
      verifiedPuzzle,
      checked,
      captchaPassed,
      honeypot,
      timingVariance,
      advancedBotDetection,
    ]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        computeLiveScore();
      }, 400);

    return () =>
      window.clearInterval(interval);
  }, [computeLiveScore]);

  const performSecurityCheck =
    useCallback(() => {
      const { score, bot } =
        computeLiveScore();

      if (honeypot.length > 0)
        return false;

      if (
        !bot.passed &&
        bot.reasons.some((r) =>
          [
            'webdriver',
            'ua-bot',
            'automation',
          ].includes(r)
        )
      ) {
        return false;
      }

      if (
        captchaRequired &&
        !captchaPassed
      ) {
        return false;
      }

      if (score < 75) return false;

      return true;
    }, [
      captchaRequired,
      captchaPassed,
      honeypot,
      computeLiveScore,
    ]);

  const handleVerify = () => {
    setPhase('verifying');

    const states = [
      'QUANTUM',
      'ENCRYPTED',
      'NEURAL',
      'SECURE',
    ];

    setNetworkQuality(
      states[
      Math.floor(
        Math.random() * states.length
      )
      ]
    );

    setTimeout(() => {
      const passed =
        performSecurityCheck();

      if (passed) {
        setPhase('passed');

        sessionStorage.setItem(
          'security_verified_v4',
          JSON.stringify({
            verified: true,
            timestamp: Date.now(),
            challengeId,
            score: securityScore,
            version: 'v4',
          })
        );

        setTimeout(() => {
          onVerified();
        }, 1800);
      } else {
        setFailedAttempts((p) => p + 1);

        setPhase('failed');

        setTimeout(() => {
          generateChallenge();
          setPhase('challenge');
        }, 2800);
      }
    }, 2600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020207] flex items-center justify-center p-5">
      {/* ULTRA LUXURY BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.25),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_28%),radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_50%)]" />

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-52 -left-52 w-[900px] h-[900px] rounded-full border border-violet-500/10"
        />

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-72 -right-72 w-[1200px] h-[1200px] rounded-full border border-fuchsia-500/10"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
            }}
            className="absolute w-1 h-1 rounded-full bg-white/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

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
        className="relative w-full max-w-2xl"
      >
        <div className="absolute -inset-[1px] rounded-[36px] bg-gradient-to-br from-white/20 via-violet-500/20 to-fuchsia-500/20 blur-sm" />

        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)]">
          {/* HEADER */}
          <div className="relative px-8 pt-7 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-2xl opacity-80" />

                  <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                      Quantum Security V4
                    </h1>

                    <Sparkles className="w-5 h-5 text-violet-300" />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                      AI Anti-Bot Neural Engine
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.25em]">
                  SESSION
                </p>

                <p className="text-white font-mono text-xs mt-1">
                  {challengeId}
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="relative p-8">
            {/* HONEYPOT */}
            <input
              type="text"
              autoComplete="off"
              tabIndex={-1}
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

            {/* METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
              <Metric
                icon={<Cpu className="w-3 h-3" />}
                label="ENGINE"
                value={networkQuality}
              />

              <Metric
                icon={
                  <Activity className="w-3 h-3" />
                }
                label="SCORE"
                value={`${securityScore}%`}
              />

              <Metric
                icon={<Shield className="w-3 h-3" />}
                label="RISK"
                value={riskLevel}
              />

              <Metric
                icon={<Wifi className="w-3 h-3" />}
                label="NETWORK"
                value={ipReputation}
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
                    className="py-20 text-center"
                  >
                    <div className="relative w-36 h-36 mx-auto">
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute inset-0 rounded-full border border-violet-500/20"
                      />

                      <motion.div
                        animate={{
                          rotate: -360,
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute inset-5 rounded-full border border-fuchsia-500/20"
                      />

                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute inset-0 rounded-full border-t-2 border-violet-400 border-r-2 border-transparent"
                      />

                      <Fingerprint className="absolute inset-0 m-auto w-14 h-14 text-violet-300" />
                    </div>

                    <h2 className="mt-10 text-white text-2xl font-semibold">
                      Analyse comportementale IA
                    </h2>

                    <p className="mt-3 text-white/45 text-sm">
                      Deep fingerprint • Neural
                      verification • Quantum anti-bot
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
                  {/* TOP INFO */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                      <Orbit className="w-4 h-4 text-violet-300" />

                      <span className="text-white/80 text-xs">
                        Synchronisez l'étoile
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2">
                      <Bot className="w-4 h-4 text-red-300" />

                      <span className="text-red-200 text-xs">
                        Anti Automation Active
                      </span>
                    </div>
                  </div>

                  {/* CHALLENGE */}
                  <div className="relative">
                    <div className="absolute -inset-[1px] rounded-[30px] bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-rose-500/30 blur-md" />

                    <div
                      ref={containerRef}
                      className="relative h-80 overflow-hidden rounded-[30px] border border-white/10 bg-black/40"
                      style={{
                        touchAction: 'none',
                        cursor: isDragging
                          ? 'grabbing'
                          : 'default',
                      }}
                      onMouseDown={(e) =>
                        handleDragStart(
                          e.clientX,
                          e.clientY
                        )
                      }
                      onMouseMove={(e) =>
                        handleDragMove(
                          e.clientX,
                          e.clientY
                        )
                      }
                      onMouseUp={handleDragEnd}
                      onTouchStart={(e) => {
                        const t = e.touches[0];

                        handleDragStart(
                          t.clientX,
                          t.clientY
                        );
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();

                        const t = e.touches[0];

                        handleDragMove(
                          t.clientX,
                          t.clientY
                        );
                      }}
                      onTouchEnd={handleDragEnd}
                    >
                      <img
                        src={image}
                        draggable={false}
                        className="w-full h-full object-cover scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

                      <motion.div
                        animate={{
                          y: [-400, 400],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-violet-400/10 to-transparent"
                      />

                      {/* TRAIL */}
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
                          className="absolute w-5 h-5 rounded-full bg-rose-400/30 blur-sm"
                          style={{
                            left: p.x + 18,
                            top: p.y + 18,
                          }}
                        />
                      ))}

                      {/* TARGET */}
                      <div
                        style={{
                          left: targetX - 10,
                          top: targetY - 10,
                        }}
                        className="absolute pointer-events-none"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.12, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="absolute inset-0 w-20 h-20 rounded-full border border-white/40"
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

                      {/* MOVING STAR */}
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
                        <Star
                          type="moving"
                          glow
                        />
                      </div>

                      {/* HUD */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
                        <Globe className="w-3 h-3 text-cyan-300" />

                        <span className="text-[11px] text-white/70 uppercase tracking-[0.2em]">
                          Human Pattern Scan
                        </span>
                      </div>

                      {/* VERIFIED */}
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
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />

                            <p className="mt-3 text-white font-semibold">
                              Signature validée
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>



                  {/* CHECKBOX */}
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

                          <CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>

                        <div>
                          <p className="text-white font-medium text-sm">
                            Je confirme être
                            humain
                          </p>

                          <p className="text-white/40 text-xs mt-1">
                            Validation IA +
                            comportementale +
                            CAPTCHA sécurisé
                          </p>
                        </div>
                      </motion.label>
                    )}
                  </AnimatePresence>

                  {/* CAPTCHA */}
                  <AnimatePresence>
                    {captchaRequired &&
                      verifiedPuzzle && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="w-5 h-5 text-yellow-300" />

                            <div>
                              <p className="text-white font-semibold">
                                Vérification
                                CAPTCHA
                              </p>

                              <p className="text-white/45 text-xs mt-1">
                                Contrôle
                                supplémentaire
                                anti-bot
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                              <div className="absolute inset-0 opacity-30">
                                {[...Array(40)].map(
                                  (_, i) => (
                                    <div
                                      key={i}
                                      className="absolute w-1 h-1 bg-white"
                                      style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                      }}
                                    />
                                  )
                                )}
                              </div>

                              <p
                                className="text-3xl font-black tracking-[0.4em] text-white select-none"
                                style={{
                                  transform:
                                    'rotate(-2deg)',
                                  textShadow:
                                    '0 0 20px rgba(255,255,255,0.35)',
                                }}
                              >
                                {captchaText}
                              </p>
                            </div>

                            <input
                              value={captchaInput}
                              onChange={(e) =>
                                setCaptchaInput(
                                  e.target.value.toUpperCase()
                                )
                              }
                              placeholder="Entrer le code"
                              className="flex-1 h-16 rounded-2xl border border-white/10 bg-black/30 px-5 text-white outline-none focus:border-violet-500/50"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (
                                captchaInput ===
                                captchaText
                              ) {
                                setCaptchaPassed(
                                  true
                                );
                              } else {
                                setCaptchaPassed(
                                  false
                                );

                                setCaptchaText(
                                  generateCaptcha()
                                );

                                setCaptchaInput(
                                  ''
                                );
                              }
                            }}
                            className="mt-4 w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white font-semibold"
                          >
                            Vérifier le CAPTCHA
                          </button>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* BOT REASONS */}
                  {botReasons.length > 0 && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-red-300" />

                        <p className="text-red-200 text-sm font-semibold">
                          Signatures suspectes
                          détectées
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {botReasons.map((r) => (
                          <span
                            key={r}
                            className="px-3 py-1 rounded-full bg-black/30 text-red-200 text-xs border border-red-500/20"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BUTTON */}
                  <button
                    onClick={handleVerify}
                    disabled={
                      !verifiedPuzzle ||
                      !checked ||
                      (captchaRequired &&
                        !captchaPassed)
                    }
                    className={`group relative overflow-hidden w-full h-16 rounded-2xl font-semibold transition-all ${!verifiedPuzzle ||
                      !checked ||
                      (captchaRequired &&
                        !captchaPassed)
                      ? 'bg-white/[0.04] border border-white/10 text-white/30 cursor-not-allowed'
                      : 'text-white hover:-translate-y-1 shadow-[0_25px_70px_-15px_rgba(139,92,246,0.8)]'
                      }`}
                  >
                    {verifiedPuzzle &&
                      checked && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600" />

                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-fuchsia-600 via-rose-600 to-violet-600" />

                          <motion.div
                            animate={{
                              x: [
                                '-100%',
                                '220%',
                              ],
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

                      Validation
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
                  className="py-20 text-center"
                >
                  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                    {/* Glow background */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent blur-2xl" />

                    {/* Outer ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border border-violet-400/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                    />

                    {/* Middle ring */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-6 rounded-full border border-fuchsia-400/30 backdrop-blur-md bg-white/5"
                    />

                    {/* Accent rotating arc */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full"
                    >
                      <div className="w-full h-full rounded-full border-t-2 border-violet-300 border-r-2 border-transparent shadow-[0_0_25px_rgba(167,139,250,0.4)]" />
                    </motion.div>

                    {/* Inner pulse ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-10 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-sm"
                    />

                    {/* Center ultra modern AI core */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden"
                    >
                      {/* Pulsing core orb */}
                      <motion.div
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.4, 0.9, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 blur-md"
                      />

                      {/* Scanning line */}
                      <motion.div
                        animate={{ y: [-20, 20, -20] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-violet-300 to-transparent opacity-60"
                      />

                      {/* Digital particles */}
                      <motion.div
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="absolute text-[10px] font-mono text-fuchsia-200 tracking-widest"
                      >
                        SECURITY
                      </motion.div>
                    </motion.div>
                  </div>

                  <h2 className="mt-10 text-white text-2xl font-semibold">
                    Validation cryptographique
                  </h2>

                  <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-300" />

                    <span className="text-white/75 text-sm">
                      Analyse neuronale IA en
                      cours...
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
                  className="py-16 text-center"
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
                    className="relative w-32 h-32 mx-auto"
                  >
                    <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-3xl animate-pulse" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_25px_70px_-10px_rgba(16,185,129,0.8)]">
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="mt-10 text-white text-3xl font-bold">
                    Accès autorisé
                  </h2>

                  <p className="mt-3 text-white/50">
                    Signature humaine confirmée •
                    environnement sécurisé
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
                    <Shield className="w-4 h-4 text-emerald-300" />

                    <span className="text-emerald-200 text-sm font-medium">
                      Security score:{' '}
                      {securityScore}%
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
                  className="py-16 text-center"
                >
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-red-500/40 blur-3xl" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  <h2 className="mt-10 text-white text-2xl font-semibold">
                    Signature invalide
                  </h2>

                  <p className="mt-3 text-white/50">
                    Nouvelle analyse sécurisée...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <div className="relative border-t border-white/10 bg-white/[0.03] px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-white/40" />

                <p className="text-[11px] text-white/45 uppercase tracking-[0.2em]">
                  Quantum encrypted tunnel
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Eye className="w-3 h-3 text-white/30" />

                <MousePointer2 className="w-3 h-3 text-white/30" />

                <ScanSearch className="w-3 h-3 text-white/30" />

                <p className="text-[11px] font-mono text-white/35">
                  v4.0 ULTRA LUXE
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
