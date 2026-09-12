import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  EyeOff,
  Cpu,
  ScanFace,
  ScanEye,
  Radar,
  Orbit,
  ShieldCheck,
  Activity,
  MousePointer2,
  Satellite,
  Waves,
  Hexagon,
  Network,
  BadgeCheck,
  KeyRound,
  ShieldAlert,
  Bot,
  Flame,
  RefreshCw,
  Volume2,
} from 'lucide-react';

import useLightMotion from '@/hooks/useLightMotion';
import { solveProofOfWork, storeProof } from '@/lib/proofOfWork';
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

type CaptchaChallenge = {
  display: string;
  answer: string;
  mode: 'text' | 'math';
  question?: string;
};

type Point = {
  x: number;
  y: number;
};

const MAX_TRAIL = 10;
const BASE_TARGET_RADIUS = 18;
const MIN_HUMAN_TIME_MS = 1200;
const IP_CHECK_FALLBACK_MS = 6000;
const SCORE_UPDATE_MS = 700;

const IMAGE_BASE_URLS = [
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

const getChallengeImage = (base: string) =>
  `${base}?auto=format&fit=crop&w=1200&h=640&q=72&fm=webp`;

const randomString = (length: number) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .toUpperCase();

const generateTextCaptcha = (): CaptchaChallenge => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let value = '';

  for (let i = 0; i < 8; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }

  return {
    display: value,
    answer: value,
    mode: 'text',
  };
};

const generateMathCaptcha = (): CaptchaChallenge => {
  const ops = ['+', '-', '×'] as const;

  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = Math.floor(Math.random() * 90) + 10;
  let b = Math.floor(Math.random() * 90) + 10;

  let result = 0;

  if (op === '+') {
    result = a + b;
  } else if (op === '-') {
    if (b > a) {
      [a, b] = [b, a];
    }

    result = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    result = a * b;
  }

  const question = `Combien font ${a} ${op} ${b} ?`;

  return {
    display: `${a} ${op} ${b}`,
    answer: String(result),
    mode: 'math',
    question,
  };
};

const generateCaptcha = (): CaptchaChallenge =>
  Math.random() < 0.5
    ? generateMathCaptcha()
    : generateTextCaptcha();

/* -------------------------------------------------------------------------- */
/* Small visual components                                                    */
/* -------------------------------------------------------------------------- */

const Star = memo(function Star({
  moving = false,
}: {
  moving?: boolean;
}) {
  return (
    <div
      className={[
        'relative w-[54px] h-[54px] will-change-transform',
        moving ? 'security-star-moving' : '',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-1 rounded-full blur-xl',
          moving ? 'bg-red-500/30' : 'bg-white/20',
        ].join(' ')}
      />

      <svg
        width="54"
        height="54"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative"
      >
        <defs>
          <linearGradient
            id={moving ? 'security-star-red' : 'security-star-white'}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {moving ? (
              <>
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="50%" stopColor="#ef4444" />
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
          fill={`url(#${
            moving ? 'security-star-red' : 'security-star-white'
          })`}
          stroke="#fff"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
});

const Metric = memo(function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-white/45 text-[10px] uppercase tracking-[0.18em]">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-white text-sm font-semibold truncate">
        {value}
      </p>
    </div>
  );
});

const ThreatRadar = memo(function ThreatRadar({
  risk,
}: {
  risk: string;
}) {
  const color =
    risk === 'MINIMAL' || risk === 'BAS'
      ? '#34d399'
      : risk === 'MOYENNE'
        ? '#fbbf24'
        : '#f87171';

  return (
    <div className="relative w-14 h-14 shrink-0">
      <div
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `${color}33` }}
      />

      <div
        className="absolute inset-2 rounded-full border"
        style={{ borderColor: `${color}55` }}
      />

      <div
        className="absolute inset-0 rounded-full security-radar-sweep"
        style={{
          background: `conic-gradient(${color}55, transparent 35%)`,
        }}
      />

      <Radar
        className="absolute inset-0 m-auto w-5 h-5"
        style={{ color }}
      />
    </div>
  );
});

const RiskGauge = memo(function RiskGauge({
  score,
}: {
  score: number;
}) {
  const color =
    score > 90
      ? '#34d399'
      : score > 75
        ? '#4ade80'
        : score > 50
          ? '#fbbf24'
          : '#f87171';

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${score}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
        }}
      />
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({
  onVerified,
}) => {
  const [phase, setPhase] = useState<Phase>('boot');

  const { light: lightMotion } = useLightMotion();

  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipChecked, setIpChecked] = useState(false);

  const [ipBlockedInfo, setIpBlockedInfo] = useState<{
    ip: string;
    reason: string | null;
  }>({
    ip: '',
    reason: null,
  });

  const ipBlockedRef = useRef(false);

  const [image, setImage] = useState('');
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);

  const [starX, setStarX] = useState(30);
  const [starY, setStarY] = useState(120);

  const [isDragging, setIsDragging] = useState(false);
  const [isOverTarget, setIsOverTarget] = useState(false);
  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);
  const [checked, setChecked] = useState(false);

  const [securityScore, setSecurityScore] = useState(0);

  const [networkQuality, setNetworkQuality] =
    useState('QUANTUM SHIELD');

  const [motionTrail, setMotionTrail] = useState<Point[]>([]);

  const [timingVariance, setTimingVariance] = useState(0);
  const [botReasons, setBotReasons] = useState<string[]>([]);

  const [honeypot, setHoneypot] = useState('');
  const [honeypot2, setHoneypot2] = useState('');

  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] =
    useState<CaptchaChallenge>(generateCaptcha());
  const [captchaPassed, setCaptchaPassed] = useState(false);

  const [riskLevel, setRiskLevel] = useState('LOW');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [devtoolsSuspected, setDevtoolsSuspected] = useState(false);

  const [ipReputation] = useState(() => {
    const values = ['CONFIANCE', 'NETOYER', 'SECURESE', 'PRIVE'];
    return values[Math.floor(Math.random() * values.length)];
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const dragStartOffset = useRef<Point>({
    x: 0,
    y: 0,
  });

  const lastPosRef = useRef<Point>({
    x: 0,
    y: 0,
  });

  const startTime = useRef(Date.now());
  const challengeStartTime = useRef(Date.now());

  const moveCount = useRef(0);
  const entropyRef = useRef(0);
  const pathLengthRef = useRef(0);

  const movementIntervals = useRef<number[]>([]);
  const lastMoveTime = useRef(Date.now());

  const usedTouch = useRef(false);
  const usedMouse = useRef(false);

  const scoreRef = useRef(0);
  const mountedRef = useRef(true);

  const challengeId = useMemo(
    () => randomString(12),
    []
  );

  const safeVerified = useCallback(() => {
    if (!ipBlockedRef.current) {
      onVerified();
    }
  }, [onVerified]);

  const safeVerifiedRef = useRef(safeVerified);

  useEffect(() => {
    safeVerifiedRef.current = safeVerified;
  }, [safeVerified]);

  /* ---------------------------------------------------------------------- */
  /* IP check                                                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    mountedRef.current = true;

    const checkIp = async () => {
      try {
        const res = await blockageIpApi.check();

        if (!mountedRef.current) return;

        ipBlockedRef.current = Boolean(res.blocked);

        setIpBlocked(Boolean(res.blocked));

        if (res.blocked) {
          setIpBlockedInfo({
            ip: res.ip,
            reason: res.reason,
          });

          try {
            localStorage.removeItem('security_verified_v4');
          } catch {
            // Storage may be disabled.
          }
        }

        setIpChecked(true);
      } catch {
        if (mountedRef.current) {
          setIpChecked(true);
        }
      }
    };

    void checkIp();

    const interval = window.setInterval(
      checkIp,
      15000
    );

    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* IP fallback                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIpChecked((current) => current || true);
    }, IP_CHECK_FALLBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Challenge generation                                                    */
  /* ---------------------------------------------------------------------- */

  const generateChallenge = useCallback(() => {
    const base =
      IMAGE_BASE_URLS[
        Math.floor(Math.random() * IMAGE_BASE_URLS.length)
      ];

    setImage(getChallengeImage(base));

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

    setCaptchaRequired(false);
    setCaptchaPassed(false);
    setCaptchaInput('');
    setCaptchaText(generateCaptcha());

    setMotionTrail([]);

    moveCount.current = 0;
    entropyRef.current = 0;
    pathLengthRef.current = 0;

    movementIntervals.current = [];

    startTime.current = Date.now();
    challengeStartTime.current = Date.now();

    scoreRef.current = 0;
    setSecurityScore(0);
    setTimingVariance(0);
    setBotReasons([]);
  }, []);

  const generateChallengeRef =
    useRef(generateChallenge);

  useEffect(() => {
    generateChallengeRef.current =
      generateChallenge;
  }, [generateChallenge]);

  /* ---------------------------------------------------------------------- */
  /* Target difficulty                                                       */
  /* ---------------------------------------------------------------------- */

  const targetRadius = Math.max(
    9,
    BASE_TARGET_RADIUS - failedAttempts * 3
  );

  /* ---------------------------------------------------------------------- */
  /* DevTools detection                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const checkDevTools = () => {
      const widthDiff =
        window.outerWidth -
          window.innerWidth >
        160;

      const heightDiff =
        window.outerHeight -
          window.innerHeight >
        160;

      setDevtoolsSuspected(
        widthDiff || heightDiff
      );
    };

    checkDevTools();

    const timer = window.setInterval(
      checkDevTools,
      2000
    );

    window.addEventListener(
      'resize',
      checkDevTools,
      { passive: true }
    );

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(
        'resize',
        checkDevTools
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Initial phase                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!ipChecked || ipBlocked) return;

    generateChallengeRef.current();

    let trusted = false;

    try {
      trusted =
        localStorage.getItem(
          'security_browser_trusted'
        ) === '1';
    } catch {
      trusted = false;
    }

    if (trusted) {
      const bootTimer = window.setTimeout(() => {
        setPhase('checking');
      }, 300);

      const passTimer = window.setTimeout(() => {
        setPhase('passed');

        try {
          sessionStorage.setItem(
            'security_verified_v4',
            JSON.stringify({
              verified: true,
              timestamp: Date.now(),
              challengeId,
              score: 100,
              version: 'v5',
              trustedBrowser: true,
            })
          );
        } catch {
          // Ignore storage errors.
        }
      }, 700);

      const verifyTimer = window.setTimeout(() => {
        safeVerifiedRef.current();
      }, 1200);

      return () => {
        window.clearTimeout(bootTimer);
        window.clearTimeout(passTimer);
        window.clearTimeout(verifyTimer);
      };
    }

    const bootTimer = window.setTimeout(() => {
      setPhase('checking');

      /*
       * Le Proof-of-Work est lancé en tâche idle.
       * Cela évite de concurrencer le rendu initial.
       */
      const runPow = () => {
        void solveProofOfWork(
          undefined,
          18
        ).then((proof) => {
          if (proof) {
            storeProof(proof);
          }
        });
      };

      if ('requestIdleCallback' in window) {
        (
          window as Window & {
            requestIdleCallback?: (
              callback: () => void,
              options?: {
                timeout: number;
              }
            ) => number;
          }
        ).requestIdleCallback?.(runPow, {
          timeout: 2500,
        });
      } else {
        window.setTimeout(runPow, 50);
      }
    }, 500);

    const challengeTimer = window.setTimeout(() => {
      setPhase('challenge');
    }, 1800);

    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(challengeTimer);
    };
  }, [
    ipChecked,
    ipBlocked,
    challengeId,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Geometry                                                                */
  /* ---------------------------------------------------------------------- */

  const getRelativePosition = useCallback(
    (
      clientX: number,
      clientY: number
    ): Point => {
      const element =
        containerRef.current;

      if (!element) {
        return {
          x: 0,
          y: 0,
        };
      }

      const rect =
        element.getBoundingClientRect();

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
    },
    []
  );

  const checkOverlap = useCallback(
    (x: number, y: number) => {
      const dx = x - targetX;
      const dy = y - targetY;

      const distanceSquared =
        dx * dx + dy * dy;

      const inside =
        distanceSquared <
        targetRadius * targetRadius;

      setIsOverTarget(inside);

      if (inside) {
        setStarX(targetX);
        setStarY(targetY);
      }
    },
    [
      targetX,
      targetY,
      targetRadius,
    ]
  );

  /* ---------------------------------------------------------------------- */
  /* Dragging                                                                */
  /* ---------------------------------------------------------------------- */

  const handleDragStart = useCallback(
    (
      clientX: number,
      clientY: number
    ) => {
      const element =
        containerRef.current;

      if (!element) return;

      const rect =
        element.getBoundingClientRect();

      const relX =
        clientX - rect.left;

      const relY =
        clientY - rect.top;

      const inside =
        Math.abs(
          relX - starX - 25
        ) < 35 &&
        Math.abs(
          relY - starY - 25
        ) < 35;

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
    [starX, starY]
  );

  const handleDragMove = useCallback(
    (
      clientX: number,
      clientY: number
    ) => {
      if (!isDragging) return;

      const now = Date.now();

      moveCount.current += 1;

      const delta =
        now - lastMoveTime.current;

      lastMoveTime.current = now;

      movementIntervals.current.push(
        delta
      );

      if (
        movementIntervals.current.length >
        20
      ) {
        movementIntervals.current.shift();
      }

      const pos =
        getRelativePosition(
          clientX,
          clientY
        );

      const previous =
        lastPosRef.current;

      const dx =
        pos.x - previous.x;

      const dy =
        pos.y - previous.y;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      pathLengthRef.current +=
        distance;

      entropyRef.current +=
        Math.abs(dx) +
        Math.abs(dy) +
        Math.random() * 0.8;

      lastPosRef.current = pos;

      setStarX(pos.x);
      setStarY(pos.y);

      setMotionTrail((current) => {
        const next = [
          ...current,
          pos,
        ];

        return next.length > MAX_TRAIL
          ? next.slice(-MAX_TRAIL)
          : next;
      });

      checkOverlap(
        pos.x,
        pos.y
      );

      const intervals =
        movementIntervals.current;

      if (intervals.length >= 3) {
        const average =
          intervals.reduce(
            (a, b) => a + b,
            0
          ) / intervals.length;

        const variance =
          intervals.reduce(
            (acc, value) =>
              acc +
              Math.pow(
                value - average,
                2
              ),
            0
          ) / intervals.length;

        setTimingVariance(
          Math.floor(variance)
        );
      }
    },
    [
      isDragging,
      getRelativePosition,
      checkOverlap,
    ]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (isOverTarget) {
      window.setTimeout(() => {
        if (!mountedRef.current) return;

        setVerifiedPuzzle(true);

        if (
          scoreRef.current < 80 ||
          failedAttempts > 0
        ) {
          setCaptchaRequired(true);
        }
      }, 250);
    }
  }, [
    isDragging,
    isOverTarget,
    failedAttempts,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Bot detection                                                           */
  /* ---------------------------------------------------------------------- */

  const advancedBotDetection =
    useCallback(() => {
      const nav =
        navigator as Navigator & {
          webdriver?: boolean;
          deviceMemory?: number;
        };

      const win =
        window as Window & Record<
          string,
          unknown
        >;

      const reasons: string[] = [];

      let bonus = 0;

      if (nav.webdriver) {
        reasons.push('webdriver');
      }

      if (
        /HeadlessChrome|PhantomJS|Selenium|Puppeteer|Playwright|Bot|Crawler|Spider/i.test(
          navigator.userAgent
        )
      ) {
        reasons.push('ua-bot');
      }

      const automationDetected =
        Object.keys(win).some((key) =>
          /^cdc_|^__webdriver|^__driver/i.test(
            key
          )
        );

      if (automationDetected) {
        reasons.push('automation');
      }

      if (
        !navigator.language ||
        navigator.languages.length === 0
      ) {
        reasons.push('languages');
      }

      try {
        if (
          nav.plugins &&
          nav.plugins.length === 0 &&
          !/Firefox/i.test(
            navigator.userAgent
          )
        ) {
          reasons.push('plugins');
        } else {
          bonus += 3;
        }
      } catch {
        // Ignore.
      }

      if (
        usedTouch.current &&
        usedMouse.current
      ) {
        reasons.push(
          'input-mismatch'
        );
      }

      try {
        const canvas =
          document.createElement(
            'canvas'
          );

        const gl =
          canvas.getContext(
            'webgl'
          );

        if (!gl) {
          reasons.push('webgl');
        } else {
          bonus += 8;
        }
      } catch {
        reasons.push(
          'webgl-error'
        );
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

      if (
        nav.deviceMemory &&
        nav.deviceMemory >= 4
      ) {
        bonus += 3;
      }

      if (
        Date.now() -
          challengeStartTime.current <
        MIN_HUMAN_TIME_MS
      ) {
        reasons.push('too-fast');
      }

      return {
        passed:
          reasons.length === 0,
        reasons,
        bonus,
      };
    }, []);

  /* ---------------------------------------------------------------------- */
  /* Score                                                                    */
  /* ---------------------------------------------------------------------- */

  const computeLiveScore = useCallback(() => {
    if (phase !== 'challenge') {
      return {
        score: scoreRef.current,
        bot: {
          passed: true,
          reasons: [],
          bonus: 0,
        },
      };
    }

    const timeSpent =
      Date.now() - startTime.current;

    let score = 0;

    if (timeSpent > 2500) {
      score += 15;
    }

    if (moveCount.current > 8) {
      score += 10;
    }

    if (entropyRef.current > 100) {
      score += 15;
    }

    if (pathLengthRef.current > 120) {
      score += 10;
    }

    if (timingVariance > 5) {
      score += 10;
    }

    if (verifiedPuzzle) {
      score += 20;
    }

    if (checked) {
      score += 10;
    }

    if (captchaPassed) {
      score += 20;
    }

    const bot =
      advancedBotDetection();

    if (bot.passed) {
      score += 10;
    }

    score += bot.bonus;

    if (
      honeypot.length > 0 ||
      honeypot2.length > 0
    ) {
      score = 0;
    }

    score = Math.min(
      100,
      Math.max(0, score)
    );

    scoreRef.current = score;

    setSecurityScore(score);
    setBotReasons(
      bot.reasons
    );

    if (score > 90) {
      setRiskLevel('MINIMAL');
    } else if (score > 75) {
      setRiskLevel('BAS');
    } else if (score > 50) {
      setRiskLevel('MOYENNE');
    } else {
      setRiskLevel('HAUTE');
    }

    return {
      score,
      bot,
    };
  }, [
    phase,
    verifiedPuzzle,
    checked,
    captchaPassed,
    honeypot,
    honeypot2,
    timingVariance,
    advancedBotDetection,
  ]);

  useEffect(() => {
    if (phase !== 'challenge') {
      return;
    }

    const timer =
      window.setInterval(
        computeLiveScore,
        SCORE_UPDATE_MS
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [
    phase,
    computeLiveScore,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Security verification                                                   */
  /* ---------------------------------------------------------------------- */

  const performSecurityCheck =
    useCallback(() => {
      const {
        score,
        bot,
      } = computeLiveScore();

      if (
        honeypot.length > 0 ||
        honeypot2.length > 0
      ) {
        return false;
      }

      if (
        !bot.passed &&
        bot.reasons.some((reason) =>
          [
            'webdriver',
            'ua-bot',
            'automation',
            'too-fast',
          ].includes(reason)
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

      return score >= 75;
    }, [
      computeLiveScore,
      honeypot,
      honeypot2,
      captchaRequired,
      captchaPassed,
    ]);

  const handleVerify = useCallback(() => {
    if (
      !verifiedPuzzle ||
      !checked ||
      (captchaRequired &&
        !captchaPassed)
    ) {
      return;
    }

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
          Math.random() *
            states.length
        )
      ]
    );

    window.setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      const passed =
        performSecurityCheck();

      if (passed) {
        setPhase('passed');

        try {
          sessionStorage.setItem(
            'security_verified_v4',
            JSON.stringify({
              verified: true,
              timestamp: Date.now(),
              challengeId,
              score:
                scoreRef.current,
              version: 'v5',
            })
          );

          localStorage.setItem(
            'security_browser_trusted',
            '1'
          );
        } catch {
          // Ignore storage errors.
        }

        window.setTimeout(() => {
          safeVerifiedRef.current();
        }, 900);
      } else {
        setFailedAttempts(
          (value) => value + 1
        );

        setPhase('failed');

        window.setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }

          generateChallengeRef.current();
          setPhase('challenge');
        }, 1800);
      }
    }, 1600);
  }, [
    verifiedPuzzle,
    checked,
    captchaRequired,
    captchaPassed,
    performSecurityCheck,
    challengeId,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Cleanup                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Blocked IP screen                                                       */
  /* ---------------------------------------------------------------------- */

  if (ipBlocked) {
    return (
      <>
        <style>{SECURITY_CSS}</style>

        <div className="min-h-screen relative overflow-hidden bg-[#080203] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.22),transparent_60%)]" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-500/30 bg-white/[0.04] backdrop-blur-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Vous ne pouvez pas entrer dans ce site
            </h1>

            <p className="text-sm text-white/60">
              Votre adresse IP a été bloquée par
              l'administrateur.
            </p>

            {ipBlockedInfo.ip && (
              <p className="mt-4 text-xs font-mono text-red-300">
                {ipBlockedInfo.ip}
              </p>
            )}

            {ipBlockedInfo.reason && (
              <p className="mt-2 text-xs text-white/50">
                Motif :{' '}
                {ipBlockedInfo.reason}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main UI                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <style>{SECURITY_CSS}</style>

      <main className="min-h-screen relative overflow-hidden bg-[#020207] flex items-center justify-center p-3 sm:p-5">
        {/* Static background: much cheaper than continuously animated layers */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.14),transparent_28%),radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_50%)]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {!lightMotion && (
            <div className="absolute top-[-20%] left-[10%] w-[55%] h-[55%] rounded-full bg-violet-500/[0.04] blur-3xl" />
          )}
        </div>

        <section className="relative w-full max-w-2xl">
          <div className="absolute -inset-px rounded-[36px] bg-gradient-to-br from-white/15 via-violet-500/15 to-fuchsia-500/15 pointer-events-none" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.055] shadow-[0_30px_100px_-30px_rgba(0,0,0,0.95)]">
            {/* Header */}
            <header className="px-5 sm:px-8 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                      <Hexagon
                        className="w-7 h-7 text-white"
                        strokeWidth={1.8}
                      />

                      <ShieldCheck className="w-4 h-4 text-white absolute" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight truncate">
                        Quantum Shield
                      </h1>

                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-violet-500/20 border border-white/10 text-[9px] font-bold text-white/80">
                        V5
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/40 truncate">
                        Neural Anti-Bot
                      </p>
                    </div>
                  </div>
                </div>

                <ThreatRadar risk={riskLevel} />
              </div>

              {devtoolsSuspected && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5">
                  <EyeOff className="w-3 h-3 text-amber-300" />

                  <span className="text-[9px] text-amber-200 uppercase tracking-[0.15em]">
                    Outils développeur détectés
                  </span>
                </div>
              )}
            </header>

            <div className="p-5 sm:p-8">
              {/* Honeypots */}
              <div
                aria-hidden="true"
                className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
              >
                <input
                  type="text"
                  name="company-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) =>
                    setHoneypot(
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  name="company-email"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot2}
                  onChange={(e) =>
                    setHoneypot2(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                <Metric
                  icon={
                    <Cpu className="w-3 h-3" />
                  }
                  label="MOTEUR"
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
                  icon={
                    <Shield className="w-3 h-3" />
                  }
                  label="RISQUE"
                  value={riskLevel}
                />

                <Metric
                  icon={
                    <Satellite className="w-3 h-3" />
                  }
                  label="RÉSEAU"
                  value={ipReputation}
                />
              </div>

              <div className="mb-6">
                <RiskGauge
                  score={securityScore}
                />
              </div>

              {/* Boot / checking */}
              {(phase === 'boot' ||
                phase === 'checking') && (
                <div className="py-20 text-center">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full border border-violet-500/20 security-spin" />

                    <div className="absolute inset-4 rounded-full border border-fuchsia-500/20 security-spin-reverse" />

                    <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 border-r-2 border-transparent security-spin-fast" />

                    <Fingerprint className="absolute inset-0 m-auto w-12 h-12 text-violet-300" />
                  </div>

                  <h2 className="mt-8 text-white text-xl sm:text-2xl font-semibold">
                    Analyse comportementale IA
                  </h2>

                  <p className="mt-3 text-white/40 text-xs sm:text-sm">
                    Deep fingerprint • Neural verification
                  </p>
                </div>
              )}

              {/* Challenge */}
              {phase === 'challenge' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                      <Orbit className="w-4 h-4 text-violet-300" />

                      <span className="text-white/75 text-xs">
                        Synchronisez l'étoile
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2">
                      <Bot className="w-4 h-4 text-red-300" />

                      <span className="text-red-200 text-xs">
                        Anti Automation
                      </span>
                    </div>

                    {failedAttempts > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2">
                        <Network className="w-4 h-4 text-amber-300" />

                        <span className="text-amber-200 text-xs">
                          Difficulté +
                          {failedAttempts}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-px rounded-[30px] bg-gradient-to-r from-violet-500/25 via-fuchsia-500/25 to-rose-500/25" />

                    <div
                      ref={containerRef}
                      className="relative h-72 sm:h-80 overflow-hidden rounded-[30px] border border-white/10 bg-black/40 select-none"
                      style={{
                        touchAction: 'none',
                        cursor: isDragging
                          ? 'grabbing'
                          : 'default',
                      }}
                      onPointerDown={(event) => {
                        if (
                          event.pointerType ===
                          'mouse'
                        ) {
                          usedMouse.current =
                            true;
                        }

                        if (
                          event.pointerType ===
                          'touch'
                        ) {
                          usedTouch.current =
                            true;
                        }

                        (
                          event.currentTarget as HTMLElement
                        ).setPointerCapture?.(
                          event.pointerId
                        );

                        handleDragStart(
                          event.clientX,
                          event.clientY
                        );
                      }}
                      onPointerMove={(event) => {
                        if (
                          event.pointerType ===
                          'mouse'
                        ) {
                          usedMouse.current =
                            true;
                        }

                        handleDragMove(
                          event.clientX,
                          event.clientY
                        );
                      }}
                      onPointerUp={(event) => {
                        (
                          event.currentTarget as HTMLElement
                        ).releasePointerCapture?.(
                          event.pointerId
                        );

                        handleDragEnd();
                      }}
                      onPointerCancel={
                        handleDragEnd
                      }
                    >
                      {image && (
                        <img
                          src={image}
                          alt="Image du test de vérification humaine"
                          draggable={false}
                          width={1200}
                          height={640}
                          decoding="async"
                          fetchPriority="high"
                          className="w-full h-full object-cover scale-[1.02]"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/55" />

                      <div
                        className="absolute inset-x-0 top-0 h-px bg-violet-300/30 security-scanline"
                        aria-hidden="true"
                      />

                      {/* Trail */}
                      {motionTrail.map(
                        (point, index) => (
                          <span
                            key={`${point.x}-${point.y}-${index}`}
                            className="absolute w-3 h-3 rounded-full bg-rose-400/25 pointer-events-none"
                            style={{
                              left:
                                point.x + 22,
                              top:
                                point.y + 22,
                              opacity:
                                (index + 1) /
                                motionTrail.length /
                                2,
                            }}
                          />
                        )
                      )}

                      {/* Target */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left:
                            targetX -
                            targetRadius,
                          top:
                            targetY -
                            targetRadius,
                          width:
                            targetRadius * 2,
                          height:
                            targetRadius * 2,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-full border border-white/40"
                        />

                        <div className="absolute inset-[-4px] rounded-full border border-dashed border-white/30" />
                      </div>

                      {/* Fixed star */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: targetX,
                          top: targetY,
                        }}
                      >
                        <Star />
                      </div>

                      {/* Moving star */}
                      <div
                        className="absolute z-20 will-change-transform"
                        style={{
                          left: starX,
                          top: starY,
                          cursor: isDragging
                            ? 'grabbing'
                            : 'grab',
                        }}
                      >
                        <Star moving />
                      </div>

                      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2">
                        <ScanEye className="w-3 h-3 text-cyan-300" />

                        <span className="text-[9px] sm:text-[10px] text-white/65 uppercase tracking-[0.16em]">
                          Analyse humaine
                        </span>
                      </div>

                      {verifiedPuzzle && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10">
                          <div className="text-center">
                            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />

                            <p className="mt-2 text-white font-semibold">
                              Signature validée
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Human checkbox */}
                  {verifiedPuzzle && (
                    <label className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          aria-label="Je confirme être humain"
                          checked={checked}
                          onChange={(event) =>
                            setChecked(
                              event.target
                                .checked
                            )
                          }
                          className="peer appearance-none w-6 h-6 rounded-lg border border-white/20 bg-white/5 checked:bg-violet-600 checked:border-transparent"
                        />

                        <CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>

                      <div>
                        <p className="text-white font-medium text-sm">
                          Je confirme être humain
                        </p>

                        <p className="text-white/40 text-xs mt-1">
                          Validation comportementale
                          + CAPTCHA si nécessaire
                        </p>
                      </div>
                    </label>
                  )}

                  {/* CAPTCHA */}
                  {captchaRequired &&
                    verifiedPuzzle && (
                      <div className="relative rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-3 mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-400 to-fuchsia-500 flex items-center justify-center shrink-0">
                              <KeyRound className="w-5 h-5 text-white" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-bold">
                                  Vérification CAPTCHA
                                </p>

                                <BadgeCheck className="w-4 h-4 text-violet-300" />
                              </div>

                              <p className="text-white/40 text-xs mt-1">
                                {captchaText.mode ===
                                'math'
                                  ? 'Résolvez le calcul'
                                  : 'Saisissez le code'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              aria-label="Lire le code"
                              onClick={() => {
                                try {
                                  const text =
                                    captchaText.mode ===
                                    'math'
                                      ? captchaText.question ||
                                        captchaText.display
                                      : captchaText.answer
                                          .split('')
                                          .join(' ');

                                  const utterance =
                                    new SpeechSynthesisUtterance(
                                      text
                                    );

                                  utterance.rate =
                                    0.7;

                                  window.speechSynthesis.cancel();

                                  window.speechSynthesis.speak(
                                    utterance
                                  );
                                } catch {
                                  // Speech API unavailable.
                                }
                              }}
                              className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              aria-label="Régénérer le code"
                              onClick={() => {
                                setCaptchaText(
                                  generateCaptcha()
                                );
                                setCaptchaInput(
                                  ''
                                );
                                setCaptchaPassed(
                                  false
                                );
                              }}
                              className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 mb-4">
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                              backgroundSize:
                                '14px 14px',
                            }}
                          />

                          <div className="relative flex items-center justify-center gap-1 sm:gap-2 py-7 px-2 select-none">
                            {captchaText.display
                              .split('')
                              .map(
                                (
                                  char,
                                  index
                                ) => {
                                  const colors = [
                                    'from-violet-300 to-fuchsia-400',
                                    'from-amber-300 to-rose-400',
                                    'from-cyan-300 to-violet-400',
                                    'from-fuchsia-300 to-amber-300',
                                    'from-emerald-300 to-cyan-400',
                                    'from-rose-300 to-fuchsia-400',
                                    'from-yellow-300 to-orange-400',
                                    'from-violet-300 to-pink-400',
                                  ];

                                  const rotation =
                                    captchaText.mode ===
                                    'math'
                                      ? 0
                                      : ((index *
                                          13) %
                                          24) -
                                        12;

                                  return (
                                    <span
                                      key={`${captchaText.display}-${index}`}
                                      className={`bg-gradient-to-br ${
                                        colors[
                                          index %
                                            colors.length
                                        ]
                                      } bg-clip-text text-transparent font-black text-2xl sm:text-3xl`}
                                      style={{
                                        transform: `rotate(${rotation}deg)`,
                                        fontFamily:
                                          captchaText.mode ===
                                          'math'
                                            ? 'Georgia, serif'
                                            : index %
                                                  2
                                              ? 'Georgia, serif'
                                              : 'Courier New, monospace',
                                      }}
                                    >
                                      {char}
                                    </span>
                                  );
                                }
                              )}

                            {captchaText.mode ===
                              'math' && (
                              <span className="text-white font-black text-2xl sm:text-3xl ml-1">
                                = ?
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4">
                          {Array.from({
                            length:
                              captchaText.answer
                                .length,
                          }).map(
                            (_, index) => (
                              <input
                                key={index}
                                id={`captcha-cell-${index}`}
                                aria-label={`Caractère ${
                                  index + 1
                                } du code de sécurité`}
                                type="text"
                                inputMode={
                                  captchaText.mode ===
                                  'math'
                                    ? 'numeric'
                                    : 'text'
                                }
                                maxLength={1}
                                autoComplete="off"
                                value={
                                  captchaInput[
                                    index
                                  ] || ''
                                }
                                onChange={(
                                  event
                                ) => {
                                  const value =
                                    event.target.value.slice(
                                      -1
                                    );

                                  const array =
                                    captchaInput.split(
                                      ''
                                    );

                                  array[index] =
                                    value;

                                  const next =
                                    array
                                      .join('')
                                      .slice(
                                        0,
                                        captchaText
                                          .answer
                                          .length
                                      );

                                  setCaptchaInput(
                                    next
                                  );

                                  if (
                                    value &&
                                    index <
                                      captchaText
                                        .answer
                                        .length -
                                        1
                                  ) {
                                    document
                                      .getElementById(
                                        `captcha-cell-${
                                          index + 1
                                        }`
                                      )
                                      ?.focus();
                                  }
                                }}
                                onKeyDown={(
                                  event
                                ) => {
                                  if (
                                    event.key ===
                                      'Backspace' &&
                                    !captchaInput[
                                      index
                                    ] &&
                                    index > 0
                                  ) {
                                    document
                                      .getElementById(
                                        `captcha-cell-${
                                          index - 1
                                        }`
                                      )
                                      ?.focus();
                                  }
                                }}
                                onPaste={(
                                  event
                                ) => {
                                  event.preventDefault();

                                  const text =
                                    event.clipboardData
                                      .getData(
                                        'text'
                                      )
                                      .slice(
                                        0,
                                        captchaText
                                          .answer
                                          .length
                                      );

                                  setCaptchaInput(
                                    text
                                  );
                                }}
                                className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl text-center font-bold text-white bg-black/40 border border-white/10 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                              />
                            )
                          )}
                        </div>

                        {captchaPassed && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                            <p className="text-emerald-200 text-xs font-medium">
                              CAPTCHA validé
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const valid =
                              captchaInput
                                .trim()
                                .toLowerCase() ===
                              captchaText.answer
                                .trim()
                                .toLowerCase();

                            if (valid) {
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
                          disabled={
                            captchaInput.length !==
                              captchaText.answer
                                .length ||
                            captchaPassed
                          }
                          className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" />

                            {captchaPassed
                              ? 'CAPTCHA validé'
                              : 'Vérifier le CAPTCHA'}
                          </span>
                        </button>
                      </div>
                    )}

                  {/* Bot warnings */}
                  {botReasons.length > 0 && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-red-300" />

                        <p className="text-red-200 text-sm font-semibold">
                          Signatures suspectes
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {botReasons.map(
                          (reason) => (
                            <span
                              key={reason}
                              className="px-2.5 py-1 rounded-full bg-black/30 text-red-200 text-xs border border-red-500/20"
                            >
                              {reason}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verify */}
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={
                      !verifiedPuzzle ||
                      !checked ||
                      (captchaRequired &&
                        !captchaPassed)
                    }
                    className="relative overflow-hidden w-full h-14 rounded-2xl font-semibold transition-transform active:scale-[0.99] disabled:bg-white/[0.04] disabled:border disabled:border-white/10 disabled:text-white/30 disabled:cursor-not-allowed enabled:bg-gradient-to-r enabled:from-violet-600 enabled:via-fuchsia-600 enabled:to-rose-600 enabled:text-white"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <ScanFace className="w-5 h-5" />
                      Validation
                    </span>
                  </button>
                </div>
              )}

              {/* Verifying */}
              {phase === 'verifying' && (
                <div className="py-20 text-center">
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-violet-400/20 security-spin" />

                    <div className="absolute inset-5 rounded-full border border-fuchsia-400/20 security-spin-reverse" />

                    <div className="absolute inset-0 rounded-full border-t-2 border-violet-300 border-r-2 border-transparent security-spin-fast" />

                    <div className="relative w-14 h-14 rounded-full bg-black/30 border border-white/10 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-violet-300 animate-spin" />
                    </div>
                  </div>

                  <h2 className="mt-8 text-white text-xl sm:text-2xl font-semibold">
                    Validation cryptographique
                  </h2>

                  <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
                    <ShieldCheck className="w-4 h-4 text-violet-300" />

                    <span className="text-white/70 text-sm">
                      Vérification en cours...
                    </span>
                  </div>
                </div>
              )}

              {/* Passed */}
              {phase === 'passed' && (
                <div className="py-16 text-center">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                      <CheckCircle2 className="w-14 h-14 text-white" />
                    </div>
                  </div>

                  <h2 className="mt-8 text-white text-3xl font-bold">
                    Accès autorisé
                  </h2>

                  <p className="mt-3 text-white/45">
                    Signature humaine confirmée
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                    <Shield className="w-4 h-4 text-emerald-300" />

                    <span className="text-emerald-200 text-sm font-medium">
                      Security score:{' '}
                      {securityScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* Failed */}
              {phase === 'failed' && (
                <div className="py-16 text-center security-shake">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-red-500/20" />

                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-14 h-14 text-white" />
                    </div>
                  </div>

                  <h2 className="mt-8 text-white text-2xl font-semibold">
                    Signature invalide
                  </h2>

                  <p className="mt-3 text-white/45">
                    Nouvelle analyse sécurisée...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-white/[0.025] px-5 sm:px-8 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-white/35" />

                  <p className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-[0.15em]">
                    Tunnel sécurisé
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Eye className="w-3 h-3 text-white/25" />
                  <MousePointer2 className="w-3 h-3 text-white/25" />
                  <Waves className="w-3 h-3 text-white/25" />

                  <p className="text-[9px] font-mono text-white/25">
                    v5.0
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Lightweight CSS animations                                                 */
/* -------------------------------------------------------------------------- */

const SECURITY_CSS = `
@keyframes security-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes security-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes security-shake {
  0%, 100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

@keyframes security-radar-sweep {
  to {
    transform: rotate(360deg);
  }
}

@keyframes security-scanline {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  15% {
    opacity: 0.4;
  }
  85% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(300px);
    opacity: 0;
  }
}

@keyframes security-star-moving {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(4deg) scale(1.025);
  }
}

.security-spin {
  animation: security-spin 10s linear infinite;
}

.security-spin-reverse {
  animation: security-spin-reverse 7s linear infinite;
}

.security-spin-fast {
  animation: security-spin 2.4s linear infinite;
}

.security-radar-sweep {
  animation: security-radar-sweep 2.8s linear infinite;
}

.security-scanline {
  animation: security-scanline 4s linear infinite;
}

.security-star-moving {
  animation: security-star-moving 3s ease-in-out infinite;
}

.security-shake {
  animation: security-shake 420ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .security-spin,
  .security-spin-reverse,
  .security-spin-fast,
  .security-radar-sweep,
  .security-scanline,
  .security-star-moving,
  .security-shake {
    animation: none !important;
  }
}
`;

export default SecurityCheckPage;