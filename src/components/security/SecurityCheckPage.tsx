import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Eye,
  Fingerprint,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  MousePointer2,
  Orbit,
  RefreshCw,
  ScanFace,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';

import {
  solveProofOfWork,
  storeProof,
} from '@/lib/proofOfWork';

import blockageIpApi from '@/services/api/blockageIpApi';

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

type CaptchaMode = 'text' | 'math';

interface CaptchaChallenge {
  display: string;
  answer: string;
  mode: CaptchaMode;
  question?: string;
}

interface Position {
  x: number;
  y: number;
}

interface BotAnalysis {
  suspicious: boolean;
  reasons: string[];
}

interface VerificationPayload {
  challengeId: string;
  score: number;
  puzzleSolved: boolean;
  humanConfirmed: boolean;
  captchaPassed: boolean;
  proofOfWork?: unknown;
  behavior: {
    moveCount: number;
    pathLength: number;
    entropy: number;
    timingVariance: number;
    durationMs: number;
  };
  botSignals: string[];
}

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

const VERSION = '5.0.0';

const MAX_TRAIL = 22;
const MAX_ATTEMPTS = 5;
const CHALLENGE_TIMEOUT_MS = 90_000;

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

/* -------------------------------------------------------------------------- */
/* CRYPTOGRAPHIC RANDOM                                                        */
/* -------------------------------------------------------------------------- */

const secureRandomInt = (max: number): number => {
  if (max <= 0) return 0;

  const cryptoObj = globalThis.crypto;

  if (!cryptoObj?.getRandomValues) {
    return Math.floor(Math.random() * max);
  }

  const array = new Uint32Array(1);

  cryptoObj.getRandomValues(array);

  return array[0] % max;
};

const secureRandomString = (length = 16): string => {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

  let output = '';

  for (let i = 0; i < length; i++) {
    output += chars[secureRandomInt(chars.length)];
  }

  return output;
};

/* -------------------------------------------------------------------------- */
/* CAPTCHA                                                                     */
/* -------------------------------------------------------------------------- */

const generateTextCaptcha = (): CaptchaChallenge => {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let value = '';

  for (let i = 0; i < 7; i++) {
    value += chars[secureRandomInt(chars.length)];
  }

  return {
    display: value,
    answer: value,
    mode: 'text',
  };
};

const generateMathCaptcha = (): CaptchaChallenge => {
  const operations = ['+', '-', '×'] as const;

  const operation =
    operations[secureRandomInt(operations.length)];

  let a = secureRandomInt(80) + 10;
  let b = secureRandomInt(80) + 10;

  let result = 0;

  if (operation === '+') {
    result = a + b;
  }

  if (operation === '-') {
    if (b > a) {
      [a, b] = [b, a];
    }

    result = a - b;
  }

  if (operation === '×') {
    a = secureRandomInt(8) + 2;
    b = secureRandomInt(8) + 2;

    result = a * b;
  }

  return {
    display: `${a} ${operation} ${b}`,
    answer: String(result),
    question: `Combien font ${a} ${operation} ${b} ?`,
    mode: 'math',
  };
};

const generateCaptcha = (): CaptchaChallenge => {
  return secureRandomInt(2) === 0
    ? generateTextCaptcha()
    : generateMathCaptcha();
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const clamp = (
  value: number,
  min: number,
  max: number,
) => Math.min(Math.max(value, min), max);

const safeSessionGet = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSessionSet = (
  key: string,
  value: string,
) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage may be disabled.
  }
};

const safeSessionRemove = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/* -------------------------------------------------------------------------- */
/* STAR                                                                        */
/* -------------------------------------------------------------------------- */

const Star = ({
  moving = false,
  active = false,
  reducedMotion = false,
}: {
  moving?: boolean;
  active?: boolean;
  reducedMotion?: boolean;
}) => {
  return (
    <div className="relative w-[54px] h-[54px]">
      {active && (
        <>
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.6, 0.2],
                  }
            }
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
          />

          <div className="absolute inset-1 rounded-full border border-emerald-300/40" />
        </>
      )}

      <motion.svg
        width="54"
        height="54"
        viewBox="0 0 24 24"
        animate={
          reducedMotion || !moving
            ? undefined
            : {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.06, 1],
              }
        }
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]"
      >
        <defs>
          <linearGradient
            id={moving ? 'star-v5-moving' : 'star-v5-fixed'}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {moving ? (
              <>
                <stop
                  offset="0%"
                  stopColor="#f5d0fe"
                />
                <stop
                  offset="50%"
                  stopColor="#ec4899"
                />
                <stop
                  offset="100%"
                  stopColor="#7c3aed"
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
                  stopColor="#94a3b8"
                />
              </>
            )}
          </linearGradient>
        </defs>

        <path
          d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
          fill={`url(#${
            moving
              ? 'star-v5-moving'
              : 'star-v5-fixed'
          })`}
          stroke="#ffffff"
          strokeWidth="0.8"
        />
      </motion.svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* METRIC                                                                      */
/* -------------------------------------------------------------------------- */

const Metric = ({
  icon,
  label,
  value,
  accent = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: 'violet' | 'cyan' | 'emerald' | 'rose';
}) => {
  const colors = {
    violet: 'text-violet-300',
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
  };

  return (
    <motion.div
      whileHover={{
        y: -2,
        scale: 1.01,
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl"
    >
      <div
        className={`flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] ${colors[accent]}`}
      >
        {icon}

        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN                                                                        */
/* -------------------------------------------------------------------------- */

const SecurityCheckPage: React.FC<
  SecurityCheckPageProps
> = ({ onVerified }) => {
  const reducedMotion = useReducedMotion();

  const [phase, setPhase] =
    useState<Phase>('boot');

  const [ipBlocked, setIpBlocked] =
    useState(false);

  const [ipChecked, setIpChecked] =
    useState(false);

  const [ipBlockedInfo, setIpBlockedInfo] =
    useState<{
      ip: string;
      reason: string | null;
    }>({
      ip: '',
      reason: null,
    });

  const [image, setImage] =
    useState('');

  const [targetX, setTargetX] =
    useState(0);

  const [targetY, setTargetY] =
    useState(0);

  const [starX, setStarX] =
    useState(30);

  const [starY, setStarY] =
    useState(180);

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
    useState('PROTECTED');

  const [motionTrail, setMotionTrail] =
    useState<Position[]>([]);

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
    useState('ÉLEVÉ');

  const [failedAttempts, setFailedAttempts] =
    useState(0);

  const [challengeExpired, setChallengeExpired] =
    useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      CHALLENGE_TIMEOUT_MS / 1000,
    );

  const [proofReady, setProofReady] =
    useState(false);

  const [verificationError, setVerificationError] =
    useState('');

  /* ------------------------------------------------------------------------ */
  /* REFS                                                                     */
  /* ------------------------------------------------------------------------ */

  const containerRef =
    useRef<HTMLDivElement>(null);

  const dragStartOffset =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const lastPosRef =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const startTime =
    useRef(Date.now());

  const lastMoveTime =
    useRef(Date.now());

  const moveCount =
    useRef(0);

  const entropyRef =
    useRef(0);

  const pathLengthRef =
    useRef(0);

  const velocitySamples =
    useRef<number[]>([]);

  const movementIntervals =
    useRef<number[]>([]);

  const challengeTimer =
    useRef<number | null>(null);

  const verificationLock =
    useRef(false);

  const ipBlockedRef =
    useRef(false);

  const challengeId =
    useMemo(
      () => secureRandomString(18),
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* SAFE VERIFIED                                                            */
  /* ------------------------------------------------------------------------ */

  const safeVerified =
    useCallback(() => {
      if (ipBlockedRef.current) return;

      onVerified();
    }, [onVerified]);

  /* ------------------------------------------------------------------------ */
  /* IP CHECK                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const checkIp = async () => {
      try {
        const response =
          await blockageIpApi.check();

        if (!mounted) return;

        const blocked =
          Boolean(response.blocked);

        ipBlockedRef.current =
          blocked;

        setIpBlocked(blocked);

        if (blocked) {
          setIpBlockedInfo({
            ip: response.ip,
            reason: response.reason,
          });

          safeSessionRemove(
            'security_verified_v5',
          );
        }

        setIpChecked(true);
      } catch {
        if (mounted) {
          setIpChecked(true);
        }
      }
    };

    void checkIp();

    const interval =
      window.setInterval(
        checkIp,
        15_000,
      );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* CHALLENGE GENERATION                                                     */
  /* ------------------------------------------------------------------------ */

  const generateChallenge =
    useCallback(() => {
      const selectedImage =
        images[
          secureRandomInt(images.length)
        ];

      setImage(
        `${selectedImage}?auto=format&fit=crop&w=1400&q=90`,
      );

      setTargetX(
        secureRandomInt(220) + 40,
      );

      setTargetY(
        secureRandomInt(110) + 40,
      );

      setStarX(
        secureRandomInt(50) + 10,
      );

      setStarY(
        secureRandomInt(70) + 150,
      );

      setVerifiedPuzzle(false);
      setChecked(false);
      setCaptchaPassed(false);
      setCaptchaRequired(false);
      setCaptchaInput('');
      setCaptchaText(generateCaptcha());

      setMotionTrail([]);

      setChallengeExpired(false);
      setRemainingSeconds(
        CHALLENGE_TIMEOUT_MS / 1000,
      );

      setVerificationError('');

      moveCount.current = 0;
      entropyRef.current = 0;
      pathLengthRef.current = 0;

      velocitySamples.current = [];
      movementIntervals.current = [];

      startTime.current =
        Date.now();

      lastMoveTime.current =
        Date.now();

      lastPosRef.current = {
        x: 0,
        y: 0,
      };

      setSecurityScore(0);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* INITIAL BOOT                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!ipChecked || ipBlocked) {
      return;
    }

    generateChallenge();

    let trusted = false;

    try {
      trusted =
        localStorage.getItem(
          'security_browser_trusted_v5',
        ) === '1';
    } catch {
      trusted = false;
    }

    const bootTimer =
      window.setTimeout(() => {
        setPhase('checking');
      }, 700);

    const challengeTimerId =
      window.setTimeout(() => {
        setPhase(
          trusted
            ? 'passed'
            : 'challenge',
        );
      }, trusted ? 1_500 : 2_300);

    return () => {
      window.clearTimeout(
        bootTimer,
      );

      window.clearTimeout(
        challengeTimerId,
      );
    };
  }, [
    ipChecked,
    ipBlocked,
    generateChallenge,
  ]);

  /* ------------------------------------------------------------------------ */
  /* PROOF OF WORK                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !ipChecked ||
      ipBlocked ||
      phase !== 'checking'
    ) {
      return;
    }

    let mounted = true;

    void solveProofOfWork(
      undefined,
      18,
    ).then((proof) => {
      if (!mounted) return;

      if (proof) {
        storeProof(proof);
        setProofReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [
    phase,
    ipChecked,
    ipBlocked,
  ]);

  /* ------------------------------------------------------------------------ */
  /* CHALLENGE TIMEOUT                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      phase !== 'challenge' ||
      verifiedPuzzle
    ) {
      return;
    }

    const startedAt =
      Date.now();

    challengeTimer.current =
      window.setInterval(() => {
        const elapsed =
          Date.now() - startedAt;

        const remaining =
          Math.max(
            0,
            Math.ceil(
              (CHALLENGE_TIMEOUT_MS -
                elapsed) /
                1000,
            ),
          );

        setRemainingSeconds(
          remaining,
        );

        if (
          elapsed >=
          CHALLENGE_TIMEOUT_MS
        ) {
          setChallengeExpired(
            true,
          );

          setIsDragging(false);

          if (
            challengeTimer.current
          ) {
            window.clearInterval(
              challengeTimer.current,
            );
          }
        }
      }, 250);

    return () => {
      if (
        challengeTimer.current
      ) {
        window.clearInterval(
          challengeTimer.current,
        );
      }
    };
  }, [
    phase,
    verifiedPuzzle,
  ]);

  /* ------------------------------------------------------------------------ */
  /* POSITION                                                                  */
  /* ------------------------------------------------------------------------ */

  const getRelativePosition =
    useCallback(
      (
        clientX: number,
        clientY: number,
      ): Position => {
        if (!containerRef.current) {
          return {
            x: 0,
            y: 0,
          };
        }

        const rect =
          containerRef.current.getBoundingClientRect();

        return {
          x: clamp(
            clientX -
              rect.left -
              dragStartOffset.current.x,
            0,
            rect.width - 54,
          ),

          y: clamp(
            clientY -
              rect.top -
              dragStartOffset.current.y,
            0,
            rect.height - 54,
          ),
        };
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* OVERLAP                                                                   */
  /* ------------------------------------------------------------------------ */

  const checkOverlap =
    useCallback(
      (x: number, y: number) => {
        const distance =
          Math.sqrt(
            Math.pow(
              x - targetX,
              2,
            ) +
              Math.pow(
                y - targetY,
                2,
              ),
          );

        const matched =
          distance < 24;

        setIsOverTarget(
          matched,
        );

        if (matched) {
          setStarX(targetX);
          setStarY(targetY);
        }
      },
      [targetX, targetY],
    );

  /* ------------------------------------------------------------------------ */
  /* DRAG START                                                                */
  /* ------------------------------------------------------------------------ */

  const handleDragStart =
    useCallback(
      (
        clientX: number,
        clientY: number,
      ) => {
        if (
          challengeExpired ||
          verifiedPuzzle ||
          !containerRef.current
        ) {
          return;
        }

        const rect =
          containerRef.current.getBoundingClientRect();

        const relX =
          clientX - rect.left;

        const relY =
          clientY - rect.top;

        const inside =
          Math.abs(
            relX -
              starX -
              27,
          ) < 38 &&
          Math.abs(
            relY -
              starY -
              27,
          ) < 38;

        if (!inside) return;

        dragStartOffset.current = {
          x: relX - starX,
          y: relY - starY,
        };

        lastPosRef.current = {
          x: starX,
          y: starY,
        };

        lastMoveTime.current =
          Date.now();

        setIsDragging(true);
      },
      [
        challengeExpired,
        verifiedPuzzle,
        starX,
        starY,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* DRAG MOVE                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleDragMove =
    useCallback(
      (
        clientX: number,
        clientY: number,
      ) => {
        if (
          !isDragging ||
          challengeExpired
        ) {
          return;
        }

        const now =
          Date.now();

        const delta =
          Math.max(
            1,
            now -
              lastMoveTime.current,
          );

        lastMoveTime.current =
          now;

        moveCount.current += 1;

        movementIntervals.current.push(
          delta,
        );

        if (
          movementIntervals.current
            .length > 30
        ) {
          movementIntervals.current.shift();
        }

        const position =
          getRelativePosition(
            clientX,
            clientY,
          );

        const dx =
          position.x -
          lastPosRef.current.x;

        const dy =
          position.y -
          lastPosRef.current.y;

        const distance =
          Math.sqrt(
            dx * dx + dy * dy,
          );

        pathLengthRef.current +=
          distance;

        velocitySamples.current.push(
          distance / delta,
        );

        if (
          velocitySamples.current
            .length > 60
        ) {
          velocitySamples.current.shift();
        }

        entropyRef.current +=
          Math.abs(dx) +
          Math.abs(dy);

        lastPosRef.current =
          position;

        setStarX(position.x);
        setStarY(position.y);

        setMotionTrail(
          (previous) =>
            [
              ...previous,
              position,
            ].slice(-MAX_TRAIL),
        );

        checkOverlap(
          position.x,
          position.y,
        );

        const samples =
          movementIntervals.current;

        if (samples.length > 2) {
          const avg =
            samples.reduce(
              (a, b) => a + b,
              0,
            ) /
            samples.length;

          const variance =
            samples.reduce(
              (acc, value) =>
                acc +
                Math.pow(
                  value - avg,
                  2,
                ),
              0,
            ) /
            samples.length;

          setTimingVariance(
            Math.round(
              variance,
            ),
          );
        }
      },
      [
        isDragging,
        challengeExpired,
        getRelativePosition,
        checkOverlap,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* DRAG END                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleDragEnd =
    useCallback(() => {
      if (!isDragging) return;

      setIsDragging(false);

      if (
        isOverTarget &&
        !challengeExpired
      ) {
        window.setTimeout(() => {
          setVerifiedPuzzle(
            true,
          );
        }, reducedMotion ? 0 : 350);
      }
    }, [
      isDragging,
      isOverTarget,
      challengeExpired,
      reducedMotion,
    ]);

  /* ------------------------------------------------------------------------ */
  /* POINTER EVENTS                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isDragging) return;

    const move =
      (event: PointerEvent) => {
        handleDragMove(
          event.clientX,
          event.clientY,
        );
      };

    const up = () => {
      handleDragEnd();
    };

    window.addEventListener(
      'pointermove',
      move,
      { passive: true },
    );

    window.addEventListener(
      'pointerup',
      up,
    );

    window.addEventListener(
      'pointercancel',
      up,
    );

    return () => {
      window.removeEventListener(
        'pointermove',
        move,
      );

      window.removeEventListener(
        'pointerup',
        up,
      );

      window.removeEventListener(
        'pointercancel',
        up,
      );
    };
  }, [
    isDragging,
    handleDragMove,
    handleDragEnd,
  ]);

  /* ------------------------------------------------------------------------ */
  /* BOT SIGNALS                                                              */
  /* ------------------------------------------------------------------------ */

  const analyzeEnvironment =
    useCallback((): BotAnalysis => {
      const reasons: string[] = [];

      const navigatorData =
        navigator as Navigator & {
          webdriver?: boolean;
        };

      if (
        navigatorData.webdriver
      ) {
        reasons.push(
          'automation-signal',
        );
      }

      if (
        !navigator.language ||
        !navigator.languages?.length
      ) {
        reasons.push(
          'missing-language',
        );
      }

      if (
        !window.crypto?.subtle
      ) {
        reasons.push(
          'crypto-unavailable',
        );
      }

      if (
        !navigator.hardwareConcurrency
      ) {
        reasons.push(
          'hardware-info-unavailable',
        );
      }

      return {
        suspicious:
          reasons.length > 0,
        reasons,
      };
    }, []);

  /* ------------------------------------------------------------------------ */
  /* SCORE                                                                     */
  /* ------------------------------------------------------------------------ */

  const computeLiveScore =
    useCallback(() => {
      const duration =
        Date.now() -
        startTime.current;

      let score = 0;

      if (duration > 2_500) {
        score += 12;
      }

      if (duration > 6_000) {
        score += 8;
      }

      if (moveCount.current > 8) {
        score += 12;
      }

      if (
        moveCount.current > 20
      ) {
        score += 8;
      }

      if (
        pathLengthRef.current >
        120
      ) {
        score += 10;
      }

      if (
        entropyRef.current >
        100
      ) {
        score += 10;
      }

      if (
        timingVariance >
        5
      ) {
        score += 8;
      }

      if (verifiedPuzzle) {
        score += 18;
      }

      if (checked) {
        score += 8;
      }

      if (captchaPassed) {
        score += 15;
      }

      if (proofReady) {
        score += 5;
      }

      const bot =
        analyzeEnvironment();

      if (
        bot.reasons.length === 0
      ) {
        score += 6;
      }

      /*
       * Honeypot = signal de fraude.
       * Il ne doit pas être considéré comme une
       * preuve de sécurité.
       */
      if (honeypot.trim()) {
        score = 0;
      }

      score = clamp(
        Math.round(score),
        0,
        100,
      );

      setSecurityScore(
        score,
      );

      setBotReasons(
        bot.reasons,
      );

      if (score >= 90) {
        setRiskLevel(
          'MINIMAL',
        );
      } else if (
        score >= 75
      ) {
        setRiskLevel('BAS');
      } else if (
        score >= 50
      ) {
        setRiskLevel(
          'MOYEN',
        );
      } else {
        setRiskLevel(
          'ÉLEVÉ',
        );
      }

      return {
        score,
        bot,
      };
    }, [
      analyzeEnvironment,
      captchaPassed,
      checked,
      honeypot,
      proofReady,
      timingVariance,
      verifiedPuzzle,
    ]);

  useEffect(() => {
    if (
      phase !== 'challenge'
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        computeLiveScore();
      }, 500);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    phase,
    computeLiveScore,
  ]);

  /* ------------------------------------------------------------------------ */
  /* CAPTCHA REQUIREMENT                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !verifiedPuzzle ||
      challengeExpired
    ) {
      return;
    }

    const { score } =
      computeLiveScore();

    if (
      failedAttempts > 0 ||
      score < 82 ||
      botReasons.length > 0
    ) {
      setCaptchaRequired(
        true,
      );
    }
  }, [
    verifiedPuzzle,
    challengeExpired,
    failedAttempts,
    computeLiveScore,
    botReasons.length,
  ]);

  /* ------------------------------------------------------------------------ */
  /* CAPTCHA CHECK                                                            */
  /* ------------------------------------------------------------------------ */

  const verifyCaptcha =
    useCallback(() => {
      const userValue =
        captchaInput
          .trim()
          .toUpperCase();

      const expected =
        captchaText.answer
          .trim()
          .toUpperCase();

      if (
        userValue.length === 0
      ) {
        return false;
      }

      if (
        userValue !== expected
      ) {
        setCaptchaPassed(
          false,
        );

        setCaptchaText(
          generateCaptcha(),
        );

        setCaptchaInput('');

        return false;
      }

      setCaptchaPassed(
        true,
      );

      return true;
    }, [
      captchaInput,
      captchaText.answer,
    ]);

  /* ------------------------------------------------------------------------ */
  /* FINAL SECURITY CHECK                                                     */
  /* ------------------------------------------------------------------------ */

  const performSecurityCheck =
    useCallback(() => {
      if (
        honeypot.trim()
      ) {
        return false;
      }

      if (
        challengeExpired
      ) {
        return false;
      }

      if (
        !verifiedPuzzle
      ) {
        return false;
      }

      if (!checked) {
        return false;
      }

      if (
        captchaRequired &&
        !captchaPassed
      ) {
        return false;
      }

      const {
        score,
        bot,
      } =
        computeLiveScore();

      /*
       * Les signaux frontend ne sont pas
       * une autorité de sécurité.
       *
       * Ici ils servent seulement à bloquer
       * les scénarios manifestement anormaux.
       */
      if (
        bot.reasons.includes(
          'automation-signal',
        )
      ) {
        return false;
      }

      return score >= 75;
    }, [
      honeypot,
      challengeExpired,
      verifiedPuzzle,
      checked,
      captchaRequired,
      captchaPassed,
      computeLiveScore,
    ]);

  /* ------------------------------------------------------------------------ */
  /* SERVER VERIFICATION                                                      */
  /* ------------------------------------------------------------------------ */

  const verifyWithBackend =
    useCallback(
      async (
        payload: VerificationPayload,
      ): Promise<boolean> => {
        /*
         * IMPORTANT :
         *
         * Branche ici ton endpoint backend.
         *
         * Exemple :
         *
         * const response = await fetch(
         *   '/api/security/verify',
         *   {
         *     method: 'POST',
         *     headers: {
         *       'Content-Type': 'application/json',
         *       'X-CSRF-Token': csrfToken,
         *     },
         *     credentials: 'include',
         *     body: JSON.stringify(payload),
         *   },
         * );
         *
         * return response.ok;
         */

        /*
         * Pour conserver la compatibilité avec ton
         * composant actuel, on utilise ici la décision
         * frontend.
         *
         * EN PRODUCTION :
         * remplace cette ligne par ton endpoint backend.
         */
        return performSecurityCheck();
      },
      [performSecurityCheck],
    );

  /* ------------------------------------------------------------------------ */
  /* VERIFY                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleVerify =
    useCallback(async () => {
      if (
        verificationLock.current
      ) {
        return;
      }

      if (
        failedAttempts >=
        MAX_ATTEMPTS
      ) {
        setVerificationError(
          'Nombre maximal de tentatives atteint.',
        );

        return;
      }

      if (
        captchaRequired &&
        !captchaPassed
      ) {
        return;
      }

      verificationLock.current =
        true;

      setVerificationError('');

      setPhase(
        'verifying',
      );

      const engines = [
        'BEHAVIORAL',
        'CRYPTOGRAPHIC',
        'RISK ENGINE',
        'SECURE CORE',
      ];

      setNetworkQuality(
        engines[
          secureRandomInt(
            engines.length,
          )
        ],
      );

      const analysis =
        analyzeEnvironment();

      const payload: VerificationPayload =
        {
          challengeId,
          score: securityScore,
          puzzleSolved:
            verifiedPuzzle,
          humanConfirmed:
            checked,
          captchaPassed:
            captchaPassed ||
            !captchaRequired,
          behavior: {
            moveCount:
              moveCount.current,
            pathLength:
              pathLengthRef.current,
            entropy:
              entropyRef.current,
            timingVariance,
            durationMs:
              Date.now() -
              startTime.current,
          },
          botSignals:
            analysis.reasons,
        };

      try {
        const passed =
          await new Promise<boolean>(
            (resolve) => {
              window.setTimeout(
                async () => {
                  resolve(
                    await verifyWithBackend(
                      payload,
                    ),
                  );
                },
                reducedMotion
                  ? 250
                  : 1_800,
              );
            },
          );

        if (!passed) {
          setFailedAttempts(
            (previous) =>
              previous + 1,
          );

          setPhase(
            'failed',
          );

          setVerificationError(
            'La vérification n’a pas été validée.',
          );

          verificationLock.current =
            false;

          window.setTimeout(
            () => {
              generateChallenge();
              setPhase(
                'challenge',
              );
            },
            reducedMotion
              ? 500
              : 2_400,
          );

          return;
        }

        /* -------------------------------------------------------------- */
        /* SUCCESS                                                         */
        /* -------------------------------------------------------------- */

        setSecurityScore(
          Math.max(
            securityScore,
            92,
          ),
        );

        setPhase(
          'passed',
        );

        /*
         * Ce stockage n'est PAS une preuve de sécurité.
         * Il sert uniquement à améliorer l'expérience utilisateur.
         */
        safeSessionSet(
          'security_verified_v5',
          JSON.stringify({
            verified: true,
            timestamp: Date.now(),
            challengeId,
            version: VERSION,
          }),
        );

        try {
          localStorage.setItem(
            'security_browser_trusted_v5',
            '1',
          );
        } catch {
          // ignore
        }

        window.setTimeout(
          () => {
            safeVerified();
          },
          reducedMotion
            ? 300
            : 1_700,
        );
      } catch {
        setPhase('failed');

        setVerificationError(
          'Impossible de contacter le service de sécurité.',
        );

        verificationLock.current =
          false;
      }
    }, [
      failedAttempts,
      captchaRequired,
      captchaPassed,
      analyzeEnvironment,
      challengeId,
      securityScore,
      verifiedPuzzle,
      checked,
      timingVariance,
      verifyWithBackend,
      reducedMotion,
      generateChallenge,
      safeVerified,
    ]);

  /* ------------------------------------------------------------------------ */
  /* REGENERATE                                                               */
  /* ------------------------------------------------------------------------ */

  const regenerateCaptcha =
    useCallback(() => {
      setCaptchaText(
        generateCaptcha(),
      );

      setCaptchaInput('');
      setCaptchaPassed(false);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* SPEECH                                                                    */
  /* ------------------------------------------------------------------------ */

  const speakCaptcha =
    useCallback(() => {
      try {
        const speech =
          new SpeechSynthesisUtterance(
            captchaText.mode ===
            'math'
              ? captchaText.question ||
                  captchaText.display
              : captchaText.answer
                  .split('')
                  .join(' '),
          );

        speech.rate = 0.75;

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
          speech,
        );
      } catch {
        // Speech API unavailable.
      }
    }, [
      captchaText,
    ]);

  /* ------------------------------------------------------------------------ */
  /* BLOCKED IP UI                                                            */
  /* ------------------------------------------------------------------------ */

  if (ipBlocked) {
    return (
      <div className="min-h-screen bg-[#050102] text-white flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.22),transparent_55%)]" />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="absolute -inset-px rounded-[34px] bg-gradient-to-br from-red-500/50 via-orange-500/20 to-transparent" />

          <div className="relative rounded-[34px] border border-red-500/20 bg-black/50 backdrop-blur-2xl p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : {
                      scale: [1, 1.05, 1],
                    }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_20px_60px_rgba(239,68,68,0.35)]"
            >
              <ShieldAlert className="w-10 h-10" />
            </motion.div>

            <h1 className="mt-7 text-2xl font-bold">
              Accès bloqué
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Votre adresse IP a été bloquée
              par l'administrateur.
            </p>

            {ipBlockedInfo.ip && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-red-300/60">
                  Identifiant réseau
                </p>

                <p className="mt-2 font-mono text-sm text-red-200">
                  {ipBlockedInfo.ip}
                </p>
              </div>
            )}

            {ipBlockedInfo.reason && (
              <p className="mt-4 text-xs text-white/40">
                Motif :{' '}
                {ipBlockedInfo.reason}
              </p>
            )}

            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/25">
              <Lock className="w-3 h-3" />
              Security Gateway V5
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* MAIN UI                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020207] flex items-center justify-center p-4 sm:p-6 text-white">
      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,58,237,0.25),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.18),transparent_30%),radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.10),transparent_45%)]" />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-[360px] -left-[360px] w-[900px] h-[900px] rounded-full border border-violet-500/10"
        />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 130,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-[450px] -right-[450px] w-[1100px] h-[1100px] rounded-full border border-fuchsia-500/10"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize:
              '52px 52px',
          }}
        />

        {!reducedMotion && (
          <>
            <motion.div
              animate={{
                x: [
                  '-25%',
                  '25%',
                  '-25%',
                ],
                opacity: [
                  0.2,
                  0.5,
                  0.2,
                ],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,.22),transparent_65%)]"
            />

            <motion.div
              animate={{
                x: [
                  '20%',
                  '-20%',
                  '20%',
                ],
                opacity: [
                  0.15,
                  0.4,
                  0.15,
                ],
              }}
              transition={{
                duration: 23,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-[-25%] right-[5%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,.18),transparent_65%)]"
            />

            <motion.div
              animate={{
                top: [
                  '-5%',
                  '105%',
                ],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/30 to-transparent"
            />
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CARD                                                                */}
      {/* ------------------------------------------------------------------ */}

      <motion.main
        initial={
          reducedMotion
            ? undefined
            : {
                opacity: 0,
                y: 25,
                scale: 0.97,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="absolute -inset-px rounded-[38px] bg-gradient-to-br from-white/15 via-violet-500/20 to-fuchsia-500/15" />

        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.055] backdrop-blur-3xl shadow-[0_40px_140px_-30px_rgba(0,0,0,.95)]">
          {/* -------------------------------------------------------------- */}
          {/* HEADER                                                          */}
          {/* -------------------------------------------------------------- */}

          <header className="relative px-6 sm:px-8 pt-7 pb-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          boxShadow: [
                            '0 0 20px rgba(139,92,246,.2)',
                            '0 0 50px rgba(236,72,153,.35)',
                            '0 0 20px rgba(139,92,246,.2)',
                          ],
                        }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center"
                >
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </motion.div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Security Gateway
                    </h1>

                    <Sparkles className="w-4 h-4 text-violet-300" />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: [
                                0.4,
                                1,
                                0.4,
                              ],
                            }
                      }
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                      }}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                    />

                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Adaptive Anti-Bot Engine
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                  CHALLENGE
                </p>

                <p className="mt-1 font-mono text-xs text-violet-200/80">
                  {challengeId}
                </p>
              </div>
            </div>
          </header>

          {/* -------------------------------------------------------------- */}
          {/* BODY                                                            */}
          {/* -------------------------------------------------------------- */}

          <section className="relative p-5 sm:p-8">
            {/* Honeypot */}

            <input
              aria-hidden="true"
              tabIndex={-1}
              type="text"
              autoComplete="off"
              value={honeypot}
              onChange={(event) =>
                setHoneypot(
                  event.target.value,
                )
              }
              className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
            />

            {/* METRICS */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
              <Metric
                icon={
                  <Cpu className="w-3 h-3" />
                }
                label="ENGINE"
                value={
                  networkQuality
                }
                accent="violet"
              />

              <Metric
                icon={
                  <Activity className="w-3 h-3" />
                }
                label="SCORE"
                value={`${securityScore}%`}
                accent="cyan"
              />

              <Metric
                icon={
                  <Shield className="w-3 h-3" />
                }
                label="RISK"
                value={riskLevel}
                accent={
                  riskLevel ===
                  'ÉLEVÉ'
                    ? 'rose'
                    : 'emerald'
                }
              />

              <Metric
                icon={
                  <Wifi className="w-3 h-3" />
                }
                label="PROTOCOL"
                value={
                  proofReady
                    ? 'PoW READY'
                    : 'SECURE'
                }
                accent="emerald"
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* PHASES                                                        */}
            {/* ------------------------------------------------------------ */}

            <AnimatePresence mode="wait">
              {/* BOOT */}

              {(phase === 'boot' ||
                phase ===
                  'checking') && (
                <motion.div
                  key="checking"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="py-16 sm:py-20 text-center"
                >
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: 360,
                            }
                      }
                      transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full border border-violet-500/20"
                    />

                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: -360,
                            }
                      }
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-5 rounded-full border border-fuchsia-500/20"
                    />

                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: 360,
                            }
                      }
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full border-t-2 border-violet-400 border-r-2 border-transparent"
                    />

                    <Fingerprint className="relative w-14 h-14 text-violet-300" />
                  </div>

                  <h2 className="mt-9 text-xl sm:text-2xl font-semibold">
                    Initialisation du moteur de sécurité
                  </h2>

                  <p className="mt-3 text-sm text-white/40">
                    Analyse environnementale •
                    preuve de travail •
                    génération du challenge
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Initialisation...
                  </div>
                </motion.div>
              )}

              {/* CHALLENGE */}

              {phase ===
                'challenge' && (
                <motion.div
                  key="challenge"
                  initial={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: 12,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: -10,
                        }
                  }
                  className="space-y-6"
                >
                  {/* STATUS */}

                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2">
                      <Orbit className="w-4 h-4 text-violet-300" />

                      <span className="text-xs text-violet-100">
                        Défi comportemental
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2">
                      <Zap className="w-4 h-4 text-cyan-300" />

                      <span className="text-xs text-cyan-100">
                        Adaptive protection
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      <span className="font-mono text-xs text-white/60">
                        {remainingSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* CHALLENGE IMAGE */}

                  <div className="relative">
                    <div className="absolute -inset-px rounded-[30px] bg-gradient-to-r from-violet-500/30 via-fuchsia-500/25 to-cyan-500/20" />

                    <div
                      ref={
                        containerRef
                      }
                      className="relative h-[290px] sm:h-[330px] overflow-hidden rounded-[30px] border border-white/10 bg-black/50 select-none"
                      style={{
                        touchAction:
                          'none',
                        cursor:
                          isDragging
                            ? 'grabbing'
                            : 'default',
                      }}
                      onPointerDown={(
                        event,
                      ) => {
                        (
                          event.currentTarget as HTMLElement
                        ).setPointerCapture?.(
                          event.pointerId,
                        );

                        handleDragStart(
                          event.clientX,
                          event.clientY,
                        );
                      }}
                    >
                      <img
                        src={image}
                        alt="Challenge visuel de sécurité"
                        draggable={
                          false
                        }
                        className="absolute inset-0 w-full h-full object-cover scale-[1.04]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/65" />

                      {!reducedMotion && (
                        <>
                          <motion.div
                            animate={{
                              y: [
                                '-100%',
                                '100%',
                              ],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-violet-300/10 to-transparent pointer-events-none"
                          />

                          <motion.div
                            animate={{
                              opacity: [
                                0.2,
                                0.5,
                                0.2,
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                            }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,.12),transparent_35%)]"
                          />
                        </>
                      )}

                      {/* TRAIL */}

                      {motionTrail.map(
                        (
                          point,
                          index,
                        ) => (
                          <motion.div
                            key={`${point.x}-${point.y}-${index}`}
                            initial={{
                              opacity:
                                0.65,
                              scale: 1,
                            }}
                            animate={{
                              opacity: 0,
                              scale:
                                0.25,
                            }}
                            transition={{
                              duration: 0.65,
                            }}
                            className="absolute z-10 w-5 h-5 rounded-full bg-fuchsia-400/25 blur-[2px] pointer-events-none"
                            style={{
                              left:
                                point.x +
                                20,
                              top:
                                point.y +
                                20,
                            }}
                          />
                        ),
                      )}

                      {/* TARGET */}

                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left:
                            targetX -
                            10,
                          top:
                            targetY -
                            10,
                        }}
                      >
                        <motion.div
                          animate={
                            reducedMotion
                              ? undefined
                              : {
                                  scale: [
                                    1,
                                    1.2,
                                    1,
                                  ],
                                  opacity: [
                                    0.3,
                                    0.9,
                                    0.3,
                                  ],
                                }
                          }
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                          }}
                          className="absolute w-20 h-20 rounded-full border border-white/50"
                        />

                        <div className="absolute w-20 h-20 rounded-full border border-dashed border-white/40" />

                        <div className="absolute inset-[10px] rounded-full border border-white/10" />
                      </div>

                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: targetX,
                          top: targetY,
                        }}
                      >
                        <Star
                          active={
                            isOverTarget
                          }
                          reducedMotion={
                            Boolean(
                              reducedMotion,
                            )
                          }
                        />
                      </div>

                      {/* MOVING STAR */}

                      <motion.div
                        className="absolute z-30"
                        animate={{
                          left: starX,
                          top: starY,
                          scale:
                            isDragging
                              ? 1.08
                              : 1,
                        }}
                        transition={{
                          left: {
                            duration:
                              isDragging
                                ? 0
                                : 0.08,
                          },
                          top: {
                            duration:
                              isDragging
                                ? 0
                                : 0.08,
                          },
                          scale: {
                            duration:
                              0.15,
                          },
                        }}
                        style={{
                          cursor:
                            isDragging
                              ? 'grabbing'
                              : 'grab',
                        }}
                        onPointerDown={(
                          event,
                        ) => {
                          event.stopPropagation();

                          handleDragStart(
                            event.clientX,
                            event.clientY,
                          );
                        }}
                      >
                        <Star
                          moving
                          active={
                            isOverTarget
                          }
                          reducedMotion={
                            Boolean(
                              reducedMotion,
                            )
                          }
                        />
                      </motion.div>

                      {/* HUD */}

                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 backdrop-blur-xl px-3 py-2">
                          <Globe className="w-3 h-3 text-cyan-300" />

                          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.18em] text-white/65">
                            Human interaction
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 backdrop-blur-xl px-3 py-2">
                          <Bot className="w-3 h-3 text-fuchsia-300" />

                          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.18em] text-white/65">
                            Adaptive AI
                          </span>
                        </div>
                      </div>

                      {/* SUCCESS OVERLAY */}

                      <AnimatePresence>
                        {verifiedPuzzle && (
                          <motion.div
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            className="absolute inset-0 z-40 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]"
                          >
                            <motion.div
                              initial={{
                                scale: 0.7,
                                opacity: 0,
                              }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                              }}
                              className="text-center"
                            >
                              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-300" />
                              </div>

                              <p className="mt-4 font-semibold">
                                Interaction validée
                              </p>

                              <p className="mt-1 text-xs text-white/50">
                                Signature comportementale reçue
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* EXPIRED */}

                      {challengeExpired && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                          <div className="text-center p-6">
                            <AlertTriangle className="w-12 h-12 mx-auto text-amber-300" />

                            <p className="mt-4 font-semibold">
                              Challenge expiré
                            </p>

                            <p className="mt-2 text-xs text-white/45">
                              Générez un nouveau challenge pour continuer.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                generateChallenge();
                                setPhase(
                                  'challenge',
                                );
                              }}
                              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Nouveau challenge
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HUMAN CONFIRMATION */}

                  <AnimatePresence>
                    {verifiedPuzzle && (
                      <motion.label
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 cursor-pointer"
                      >
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={(
                              event,
                            ) =>
                              setChecked(
                                event
                                  .target
                                  .checked,
                              )
                            }
                            className="peer appearance-none w-6 h-6 rounded-lg border border-white/20 bg-black/20 checked:bg-gradient-to-br checked:from-violet-500 checked:to-fuchsia-500 checked:border-transparent"
                          />

                          <CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            Je confirme être humain
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            Interaction + analyse de risque + validation sécurisée
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
                            scale: 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                          }}
                          className="relative"
                        >
                          <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-amber-400/30" />

                          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/25 backdrop-blur-xl p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3 mb-5">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-400 to-fuchsia-500 flex items-center justify-center">
                                  <KeyRound className="w-5 h-5" />
                                </div>

                                <div>
                                  <p className="font-bold">
                                    Vérification secondaire
                                  </p>

                                  <p className="text-[11px] text-white/40 mt-1">
                                    Challenge adaptatif
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={
                                    speakCaptcha
                                  }
                                  aria-label="Écouter le CAPTCHA"
                                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.09] transition"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    regenerateCaptcha
                                  }
                                  aria-label="Nouveau CAPTCHA"
                                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.09] transition"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* CAPTCHA DISPLAY */}

                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 min-h-[120px] flex items-center justify-center">
                              <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                  backgroundImage:
                                    'radial-gradient(circle at 20% 20%, #a78bfa 0, transparent 30%), radial-gradient(circle at 80% 70%, #ec4899 0, transparent 30%), linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)',
                                }}
                              />

                              <div
                                className="absolute inset-0 opacity-[0.07]"
                                style={{
                                  backgroundImage:
                                    'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                                  backgroundSize:
                                    '15px 15px',
                                }}
                              />

                              {!reducedMotion && (
                                <motion.div
                                  animate={{
                                    x: [
                                      '-120%',
                                      '120%',
                                    ],
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                />
                              )}

                              {captchaText.mode ===
                                'math' && (
                                <div className="absolute top-3 left-0 right-0 text-center text-[9px] uppercase tracking-[0.25em] text-white/40">
                                  Résolvez l'opération
                                </div>
                              )}

                              <div className="relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-8">
                                {captchaText.display
                                  .split('')
                                  .map(
                                    (
                                      char,
                                      index,
                                    ) => {
                                      const gradients =
                                        [
                                          'from-violet-300 to-fuchsia-400',
                                          'from-amber-300 to-rose-400',
                                          'from-cyan-300 to-violet-400',
                                          'from-fuchsia-300 to-amber-300',
                                          'from-emerald-300 to-cyan-400',
                                        ];

                                      const rotation =
                                        captchaText.mode ===
                                        'math'
                                          ? 0
                                          : (index *
                                              11) %
                                              26 -
                                            13;

                                      return (
                                        <motion.span
                                          key={`${captchaText.display}-${index}`}
                                          initial={{
                                            opacity: 0,
                                            y: 8,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: 0,
                                          }}
                                          transition={{
                                            delay:
                                              index *
                                              0.04,
                                          }}
                                          className={`bg-gradient-to-br ${
                                            gradients[
                                              index %
                                                gradients.length
                                            ]
                                          } bg-clip-text text-transparent font-black text-2xl sm:text-3xl md:text-4xl select-none`}
                                          style={{
                                            transform: `rotate(${rotation}deg)`,
                                          }}
                                        >
                                          {
                                            char
                                          }
                                        </motion.span>
                                      );
                                    },
                                  )}

                                {captchaText.mode ===
                                  'math' && (
                                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white/80 ml-2">
                                    = ?
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* INPUT */}

                            <div className="mt-5 flex justify-center gap-1.5 sm:gap-2">
                              {Array.from({
                                length:
                                  captchaText
                                    .answer
                                    .length,
                              }).map(
                                (
                                  _,
                                  index,
                                ) => (
                                  <input
                                    key={
                                      index
                                    }
                                    id={`captcha-v5-${index}`}
                                    type="text"
                                    inputMode="text"
                                    autoComplete="off"
                                    maxLength={
                                      1
                                    }
                                    value={
                                      captchaInput[
                                        index
                                      ] ||
                                      ''
                                    }
                                    onChange={(
                                      event,
                                    ) => {
                                      const value =
                                        event.target.value
                                          .slice(
                                            -1,
                                          )
                                          .toUpperCase();

                                      const array =
                                        captchaInput.split('');

                                      array[
                                        index
                                      ] =
                                        value;

                                      setCaptchaInput(
                                        array
                                          .join(
                                            '',
                                          )
                                          .slice(
                                            0,
                                            captchaText
                                              .answer
                                              .length,
                                          ),
                                      );

                                      if (
                                        value &&
                                        index <
                                          captchaText
                                            .answer
                                            .length -
                                            1
                                      ) {
                                        (
                                          document.getElementById(
                                            `captcha-v5-${index + 1}`,
                                          ) as HTMLInputElement | null
                                        )?.focus();
                                      }
                                    }}
                                    onKeyDown={(
                                      event,
                                    ) => {
                                      if (
                                        event.key ===
                                          'Backspace' &&
                                        !captchaInput[
                                          index
                                        ] &&
                                        index >
                                          0
                                      ) {
                                        (
                                          document.getElementById(
                                            `captcha-v5-${index - 1}`,
                                          ) as HTMLInputElement | null
                                        )?.focus();
                                      }
                                    }}
                                    onPaste={(
                                      event,
                                    ) => {
                                      event.preventDefault();

                                      const value =
                                        event.clipboardData
                                          .getData(
                                            'text',
                                          )
                                          .replace(
                                            /\s/g,
                                            '',
                                          )
                                          .slice(
                                            0,
                                            captchaText
                                              .answer
                                              .length,
                                          )
                                          .toUpperCase();

                                      setCaptchaInput(
                                        value,
                                      );
                                    }}
                                    aria-label={`Caractère CAPTCHA ${index + 1}`}
                                    className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-black/40 text-center text-white font-bold outline-none border transition-all ${
                                      captchaInput[
                                        index
                                      ]
                                        ? 'border-violet-400/60 shadow-[0_0_20px_rgba(139,92,246,.25)]'
                                        : 'border-white/10'
                                    } focus:border-fuchsia-400/70 focus:scale-105`}
                                  />
                                ),
                              )}
                            </div>

                            {captchaPassed && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: 'auto',
                                }}
                                className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />

                                <span className="text-xs text-emerald-100">
                                  Validation secondaire réussie
                                </span>
                              </motion.div>
                            )}

                            <button
                              type="button"
                              disabled={
                                captchaInput.length !==
                                  captchaText
                                    .answer
                                    .length ||
                                captchaPassed
                              }
                              onClick={
                                verifyCaptcha
                              }
                              className="relative overflow-hidden mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-4 h-4" />

                                {captchaPassed
                                  ? 'CAPTCHA validé'
                                  : 'Vérifier'}
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* BOT SIGNALS */}

                  {botReasons.length >
                    0 && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-300" />

                        <p className="text-sm font-medium text-amber-100">
                          Analyse renforcée
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {botReasons.map(
                          (reason) => (
                            <span
                              key={
                                reason
                              }
                              className="rounded-full border border-amber-500/20 bg-black/20 px-3 py-1 text-[10px] font-mono text-amber-200/80"
                            >
                              {reason}
                            </span>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* VERIFY BUTTON */}

                  <button
                    type="button"
                    onClick={
                      handleVerify
                    }
                    disabled={
                      challengeExpired ||
                      !verifiedPuzzle ||
                      !checked ||
                      (captchaRequired &&
                        !captchaPassed) ||
                      failedAttempts >=
                        MAX_ATTEMPTS
                    }
                    className={`group relative overflow-hidden w-full h-15 sm:h-16 rounded-2xl font-semibold transition-all ${
                      challengeExpired ||
                      !verifiedPuzzle ||
                      !checked ||
                      (captchaRequired &&
                        !captchaPassed) ||
                      failedAttempts >=
                        MAX_ATTEMPTS
                        ? 'bg-white/[0.04] border border-white/10 text-white/25 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white shadow-[0_25px_70px_-20px_rgba(139,92,246,.75)] hover:-translate-y-1'
                    }`}
                  >
                    {!challengeExpired &&
                      verifiedPuzzle &&
                      checked &&
                      !(
                        captchaRequired &&
                        !captchaPassed
                      ) && (
                        <motion.div
                          animate={
                            reducedMotion
                              ? undefined
                              : {
                                  x: [
                                    '-120%',
                                    '220%',
                                  ],
                                }
                          }
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="absolute inset-y-0 w-24 bg-white/20 rotate-12"
                        />
                      )}

                    <span className="relative flex items-center justify-center gap-3">
                      <ScanFace className="w-5 h-5" />

                      Vérifier mon accès
                    </span>
                  </button>

                  {verificationError && (
                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs text-red-200"
                    >
                      {verificationError}
                    </motion.div>
                  )}

                  {failedAttempts >
                    0 && (
                    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/25">
                      Tentatives :{' '}
                      {
                        failedAttempts
                      }{' '}
                      /{' '}
                      {
                        MAX_ATTEMPTS
                      }
                    </p>
                  )}
                </motion.div>
              )}

              {/* VERIFYING */}

              {phase ===
                'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="py-16 sm:py-20 text-center"
                >
                  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: 360,
                            }
                      }
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full border border-violet-400/20"
                    />

                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: -360,
                            }
                      }
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-6 rounded-full border border-fuchsia-400/25"
                    />

                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              rotate: 360,
                            }
                      }
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full border-t-2 border-violet-300 border-r-2 border-transparent"
                    />

                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              scale: [
                                1,
                                1.15,
                                1,
                              ],
                            }
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="relative w-16 h-16 rounded-full border border-white/10 bg-black/40 flex items-center justify-center"
                    >
                      <Zap className="w-7 h-7 text-violet-300" />
                    </motion.div>
                  </div>

                  <h2 className="mt-10 text-xl sm:text-2xl font-semibold">
                    Vérification en cours
                  </h2>

                  <p className="mt-3 text-sm text-white/40">
                    Analyse du challenge et des signaux de risque...
                  </p>

                  <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
                    <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />

                    <span className="text-sm text-white/60">
                      Secure verification
                    </span>
                  </div>
                </motion.div>
              )}

              {/* PASSED */}

              {phase ===
                'passed' && (
                <motion.div
                  key="passed"
                  initial={{
                    opacity: 0,
                    scale: 0.85,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="py-14 sm:py-16 text-center"
                >
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -90,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 14,
                    }}
                    className="relative w-32 h-32 mx-auto"
                  >
                    {!reducedMotion && (
                      <motion.div
                        animate={{
                          scale: [
                            1,
                            1.25,
                            1,
                          ],
                          opacity: [
                            0.2,
                            0.5,
                            0.2,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
                      />
                    )}

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_25px_80px_-15px_rgba(16,185,129,.8)]">
                      <CheckCircle2 className="w-16 h-16" />
                    </div>
                  </motion.div>

                  <h2 className="mt-10 text-3xl font-bold">
                    Accès autorisé
                  </h2>

                  <p className="mt-3 text-sm text-white/45">
                    Vérification réussie • environnement approuvé
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-3">
                    <Shield className="w-4 h-4 text-emerald-300" />

                    <span className="text-sm font-medium text-emerald-100">
                      Security score{' '}
                      {
                        securityScore
                      }
                      %
                    </span>
                  </div>
                </motion.div>
              )}

              {/* FAILED */}

              {phase ===
                'failed' && (
                <motion.div
                  key="failed"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    x: reducedMotion
                      ? 0
                      : [
                          0,
                          -6,
                          6,
                          -6,
                          6,
                          0,
                        ],
                  }}
                  className="py-14 sm:py-16 text-center"
                >
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-14 h-14" />
                    </div>
                  </div>

                  <h2 className="mt-9 text-2xl font-semibold">
                    Vérification refusée
                  </h2>

                  <p className="mt-3 text-sm text-white/45">
                    Génération d'un nouveau challenge sécurisé...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* -------------------------------------------------------------- */}
          {/* FOOTER                                                          */}
          {/* -------------------------------------------------------------- */}

          <footer className="relative border-t border-white/10 bg-white/[0.025] px-5 sm:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-white/30" />

                <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Protected security gateway
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Eye className="w-3 h-3 text-white/20" />

                <MousePointer2 className="w-3 h-3 text-white/20" />

                <ScanSearch className="w-3 h-3 text-white/20" />

                <span className="font-mono text-[9px] text-white/25">
                  V{VERSION}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </motion.main>
    </div>
  );
};

export default SecurityCheckPage;