/** MessagesPage.tsx - Page de messagerie interne avec notifications et compteur de non-lus */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  User,
  Search,
  Sparkles,
  Crown,
  Shield,
  Zap,
  ArrowRight,
  Gem,
  Inbox,
  Star,
  CheckCircle,
} from 'lucide-react';
import { useMessages, Message } from '@/hooks/use-messages';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import Layout from '@/components/Layout';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import PremiumLoading from '@/components/ui/premium-loading';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '@/components/SEOHead';

const MessagesPage: React.FC = () => {
  const {
    messages,
    unreadCount,
    isLoading,
    markAsRead,
    markAsUnread,
    deleteMessage,
  } = useMessages();

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] =
    useState<Message | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  if (!isAuthenticated) {
    return (
      <Layout>
        <SEOHead
          title="Accès requis"
          description="Connectez-vous pour accéder à votre messagerie sécurisée."
        />

        <main
          className="
            relative
            min-h-[calc(100vh-64px)]
            overflow-hidden
            flex
            items-center
            justify-center
            px-4
            py-12
            bg-slate-50
            dark:bg-[#02030a]
          "
        >
          {/* =====================================================
              BACKGROUND
          ====================================================== */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Aurora 1 */}
            <motion.div
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -70, 50, 0],
                scale: [1, 1.15, 0.95, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                absolute
                -left-48
                -top-48
                h-[650px]
                w-[650px]
                rounded-full
                bg-violet-400/20
                blur-[100px]
                dark:bg-fuchsia-600/15
              "
            />

            {/* Aurora 2 */}
            <motion.div
              animate={{
                x: [0, -100, 60, 0],
                y: [0, 70, -40, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                absolute
                -bottom-64
                -right-48
                h-[750px]
                w-[750px]
                rounded-full
                bg-cyan-300/20
                blur-[110px]
                dark:bg-cyan-600/15
              "
            />

            {/* Aurora 3 */}
            <motion.div
              animate={{
                x: [0, 50, -60, 0],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                absolute
                left-1/2
                top-1/2
                h-[500px]
                w-[500px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-pink-300/10
                blur-[120px]
                dark:bg-violet-600/10
              "
            />

            {/* Grid */}
            <div
              className="
                absolute
                inset-0
                opacity-30
                dark:opacity-100
                bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)]
                dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
                bg-[size:70px_70px]
              "
            />

            {/* Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 70,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="
                absolute
                left-1/2
                top-1/2
                h-[850px]
                w-[850px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-slate-900/5
                dark:border-white/[0.035]
              "
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 55,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="
                absolute
                left-1/2
                top-1/2
                h-[600px]
                w-[600px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-violet-500/10
                dark:border-cyan-500/10
              "
            />

            {/* Particles */}
            {[...Array(24)].map((_, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -80, 0],
                  x: [
                    0,
                    index % 2 === 0 ? 25 : -25,
                    0,
                  ],
                  opacity: [0.15, 0.7, 0.15],
                  scale: [0.8, 1.4, 0.8],
                }}
                transition={{
                  duration: 5 + index * 0.6,
                  repeat: Infinity,
                  delay: index * 0.35,
                  ease: 'easeInOut',
                }}
                className="
                  absolute
                  h-1
                  w-1
                  rounded-full
                  bg-violet-500/40
                  dark:bg-white/40
                "
                style={{
                  left: `${5 + ((index * 17) % 90)}%`,
                  top: `${8 + ((index * 23) % 85)}%`,
                }}
              />
            ))}
          </div>

          {/* =====================================================
              ACCESS CARD
          ====================================================== */}

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
              ease: 'easeOut',
            }}
            className="relative z-10 w-full max-w-md"
          >
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                absolute
                -inset-5
                rounded-[42px]
                bg-gradient-to-r
                from-violet-500/20
                via-fuchsia-500/20
                to-cyan-500/20
                blur-2xl
              "
            />

            <Card
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-slate-900/10
                dark:border-white/[0.09]
                bg-white/80
                dark:bg-[#0b0b14]/80
                backdrop-blur-2xl
                shadow-[0_30px_100px_rgba(15,23,42,0.15)]
                dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
              "
            >
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-fuchsia-500/60
                  to-transparent
                "
              />

              <CardContent className="px-7 py-12 text-center sm:px-10 sm:py-14">
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
                    bounce: 0.4,
                    duration: 0.9,
                  }}
                  className="relative mx-auto mb-8 flex w-fit"
                >
                  <div
                    className="
                      absolute
                      -inset-4
                      rounded-full
                      bg-gradient-to-r
                      from-violet-500
                      via-fuchsia-500
                      to-cyan-500
                      opacity-20
                      blur-xl
                    "
                  />

                  <div
                    className="
                      relative
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-[28px]
                      bg-gradient-to-br
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                      shadow-xl
                      shadow-violet-500/25
                    "
                  >
                    <MessageSquare className="h-12 w-12 text-white" />
                  </div>

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="
                      absolute
                      -right-3
                      -top-3
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-gradient-to-br
                      from-amber-400
                      to-orange-500
                      shadow-lg
                    "
                  >
                    <Crown className="h-4 w-4 text-white" />
                  </motion.div>
                </motion.div>

                <div
                  className="
                    mx-auto
                    mb-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-900/10
                    dark:border-white/[0.08]
                    bg-slate-100/70
                    dark:bg-white/[0.04]
                    px-3
                    py-1.5
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />

                  <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                    Messagerie sécurisée
                  </span>
                </div>

                <h2
                  className="
                    text-4xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                  "
                >
                  Accès
                  <span
                    className="
                      block
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-500
                      to-cyan-500
                      dark:from-fuchsia-400
                      dark:via-violet-400
                      dark:to-cyan-300
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Requis
                  </span>
                </h2>

                <p
                  className="
                    mx-auto
                    mt-5
                    max-w-sm
                    text-sm
                    leading-relaxed
                    text-slate-500
                    dark:text-white/45
                  "
                >
                  Connectez-vous pour accéder à votre messagerie
                  sécurisée et consulter vos échanges.
                </p>

                <div
                  className="
                    mt-8
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[10px]
                    text-slate-400
                    dark:text-white/30
                  "
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Accès protégé
                  <Star className="h-3 w-3 text-amber-500" />
                </div>
              </CardContent>

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-500/40
                  to-transparent
                "
              />
            </Card>
          </motion.div>
        </main>
      </Layout>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading
          text="Chargement de vos messages"
          size="xl"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleMarkAsRead = async (message: Message) => {
    await markAsRead(message.id);

    if (selectedMessage?.id === message.id) {
      setSelectedMessage({
        ...message,
        lu: true,
      });
    }
  };

  const handleMarkAsUnread = async (message: Message) => {
    await markAsUnread(message.id);

    if (selectedMessage?.id === message.id) {
      setSelectedMessage({
        ...message,
        lu: false,
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId);

    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }

    toast({
      title: 'Message supprimé',
      description: 'Le message a été supprimé avec succès.',
    });
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);

    if (!message.lu) {
      handleMarkAsRead(message);
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.expediteurNom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      message.sujet
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      message.contenu
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <Layout>
      <SEOHead
        title="Messages"
        description="Gestion des messages reçus"
      />

      <main
        className="
          relative
          min-h-[calc(100vh-64px)]
          overflow-hidden
          bg-slate-50
          dark:bg-[#02030a]
          transition-colors
          duration-500
        "
      >
        {/* =====================================================
            PREMIUM BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Aurora 1 */}
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -70, 50, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -left-48
              -top-48
              h-[650px]
              w-[650px]
              rounded-full
              bg-violet-400/20
              blur-[100px]
              dark:bg-fuchsia-600/20
            "
          />

          {/* Aurora 2 */}
          <motion.div
            animate={{
              x: [0, -100, 60, 0],
              y: [0, 70, -40, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              -bottom-64
              -right-48
              h-[750px]
              w-[750px]
              rounded-full
              bg-cyan-300/20
              blur-[110px]
              dark:bg-cyan-600/15
            "
          />

          {/* Aurora 3 */}
          <motion.div
            animate={{
              x: [0, 50, -60, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[500px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-pink-300/10
              blur-[120px]
              dark:bg-violet-600/10
            "
          />

          {/* Grid */}
          <div
            className="
              absolute
              inset-0
              opacity-30
              dark:opacity-100
              bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)]
              dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
              bg-[size:70px_70px]
            "
          />

          {/* Ring 1 */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 70,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[1000px]
              w-[1000px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-slate-900/5
              dark:border-white/[0.035]
            "
          />

          {/* Ring 2 */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 55,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[650px]
              w-[650px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-violet-500/10
              dark:border-fuchsia-500/10
            "
          />

          {/* Particles */}
          {[...Array(30)].map((_, index) => (
            <motion.span
              key={index}
              animate={{
                y: [0, -80, 0],
                x: [
                  0,
                  index % 2 === 0 ? 25 : -25,
                  0,
                ],
                opacity: [0.15, 0.7, 0.15],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 5 + index * 0.6,
                repeat: Infinity,
                delay: index * 0.35,
                ease: 'easeInOut',
              }}
              className="
                absolute
                h-1
                w-1
                rounded-full
                bg-violet-500/40
                dark:bg-white/40
              "
              style={{
                left: `${5 + ((index * 17) % 90)}%`,
                top: `${8 + ((index * 23) % 85)}%`,
              }}
            />
          ))}
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className="
            relative
            z-10
            container
            mx-auto
            max-w-7xl
            px-4
            py-10
            sm:px-6
            sm:py-14
            lg:px-8
            lg:py-16
          "
        >
          {/* ===================================================
              HEADER
          ==================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="mb-12 text-center"
          >
            {/* Badge */}
            <motion.div
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              className="
                mx-auto
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border
                border-slate-900/10
                dark:border-white/10
                bg-white/70
                dark:bg-white/[0.045]
                backdrop-blur-xl
                px-4
                py-2
                shadow-lg
                dark:shadow-none
              "
            >
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-violet-500
                  to-fuchsia-500
                  shadow-lg
                  shadow-violet-500/25
                "
              >
                <Gem className="h-3.5 w-3.5 text-white" />
              </span>

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-white/80
                "
              >
                Messagerie Premium
              </span>

              <Sparkles
                className="
                  h-4
                  w-4
                  text-fuchsia-500
                  dark:text-fuchsia-400
                "
              />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.15,
              }}
              className="
                mt-8
                text-5xl
                font-black
                leading-[0.95]
                tracking-[-0.04em]
                text-slate-900
                dark:text-white
                sm:text-6xl
                lg:text-7xl
              "
            >
              Votre
              <span
                className="
                  block
                  mt-3
                  bg-gradient-to-r
                  from-violet-600
                  via-fuchsia-500
                  to-cyan-500
                  dark:from-fuchsia-400
                  dark:via-violet-400
                  dark:to-cyan-300
                  bg-clip-text
                  text-transparent
                "
              >
                Messagerie.
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.3,
              }}
              className="
                mx-auto
                mt-7
                max-w-2xl
                text-base
                leading-relaxed
                text-slate-600
                dark:text-white/45
                sm:text-lg
              "
            >
              Retrouvez vos échanges, consultez vos messages et
              gérez facilement vos notifications depuis votre
              espace sécurisé.
            </motion.p>

            {/* =================================================
                STATS
            ================================================== */}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {/* Total */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.5,
                }}
                whileHover={{
                  y: -4,
                }}
                className="
                  rounded-2xl
                  border
                  border-slate-900/10
                  dark:border-white/[0.08]
                  bg-white/60
                  dark:bg-white/[0.035]
                  backdrop-blur-xl
                  px-5
                  py-3
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-violet-500
                      to-fuchsia-500
                      shadow-lg
                      shadow-violet-500/20
                    "
                  >
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>

                  <div className="text-left">
                    <div
                      className="
                        text-lg
                        font-black
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {messages.length}
                    </div>

                    <div
                      className="
                        text-[11px]
                        text-slate-500
                        dark:text-white/40
                      "
                    >
                      message{messages.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Unread */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                    className="
                      rounded-2xl
                      border
                      border-red-500/20
                      bg-red-500/[0.06]
                      backdrop-blur-xl
                      px-5
                      py-3
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          relative
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-red-500
                          to-pink-500
                          shadow-lg
                          shadow-red-500/20
                        "
                      >
                        <Mail className="h-4 w-4 text-white" />

                        <span
                          className="
                            absolute
                            -right-1
                            -top-1
                            h-2.5
                            w-2.5
                            rounded-full
                            bg-red-400
                            shadow-[0_0_10px_rgba(248,113,113,0.8)]
                            animate-pulse
                          "
                        />
                      </div>

                      <div className="text-left">
                        <div
                          className="
                            text-lg
                            font-black
                            text-red-500
                            dark:text-red-300
                          "
                        >
                          {unreadCount}
                        </div>

                        <div
                          className="
                            text-[11px]
                            text-red-500/60
                            dark:text-red-300/40
                          "
                        >
                          non lu{unreadCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ===================================================
              MAIN GRID
          ==================================================== */}

          <div
            className="
              grid
              gap-8
              lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]
              xl:gap-10
            "
          >
            {/* =================================================
                SIDEBAR
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
              className="relative"
            >
              {/* Glow */}
              <motion.div
                animate={{
                  opacity: [0.25, 0.5, 0.25],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="
                  absolute
                  -inset-4
                  rounded-[40px]
                  bg-gradient-to-r
                  from-violet-500/15
                  via-fuchsia-500/15
                  to-cyan-500/15
                  blur-2xl
                "
              />

              <Card
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-slate-900/10
                  dark:border-white/[0.09]
                  bg-white/80
                  dark:bg-[#0b0b14]/80
                  backdrop-blur-2xl
                  shadow-[0_30px_100px_rgba(15,23,42,0.12)]
                  dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
                "
              >
                {/* Top shine */}
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-violet-500/60
                    dark:via-white/40
                    to-transparent
                  "
                />

                <CardHeader
                  className="
                    border-b
                    border-slate-900/10
                    dark:border-white/[0.06]
                    px-6
                    pb-6
                    pt-7
                    sm:px-7
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle
                      className="
                        flex
                        items-center
                        gap-3
                        text-lg
                        font-black
                        text-slate-900
                        dark:text-white
                      "
                    >
                      <div
                        className="
                          relative
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-violet-600
                          via-fuchsia-500
                          to-cyan-500
                          shadow-lg
                          shadow-violet-500/25
                        "
                      >
                        <Mail className="h-5 w-5 text-white" />

                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="
                            absolute
                            -right-1.5
                            -top-1.5
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/30
                            bg-gradient-to-br
                            from-amber-400
                            to-orange-500
                          "
                        >
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      </div>

                      <span>Boîte de réception</span>
                    </CardTitle>

                    <div
                      className="
                        hidden
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-500/10
                        bg-emerald-500/[0.06]
                        px-2.5
                        py-1.5
                        sm:flex
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

                      <span
                        className="
                          text-[10px]
                          font-semibold
                          text-emerald-600
                          dark:text-emerald-300/70
                        "
                      >
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="group relative mt-5">
                    <div
                      className="
                        absolute
                        -inset-[1px]
                        rounded-2xl
                        bg-gradient-to-r
                        from-violet-500
                        via-fuchsia-500
                        to-cyan-500
                        opacity-0
                        blur-[2px]
                        transition
                        duration-500
                        group-focus-within:opacity-60
                      "
                    />

                    <Search
                      className="
                        absolute
                        left-4
                        top-1/2
                        z-10
                        h-4
                        w-4
                        -translate-y-1/2
                        text-violet-500
                        dark:text-fuchsia-400/50
                      "
                    />

                    <Input
                      placeholder="Rechercher dans les messages..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="
                        relative
                        h-12
                        rounded-2xl
                        border
                        border-slate-900/10
                        dark:border-white/[0.08]
                        bg-slate-100/70
                        dark:bg-white/[0.045]
                        pl-11
                        text-slate-900
                        dark:text-white
                        placeholder:text-slate-400
                        dark:placeholder:text-white/20
                        focus:border-violet-500/50
                        dark:focus:border-fuchsia-400/50
                        focus:bg-white
                        dark:focus:bg-white/[0.07]
                        transition-all
                        duration-300
                      "
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center">
                      <motion.div
                        animate={{
                          y: [0, -6, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="
                          mx-auto
                          mb-5
                          flex
                          h-20
                          w-20
                          items-center
                          justify-center
                          rounded-[26px]
                          border
                          border-slate-900/10
                          dark:border-white/[0.06]
                          bg-slate-100/70
                          dark:bg-white/[0.03]
                        "
                      >
                        <MessageSquare
                          className="
                            h-9
                            w-9
                            text-violet-500/30
                            dark:text-fuchsia-400/20
                          "
                        />
                      </motion.div>

                      <div
                        className="
                          text-sm
                          font-semibold
                          text-slate-500
                          dark:text-white/35
                        "
                      >
                        Aucun message trouvé
                      </div>

                      {searchTerm && (
                        <div
                          className="
                            mt-2
                            text-xs
                            text-slate-400
                            dark:text-white/25
                          "
                        >
                          Essayez avec un autre terme de recherche.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-[700px] overflow-y-auto">
                      {filteredMessages.map(
                        (message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              duration: 0.35,
                              delay: Math.min(
                                index * 0.04,
                                0.4
                              ),
                            }}
                            className={`
                              group
                              relative
                              cursor-pointer
                              border-b
                              border-slate-900/[0.05]
                              dark:border-white/[0.04]
                              p-5
                              transition-all
                              duration-300
                              hover:bg-violet-500/[0.035]
                              dark:hover:bg-white/[0.035]
                              ${
                                !message.lu
                                  ? 'bg-emerald-500/[0.035]'
                                  : ''
                              }
                              ${
                                selectedMessage?.id ===
                                message.id
                                  ? 'bg-violet-500/[0.07]'
                                  : ''
                              }
                            `}
                            onClick={() =>
                              handleMessageClick(message)
                            }
                          >
                            {/* Active line */}
                            <div
                              className={`
                                absolute
                                bottom-0
                                left-0
                                top-0
                                w-[2px]
                                transition-all
                                duration-300
                                ${
                                  selectedMessage?.id ===
                                  message.id
                                    ? 'bg-gradient-to-b from-violet-500 via-fuchsia-500 to-cyan-500'
                                    : !message.lu
                                    ? 'bg-emerald-500'
                                    : 'bg-transparent'
                                }
                              `}
                            />

                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                  <div
                                    className={`
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      border
                                      ${
                                        !message.lu
                                          ? 'border-emerald-500/20 bg-emerald-500/10'
                                          : 'border-slate-900/10 dark:border-white/[0.06] bg-slate-100/70 dark:bg-white/[0.04]'
                                      }
                                    `}
                                  >
                                    <User
                                      className={`
                                        h-4
                                        w-4
                                        ${
                                          !message.lu
                                            ? 'text-emerald-500'
                                            : 'text-violet-500/60 dark:text-fuchsia-400/50'
                                        }
                                      `}
                                    />
                                  </div>

                                  <span
                                    className={`
                                      truncate
                                      text-sm
                                      ${
                                        !message.lu
                                          ? 'font-black text-slate-900 dark:text-white'
                                          : 'font-semibold text-slate-600 dark:text-white/65'
                                      }
                                    `}
                                  >
                                    {message.expediteurNom}
                                  </span>
                                </div>

                                <div
                                  className={`
                                    mb-2
                                    line-clamp-2
                                    text-sm
                                    ${
                                      !message.lu
                                        ? 'font-bold text-slate-800 dark:text-white/90'
                                        : 'font-medium text-slate-500 dark:text-white/45'
                                    }
                                  `}
                                >
                                  {message.sujet}
                                </div>

                                <div
                                  className="
                                    line-clamp-1
                                    text-xs
                                    text-slate-400
                                    dark:text-white/25
                                  "
                                >
                                  {message.contenu}
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-1.5
                                      text-[11px]
                                      text-slate-400
                                      dark:text-white/30
                                    "
                                  >
                                    <Clock className="h-3 w-3" />

                                    {formatDistanceToNow(
                                      new Date(
                                        message.dateEnvoi
                                      ),
                                      {
                                        addSuffix: true,
                                        locale: fr,
                                      }
                                    )}
                                  </div>

                                  {!message.lu && (
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [
                                          0.6,
                                          1,
                                          0.6,
                                        ],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                      }}
                                      className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-gradient-to-r
                                        from-violet-500
                                        to-fuchsia-500
                                        shadow-[0_0_10px_rgba(168,85,247,0.6)]
                                      "
                                    />
                                  )}
                                </div>
                              </div>

                              {!message.lu && (
                                <Badge
                                  className="
                                    shrink-0
                                    border-0
                                    bg-gradient-to-r
                                    from-violet-600
                                    via-fuchsia-500
                                    to-cyan-500
                                    px-2.5
                                    py-1
                                    text-[9px]
                                    font-bold
                                    text-white
                                    shadow-lg
                                    shadow-violet-500/15
                                  "
                                >
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-cyan-500/40
                    to-transparent
                  "
                />
              </Card>
            </motion.div>

            {/* =================================================
                READING PANEL
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
              }}
              className="relative min-h-[500px]"
            >
              {/* Glow */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="
                  absolute
                  -inset-4
                  rounded-[40px]
                  bg-gradient-to-r
                  from-cyan-500/10
                  via-violet-500/15
                  to-fuchsia-500/10
                  blur-2xl
                "
              />

              {selectedMessage ? (
                <Card
                  className="
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-slate-900/10
                    dark:border-white/[0.09]
                    bg-white/80
                    dark:bg-[#0b0b14]/80
                    backdrop-blur-2xl
                    shadow-[0_30px_100px_rgba(15,23,42,0.12)]
                    dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
                  "
                >
                  {/* Top shine */}
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-fuchsia-500/60
                      to-cyan-500/60
                    "
                  />

                  <CardHeader
                    className="
                      border-b
                      border-slate-900/[0.07]
                      dark:border-white/[0.06]
                      px-6
                      pb-7
                      pt-7
                      sm:px-8
                    "
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-5 flex items-start gap-4">
                          <motion.div
                            initial={{
                              scale: 0,
                              rotate: -45,
                            }}
                            animate={{
                              scale: 1,
                              rotate: 0,
                            }}
                            transition={{
                              type: 'spring',
                              bounce: 0.4,
                            }}
                            className="
                              relative
                              flex
                              h-14
                              w-14
                              shrink-0
                              items-center
                              justify-center
                              rounded-2xl
                              bg-gradient-to-br
                              from-violet-600
                              via-fuchsia-500
                              to-cyan-500
                              shadow-xl
                              shadow-violet-500/25
                            "
                          >
                            <Mail className="h-6 w-6 text-white" />

                            <div
                              className="
                                absolute
                                -inset-1
                                rounded-2xl
                                bg-gradient-to-r
                                from-violet-500
                                to-cyan-500
                                opacity-20
                                blur-md
                              "
                            />
                          </motion.div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle
                                className="
                                  break-words
                                  text-xl
                                  font-black
                                  leading-tight
                                  text-slate-900
                                  dark:text-white
                                  sm:text-2xl
                                "
                              >
                                {selectedMessage.sujet}
                              </CardTitle>

                              {!selectedMessage.lu && (
                                <Badge
                                  className="
                                    border-0
                                    bg-gradient-to-r
                                    from-red-500
                                    to-pink-500
                                    text-[10px]
                                    font-bold
                                    text-white
                                    shadow-lg
                                    shadow-red-500/15
                                  "
                                >
                                  Non lu
                                </Badge>
                              )}
                            </div>

                            <div
                              className="
                                mt-2
                                text-xs
                                text-slate-400
                                dark:text-white/30
                              "
                            >
                              Détails du message
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            {
                              icon: User,
                              label: 'De',
                              value:
                                selectedMessage.expediteurNom,
                            },
                            {
                              icon: Mail,
                              label: 'Email',
                              value:
                                selectedMessage.expediteurEmail,
                            },
                            ...(selectedMessage.expediteurTelephone
                              ? [
                                  {
                                    icon: Phone,
                                    label: 'Téléphone',
                                    value:
                                      selectedMessage.expediteurTelephone,
                                  },
                                ]
                              : []),
                            {
                              icon: Calendar,
                              label: 'Reçu le',
                              value:
                                new Date(
                                  selectedMessage.dateEnvoi
                                ).toLocaleString('fr-FR'),
                            },
                          ].map((item, i) => {
                            const Icon = item.icon;

                            return (
                              <motion.div
                                key={i}
                                whileHover={{
                                  y: -2,
                                }}
                                className="
                                  flex
                                  min-w-0
                                  items-center
                                  gap-3
                                  rounded-2xl
                                  border
                                  border-slate-900/[0.06]
                                  dark:border-white/[0.05]
                                  bg-slate-100/60
                                  dark:bg-white/[0.035]
                                  p-3
                                  transition-all
                                "
                              >
                                <div
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-violet-500/10
                                    dark:bg-fuchsia-500/[0.08]
                                  "
                                >
                                  <Icon
                                    className="
                                      h-4
                                      w-4
                                      text-violet-600
                                      dark:text-fuchsia-400
                                    "
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div
                                    className="
                                      text-[10px]
                                      font-bold
                                      uppercase
                                      tracking-wide
                                      text-slate-400
                                      dark:text-white/30
                                    "
                                  >
                                    {item.label}
                                  </div>

                                  <div
                                    className="
                                      mt-0.5
                                      truncate
                                      text-xs
                                      font-semibold
                                      text-slate-700
                                      dark:text-white/65
                                    "
                                    title={item.value}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            selectedMessage.lu
                              ? handleMarkAsUnread(
                                  selectedMessage
                                )
                              : handleMarkAsRead(
                                  selectedMessage
                                )
                          }
                          className="
                            h-10
                            rounded-xl
                            border-slate-900/10
                            bg-slate-100/70
                            text-slate-600
                            hover:bg-slate-200
                            hover:text-slate-900
                            dark:border-white/[0.1]
                            dark:bg-white/[0.04]
                            dark:text-white/65
                            dark:hover:bg-white/[0.08]
                            dark:hover:text-white
                          "
                        >
                          {selectedMessage.lu ? (
                            <>
                              <EyeOff className="mr-1.5 h-4 w-4 text-red-400" />
                              Non lu
                            </>
                          ) : (
                            <>
                              <Eye className="mr-1.5 h-4 w-4 text-emerald-400" />
                              Lu
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="
                                h-10
                                rounded-xl
                                border-0
                                bg-gradient-to-r
                                from-red-500
                                to-pink-500
                                text-white
                                shadow-lg
                                shadow-red-500/20
                                hover:from-red-600
                                hover:to-pink-600
                              "
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent
                            className="
                              rounded-[28px]
                              border
                              border-slate-900/10
                              bg-white/95
                              shadow-[0_32px_80px_rgba(15,23,42,0.25)]
                              dark:border-white/[0.1]
                              dark:bg-[#0b0b14]/95
                              dark:shadow-[0_32px_80px_rgba(0,0,0,0.65)]
                              backdrop-blur-2xl
                            "
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle
                                className="
                                  text-xl
                                  font-black
                                  text-slate-900
                                  dark:text-white
                                "
                              >
                                Confirmer la suppression
                              </AlertDialogTitle>

                              <AlertDialogDescription
                                className="
                                  text-slate-500
                                  dark:text-white/45
                                "
                              >
                                Cette action est irréversible.
                                Le message sera définitivement
                                supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="
                                  rounded-xl
                                  border-slate-900/10
                                  bg-slate-100
                                  text-slate-700
                                  hover:bg-slate-200
                                  dark:border-white/[0.1]
                                  dark:bg-white/[0.06]
                                  dark:text-white
                                  dark:hover:bg-white/[0.1]
                                "
                              >
                                Annuler
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(
                                    selectedMessage.id
                                  )
                                }
                                className="
                                  rounded-xl
                                  border-0
                                  bg-gradient-to-r
                                  from-red-500
                                  to-pink-500
                                  text-white
                                "
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Message body */}
                  <CardContent className="px-6 py-7 sm:px-8 sm:py-9">
                    <div
                      className="
                        relative
                        overflow-hidden
                        rounded-[26px]
                        border
                        border-slate-900/[0.07]
                        dark:border-white/[0.06]
                        bg-slate-100/60
                        dark:bg-white/[0.025]
                        p-6
                        sm:p-8
                      "
                    >
                      <div
                        className="
                          absolute
                          left-0
                          top-0
                          h-full
                          w-1
                          bg-gradient-to-b
                          from-violet-500
                          via-fuchsia-500
                          to-cyan-500
                        "
                      />

                      <div className="mb-5 flex items-center gap-2">
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-violet-500
                            to-fuchsia-500
                          "
                        >
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>

                        <span
                          className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-violet-600
                            dark:text-fuchsia-300/60
                          "
                        >
                          Contenu du message
                        </span>
                      </div>

                      <div
                        className="
                          whitespace-pre-wrap
                          text-base
                          leading-8
                          text-slate-700
                          dark:text-white/70
                        "
                      >
                        {selectedMessage.contenu}
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-[10px]
                        text-slate-400
                        dark:text-white/25
                      "
                    >
                      <Shield className="h-3.5 w-3.5 text-emerald-500" />
                      Échange sécurisé
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </CardContent>

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-cyan-500/40
                      to-transparent
                    "
                  />
                </Card>
              ) : (
                <Card
                  className="
                    relative
                    h-full
                    min-h-[500px]
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-slate-900/10
                    dark:border-white/[0.09]
                    bg-white/80
                    dark:bg-[#0b0b14]/80
                    backdrop-blur-2xl
                    shadow-[0_30px_100px_rgba(15,23,42,0.12)]
                    dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
                  "
                >
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-violet-500/60
                      to-transparent
                    "
                  />

                  <CardContent className="flex h-full min-h-[500px] items-center justify-center p-8">
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="
                          relative
                          mx-auto
                          mb-7
                          flex
                          h-24
                          w-24
                          items-center
                          justify-center
                          rounded-[30px]
                          bg-gradient-to-br
                          from-violet-500/10
                          via-fuchsia-500/10
                          to-cyan-500/10
                          dark:from-violet-500/[0.08]
                          dark:via-fuchsia-500/[0.08]
                          dark:to-cyan-500/[0.08]
                          border
                          border-slate-900/10
                          dark:border-white/[0.06]
                        "
                      >
                        <div
                          className="
                            absolute
                            -inset-3
                            rounded-[34px]
                            bg-gradient-to-r
                            from-violet-500/10
                            via-fuchsia-500/10
                            to-cyan-500/10
                            blur-xl
                          "
                        />

                        <MessageSquare
                          className="
                            relative
                            h-10
                            w-10
                            text-violet-500/40
                            dark:text-fuchsia-400/30
                          "
                        />
                      </motion.div>

                      <div
                        className="
                          mx-auto
                          mb-4
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-slate-900/10
                          dark:border-white/[0.07]
                          bg-slate-100/70
                          dark:bg-white/[0.035]
                          px-3
                          py-1.5
                        "
                      >
                        <Inbox
                          className="
                            h-3.5
                            w-3.5
                            text-violet-500
                            dark:text-fuchsia-400
                          "
                        />

                        <span
                          className="
                            text-[10px]
                            font-bold
                            text-slate-500
                            dark:text-white/40
                          "
                        >
                          Boîte de réception
                        </span>
                      </div>

                      <h3
                        className="
                          text-2xl
                          font-black
                          tracking-tight
                          text-slate-900
                          dark:text-white
                        "
                      >
                        Sélectionnez un
                        <span
                          className="
                            block
                            bg-gradient-to-r
                            from-violet-600
                            via-fuchsia-500
                            to-cyan-500
                            dark:from-fuchsia-400
                            dark:via-violet-400
                            dark:to-cyan-300
                            bg-clip-text
                            text-transparent
                          "
                        >
                          message
                        </span>
                      </h3>

                      <p
                        className="
                          mx-auto
                          mt-3
                          max-w-sm
                          text-sm
                          leading-relaxed
                          text-slate-500
                          dark:text-white/35
                        "
                      >
                        Choisissez un message dans votre boîte
                        de réception pour consulter son contenu.
                      </p>

                      <div
                        className="
                          mt-7
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-[10px]
                          text-slate-400
                          dark:text-white/25
                        "
                      >
                        <Zap className="h-3.5 w-3.5 text-cyan-500" />
                        Sélectionnez une conversation
                        <ArrowRight className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                    </motion.div>
                  </CardContent>

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-cyan-500/40
                      to-transparent
                    "
                  />
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default MessagesPage;