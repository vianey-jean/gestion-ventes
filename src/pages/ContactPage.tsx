import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Sparkles,
  Crown,
  MessageCircle,
  Radio,
  ArrowRight,
  Gem,
  Zap,
  Headphones,
  MessageSquare,
  Star,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useMessages } from '@/hooks/use-messages';
import { motion, AnimatePresence } from 'framer-motion';
import LiveChatVisitor from '@/components/livechat/LiveChatVisitor';
import SEOHead from '@/components/SEOHead';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://server-gestion-ventes.onrender.com';

const contactFeatures = [
  {
    icon: Shield,
    title: 'Sécurisé',
    description: 'Vos échanges sont traités avec confidentialité.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Rapide',
    description: 'Une équipe disponible pour vous répondre.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Headphones,
    title: 'Support',
    description: 'Un accompagnement adapté à votre besoin.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: MessageSquare,
    title: 'Échange direct',
    description: 'Discutez directement avec notre équipe.',
    color: 'from-fuchsia-500 to-pink-500',
  },
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    expediteurNom: '',
    expediteurEmail: '',
    expediteurTelephone: '',
    sujet: '',
    contenu: '',
    destinataireId: '1',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [submittedName, setSubmittedName] = useState(
    localStorage.getItem('livechat_pseudo') || ''
  );
  const [liveAdminId, setLiveAdminId] = useState<string>('1');

  const { toast } = useToast();
  const { sendMessage } = useMessages();

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CHECK ADMIN ONLINE STATUS
  // =========================================================

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/messagerie/admin-status`
        );

        if (res.ok) {
          const data = await res.json();

          setAdminOnline(data.online);

          if (data.adminId) {
            setLiveAdminId(data.adminId);
          }
        }
      } catch {
        setAdminOnline(false);
      }
    };

    checkAdmin();

    const interval = setInterval(checkAdmin, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.expediteurNom ||
      !formData.expediteurEmail ||
      !formData.sujet ||
      !formData.contenu
    ) {
      toast({
        title: 'Erreur',
        description:
          'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    setIsSubmitting(true);

    try {
      await sendMessage(formData);

      setSubmittedName(formData.expediteurNom);

      localStorage.setItem(
        'livechat_pseudo',
        formData.expediteurNom
      );

      setIsSubmitted(true);

      toast({
        title: 'Message envoyé',
        description:
          'Votre message a été envoyé avec succès.',
      });

      setFormData({
        expediteurNom: '',
        expediteurEmail: '',
        expediteurTelephone: '',
        sujet: '',
        contenu: '',
        destinataireId: '1',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          "Une erreur s'est produite lors de l'envoi.",
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // SUBMITTED STATE
  // =========================================================

  if (isSubmitted) {
    return (
      <Layout>
        <SEOHead
          title="Message envoyé"
          description="Votre message a été envoyé à l'équipe Gestion Vente."
          canonical="https://riziky-ventes.vercel.app/contact"
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
            sm:px-6
            lg:px-8
            bg-slate-50
            dark:bg-[#02030a]
            transition-colors
            duration-500
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
                bg-emerald-400/20
                blur-[100px]
                dark:bg-emerald-600/15
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
                bg-violet-300/10
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
                h-[600px]
                w-[600px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-emerald-500/10
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
                  bg-emerald-500/40
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
              SUCCESS CONTENT
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
            className="relative z-10 w-full max-w-xl"
          >
            {/* Glow */}
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
                from-emerald-500/20
                via-teal-500/20
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
                  via-emerald-500/60
                  dark:via-white/40
                  to-transparent
                "
              />

              <CardContent className="px-7 py-12 text-center sm:px-10 sm:py-14">

                {/* Icon */}
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
                      from-emerald-500
                      via-teal-500
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
                      from-emerald-500
                      via-teal-500
                      to-cyan-500
                      shadow-xl
                      shadow-emerald-500/25
                    "
                  >
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>

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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                    Message transmis avec succès
                  </span>
                </div>

                <h2
                  className="
                    text-4xl
                    sm:text-5xl
                    font-black
                    tracking-tight
                    text-slate-900
                    dark:text-white
                  "
                >
                  Message
                  <span
                    className="
                      block
                      bg-gradient-to-r
                      from-emerald-600
                      via-teal-500
                      to-cyan-500
                      dark:from-emerald-400
                      dark:via-teal-300
                      dark:to-cyan-300
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Envoyé !
                  </span>
                </h2>

                <p
                  className="
                    mx-auto
                    mt-5
                    max-w-md
                    text-sm
                    sm:text-base
                    leading-relaxed
                    text-slate-500
                    dark:text-white/45
                  "
                >
                  Merci pour votre message. Notre équipe vous répondra
                  dans les plus brefs délais.
                </p>

                <div className="mt-8 space-y-3">

                  {/* Another message */}
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="
                      group
                      relative
                      h-14
                      w-full
                      overflow-hidden
                      rounded-2xl
                      border-0
                      bg-gradient-to-r
                      from-emerald-600
                      via-teal-500
                      to-cyan-500
                      text-base
                      font-bold
                      text-white
                      shadow-[0_15px_45px_rgba(16,185,129,0.3)]
                      hover:scale-[1.015]
                      active:scale-[0.99]
                      transition-all
                      duration-300
                    "
                  >
                    <motion.div
                      animate={{
                        x: ['-120%', '120%'],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: 'easeInOut',
                      }}
                      className="
                        absolute
                        inset-y-0
                        w-1/3
                        skew-x-[-20deg]
                        bg-white/20
                        blur-sm
                      "
                    />

                    <span className="relative flex items-center justify-center">
                      <Send className="mr-3 h-5 w-5" />
                      Envoyer un autre message
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>

                  {/* Live Chat */}
                  <Button
                    onClick={() => setShowLiveChat(true)}
                    disabled={!adminOnline}
                    className={`
                      group
                      h-14
                      w-full
                      rounded-2xl
                      border
                      text-base
                      font-bold
                      transition-all
                      duration-300
                      ${
                        adminOnline
                          ? `
                            border-white/10
                            bg-gradient-to-r
                            from-violet-600
                            via-fuchsia-600
                            to-pink-500
                            text-white
                            shadow-[0_15px_45px_rgba(139,92,246,0.3)]
                            hover:scale-[1.015]
                          `
                          : `
                            border-slate-900/10
                            dark:border-white/[0.08]
                            bg-slate-100/70
                            dark:bg-white/[0.035]
                            text-slate-400
                            dark:text-white/30
                            cursor-not-allowed
                          `
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-3">

                      <div className="relative">
                        <MessageCircle className="h-5 w-5" />

                        {adminOnline && (
                          <Radio
                            className="
                              absolute
                              -right-1
                              -top-1
                              h-3 w-3
                              text-emerald-400
                              animate-pulse
                            "
                          />
                        )}
                      </div>

                      {adminOnline
                        ? 'Chat en direct'
                        : 'Chat hors ligne'}

                      {adminOnline && (
                        <span
                          className="
                            rounded-full
                            border
                            border-emerald-400/20
                            bg-emerald-400/10
                            px-2
                            py-0.5
                            text-[10px]
                            font-bold
                            text-emerald-300
                          "
                        >
                          LIVE
                        </span>
                      )}
                    </div>
                  </Button>
                </div>

                {/* Security footer */}
                <div
                  className="
                    mt-7
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
                  Vos échanges sont traités de manière sécurisée.
                  <Star className="h-3 w-3 text-amber-500" />
                </div>
              </CardContent>

              {/* Bottom line */}
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

          {/* Live Chat */}
          <AnimatePresence>
            {showLiveChat && adminOnline && (
              <LiveChatVisitor
                visitorNom={submittedName || 'Visiteur'}
                adminId={liveAdminId}
                onClose={() => setShowLiveChat(false)}
              />
            )}
          </AnimatePresence>
        </main>
      </Layout>
    );
  }

  // =========================================================
  // MAIN CONTACT PAGE
  // =========================================================

  return (
    <Layout>
      <SEOHead
        title="Contact"
        description="Contactez l'équipe Gestion Vente. Support technique, partenariat ou consultation - nous répondons sous 24h."
        canonical="https://riziky-ventes.vercel.app/contact"
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
              h-[950px]
              w-[950px]
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
            lg:py-20
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
            className="mb-12 text-center sm:mb-16"
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
                Premium Business Support
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
              Parlons de votre
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
                projet.
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
              Une question ? Un projet ? Notre équipe est à votre
              disposition pour vous accompagner avec une expérience
              simple, rapide et premium.
            </motion.p>

            {/* Mini stats */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                {
                  icon: Shield,
                  value: 'Sécurisé',
                  label: 'Échanges protégés',
                },
                {
                  icon: Clock,
                  value: '24h',
                  label: 'Délai de réponse',
                },
                {
                  icon: Globe,
                  value: 'Cloud',
                  label: 'Accessible partout',
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.5 + index * 0.1,
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
                      px-4
                      py-3
                    "
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="
                          h-4
                          w-4
                          text-violet-600
                          dark:text-fuchsia-400
                        "
                      />

                      <div className="text-left">
                        <div
                          className="
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {item.value}
                        </div>

                        <div
                          className="
                            text-[11px]
                            text-slate-500
                            dark:text-white/40
                          "
                        >
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ===================================================
              MAIN GRID
          ==================================================== */}

          <div
            className="
              grid
              gap-8
              lg:grid-cols-[1fr_360px]
              xl:gap-12
            "
          >

            {/* =================================================
                FORM CARD
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
              {/* Outer glow */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.55, 0.3],
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

                <CardHeader className="px-6 pb-6 pt-8 sm:px-9">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      {/* Icon */}
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
                        className="relative inline-flex"
                      >
                        <div
                          className="
                            absolute
                            -inset-2
                            rounded-[25px]
                            bg-gradient-to-r
                            from-violet-500
                            via-fuchsia-500
                            to-cyan-500
                            opacity-20
                            blur-lg
                          "
                        />

                        <div
                          className="
                            relative
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-[20px]
                            bg-gradient-to-br
                            from-violet-600
                            via-fuchsia-500
                            to-cyan-500
                            shadow-xl
                            shadow-violet-500/25
                          "
                        >
                          <Mail className="h-8 w-8 text-white" />
                        </div>

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
                            -right-2
                            -top-2
                            flex
                            h-7
                            w-7
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
                          <Crown className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Online status */}
                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1.5
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
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${
                            adminOnline
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-400'
                          }
                        `}
                      />

                      <span
                        className="
                          text-[10px]
                          font-semibold
                          text-slate-500
                          dark:text-white/50
                        "
                      >
                        {adminOnline
                          ? 'Équipe en ligne'
                          : 'Équipe disponible'}
                      </span>
                    </div>
                  </div>

                  <CardTitle
                    className="
                      mt-6
                      text-3xl
                      font-black
                      tracking-tight
                      text-slate-900
                      dark:text-white
                      sm:text-4xl
                    "
                  >
                    Envoyez-nous un
                    <span
                      className="
                        ml-2
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
                      message.
                    </span>
                  </CardTitle>

                  <CardDescription
                    className="
                      mt-2
                      text-sm
                      leading-relaxed
                      text-slate-500
                      dark:text-white/45
                      sm:text-base
                    "
                  >
                    Chaque demande est traitée avec soin par notre
                    équipe dédiée.
                  </CardDescription>

                  {/* Security badges */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      {
                        icon: Shield,
                        label: 'Sécurisé',
                      },
                      {
                        icon: Zap,
                        label: 'Rapide',
                      },
                      {
                        icon: Sparkles,
                        label: 'Premium',
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-slate-900/10
                            dark:border-white/[0.07]
                            bg-slate-100/60
                            dark:bg-white/[0.035]
                            px-2.5
                            py-1.5
                          "
                        >
                          <Icon
                            className="
                              h-3 w-3
                              text-violet-600
                              dark:text-fuchsia-400
                            "
                          />

                          <span
                            className="
                              text-[10px]
                              font-semibold
                              text-slate-500
                              dark:text-white/50
                            "
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-8 sm:px-9">

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >

                    {/* Nom + Email */}
                    <div className="grid gap-5 md:grid-cols-2">

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="expediteurNom"
                          className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-white/75
                          "
                        >
                          <Crown
                            className="
                              h-4 w-4
                              text-violet-600
                              dark:text-fuchsia-400
                            "
                          />
                          Nom complet *
                        </Label>

                        <div className="group relative">

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

                          <Input
                            id="expediteurNom"
                            name="expediteurNom"
                            value={formData.expediteurNom}
                            onChange={handleChange}
                            placeholder="Votre nom"
                            required
                            className="
                              relative
                              h-14
                              rounded-2xl
                              border
                              border-slate-900/10
                              dark:border-white/[0.08]
                              bg-slate-100/70
                              dark:bg-white/[0.045]
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
                      </div>

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="expediteurEmail"
                          className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-white/75
                          "
                        >
                          <Mail
                            className="
                              h-4 w-4
                              text-violet-600
                              dark:text-fuchsia-400
                            "
                          />
                          Email *
                        </Label>

                        <div className="group relative">

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

                          <Input
                            id="expediteurEmail"
                            name="expediteurEmail"
                            type="email"
                            value={formData.expediteurEmail}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                            className="
                              relative
                              h-14
                              rounded-2xl
                              border
                              border-slate-900/10
                              dark:border-white/[0.08]
                              bg-slate-100/70
                              dark:bg-white/[0.045]
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
                      </div>
                    </div>

                    {/* Telephone */}
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="expediteurTelephone"
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-slate-700
                          dark:text-white/75
                        "
                      >
                        <Phone
                          className="
                            h-4 w-4
                            text-violet-600
                            dark:text-fuchsia-400
                          "
                        />
                        Téléphone
                      </Label>

                      <Input
                        id="expediteurTelephone"
                        name="expediteurTelephone"
                        value={formData.expediteurTelephone}
                        onChange={handleChange}
                        placeholder="Votre numéro"
                        className="
                          h-14
                          rounded-2xl
                          border
                          border-slate-900/10
                          dark:border-white/[0.08]
                          bg-slate-100/70
                          dark:bg-white/[0.045]
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

                    {/* Sujet */}
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="sujet"
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-slate-700
                          dark:text-white/75
                        "
                      >
                        <MessageSquare
                          className="
                            h-4 w-4
                            text-violet-600
                            dark:text-fuchsia-400
                          "
                        />
                        Sujet *
                      </Label>

                      <Select
                        onValueChange={(value) =>
                          handleSelectChange('sujet', value)
                        }
                        value={formData.sujet}
                      >
                        <SelectTrigger
                          className="
                            h-14
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.08]
                            bg-slate-100/70
                            dark:bg-white/[0.045]
                            text-slate-900
                            dark:text-white
                            focus:border-violet-500/50
                            dark:focus:border-fuchsia-400/50
                            transition-all
                            duration-300
                          "
                        >
                          <SelectValue placeholder="Choisissez le sujet" />
                        </SelectTrigger>

                        <SelectContent
                          className="
                            border
                            border-slate-900/10
                            dark:border-white/10
                            bg-white/95
                            dark:bg-[#0b0b14]/95
                            backdrop-blur-2xl
                            shadow-2xl
                          "
                        >
                          <SelectItem value="Demande d'information">
                            💡 Information
                          </SelectItem>

                          <SelectItem value="Support technique">
                            🔧 Support technique
                          </SelectItem>

                          <SelectItem value="Partenariat">
                            🤝 Partenariat
                          </SelectItem>

                          <SelectItem value="Consultation">
                            👨‍💼 Consultation
                          </SelectItem>

                          <SelectItem value="Autre">
                            📧 Autre
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="contenu"
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-slate-700
                          dark:text-white/75
                        "
                      >
                        <MessageCircle
                          className="
                            h-4 w-4
                            text-violet-600
                            dark:text-fuchsia-400
                          "
                        />
                        Message *
                      </Label>

                      <div className="group relative">

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

                        <Textarea
                          id="contenu"
                          name="contenu"
                          value={formData.contenu}
                          onChange={handleChange}
                          placeholder="Décrivez votre demande..."
                          rows={6}
                          required
                          className="
                            relative
                            min-h-[170px]
                            rounded-2xl
                            border
                            border-slate-900/10
                            dark:border-white/[0.08]
                            bg-slate-100/70
                            dark:bg-white/[0.045]
                            text-slate-900
                            dark:text-white
                            placeholder:text-slate-400
                            dark:placeholder:text-white/20
                            focus:border-violet-500/50
                            dark:focus:border-fuchsia-400/50
                            focus:bg-white
                            dark:focus:bg-white/[0.07]
                            resize-none
                            transition-all
                            duration-300
                          "
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="
                        group
                        relative
                        h-14
                        w-full
                        overflow-hidden
                        rounded-2xl
                        border-0
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-600
                        to-cyan-500
                        text-base
                        font-bold
                        text-white
                        shadow-[0_15px_45px_rgba(124,58,237,0.3)]
                        hover:scale-[1.015]
                        active:scale-[0.99]
                        transition-all
                        duration-300
                      "
                    >
                      {/* Shine */}
                      {!isSubmitting && (
                        <motion.div
                          animate={{
                            x: ['-120%', '120%'],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: 'easeInOut',
                          }}
                          className="
                            absolute
                            inset-y-0
                            w-1/3
                            skew-x-[-20deg]
                            bg-white/20
                            blur-sm
                          "
                        />
                      )}

                      <span className="relative flex items-center justify-center">

                        {isSubmitting ? (
                          <>
                            <span
                              className="
                                mr-3
                                h-5
                                w-5
                                rounded-full
                                border-2
                                border-white/30
                                border-t-white
                                animate-spin
                              "
                            />

                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-3 h-5 w-5" />

                            Envoyer le message

                            <ArrowRight
                              className="
                                ml-2
                                h-5
                                w-5
                                transition-transform
                                group-hover:translate-x-1
                              "
                            />
                          </>
                        )}
                      </span>
                    </Button>

                    {/* Security footer */}
                    <div
                      className="
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

                      Vos données sont protégées et traitées
                      avec confidentialité.

                      <Star className="h-3 w-3 text-amber-500" />
                    </div>
                  </form>
                </CardContent>

                {/* Bottom line */}
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
                RIGHT SIDE
            ================================================== */}

            <motion.aside
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
                delay: 0.35,
              }}
              className="space-y-6"
            >

              {/* Contact info */}
              <Card
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-slate-900/10
                  dark:border-white/[0.09]
                  bg-white/75
                  dark:bg-[#0b0b14]/75
                  backdrop-blur-2xl
                  shadow-[0_25px_70px_rgba(15,23,42,0.12)]
                  dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)]
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
                    via-emerald-500/60
                    to-transparent
                  "
                />

                <CardHeader className="p-6">

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-emerald-500
                        to-teal-600
                        shadow-lg
                        shadow-emerald-500/20
                      "
                    >
                      <Globe className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <CardTitle
                        className="
                          text-lg
                          font-black
                          text-slate-900
                          dark:text-white
                        "
                      >
                        Nos coordonnées
                      </CardTitle>

                      <CardDescription
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                          dark:text-white/40
                        "
                      >
                        Retrouvez-nous facilement.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-6 pb-6">

                  {[
                    {
                      icon: Mail,
                      label: 'Email',
                      value: 'vianey.jean@ymail.com',
                      gradient:
                        'from-blue-500/10 to-purple-500/10',
                      borderColor:
                        'border-blue-500/10',
                      iconBg:
                        'from-blue-500 to-purple-600',
                    },
                    {
                      icon: Phone,
                      label: 'Ligne Directe',
                      value: '+262 00 00 00',
                      gradient:
                        'from-emerald-500/10 to-teal-500/10',
                      borderColor:
                        'border-emerald-500/10',
                      iconBg:
                        'from-emerald-500 to-teal-600',
                    },
                    {
                      icon: MapPin,
                      label: 'Adresse',
                      value:
                        'Saint-Denis, La Réunion',
                      gradient:
                        'from-purple-500/10 to-indigo-500/10',
                      borderColor:
                        'border-purple-500/10',
                      iconBg:
                        'from-purple-500 to-indigo-600',
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{
                          y: -3,
                          scale: 1.01,
                        }}
                        className={`
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          ${item.borderColor}
                          bg-gradient-to-r
                          ${item.gradient}
                          p-4
                          transition-all
                          duration-300
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            ${item.iconBg}
                            shadow-lg
                            border
                            border-white/10
                          `}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>

                        <div className="min-w-0">
                          <div
                            className="
                              text-xs
                              font-bold
                              text-slate-700
                              dark:text-white/75
                            "
                          >
                            {item.label}
                          </div>

                          <div
                            className="
                              mt-0.5
                              break-words
                              text-xs
                              text-slate-500
                              dark:text-white/40
                            "
                          >
                            {item.value}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

            

             
            </motion.aside>
          </div>
        </div>


        <AnimatePresence>
          {showLiveChat && adminOnline && (
            <LiveChatVisitor
              visitorNom={submittedName || 'Visiteur'}
              adminId={liveAdminId}
              onClose={() => setShowLiveChat(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
};

export default ContactPage;