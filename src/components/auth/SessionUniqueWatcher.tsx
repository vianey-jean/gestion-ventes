/**
 * SessionUniqueWatcher.tsx — VUE globale de la session unique.
 *
 * - Déconnecte le profil quand le serveur l'ordonne (auto / accepté / 5 min).
 * - Affiche la demande de déconnexion manuelle (rappel toutes les 5 s) sur
 *   n'importe quelle page, avec les boutons Confirmer / Refuser.
 * - Affiche les notifications de connexion multiple (administrateur principal).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSessionUnique } from '@/hooks/useSessionUnique';

import { Button } from '@/components/ui/button';

import {
  LogOut,
  ShieldQuestion,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock3,
  History,
  ArrowRight,
} from 'lucide-react';

import type { SessionNotification } from '@/services/api/connecteProfilUniqueApi';


const SessionUniqueWatcher: React.FC = () => {

  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [blink, setBlink] = useState(0);
  const [summary, setSummary] = useState<SessionNotification | null>(null);
  const summaryTimer = useRef<number | undefined>(undefined);



  const handleForceLogout = useCallback(
    (reason?: string) => {

      toast({
        title: 'Session fermée',
        description:
          reason ||
          'Votre profil a été déconnecté depuis un autre appareil.',
        variant: 'destructive',
      });

      logout();

    },
    [logout, toast]
  );



  const goToHistorique = useCallback(() => {
    setSummary(null);
    navigate('/profile?tab=securite#historique-connexions');
  }, [navigate]);


  const handleNotification = useCallback(
    (notif: SessionNotification) => {

      const d = notif.details || {};

      // Résumé du jour (avant la connexion de l'admin principal) : bandeau 1 min
      if (notif.type === 'daily_summary') {
        setSummary(notif);
        if (summaryTimer.current) window.clearTimeout(summaryTimer.current);
        summaryTimer.current = window.setTimeout(() => setSummary(null), 60000);
        return;
      }

      const isLogin = notif.type === 'user_login';
      const isLogout = notif.type === 'user_logout';

      const title = isLogin
        ? `🟢 Connexion : ${d.nom || 'Profil'}`
        : isLogout
          ? `🔴 Déconnexion : ${d.nom || 'Profil'}`
          : 'Nouvelle connexion de votre profil';

      const heure = d.heure || d.heureConnexion || '';
      const date = d.date || d.dateConnexion || '';

      toast({
        title,

        description:
          `${d.browser || ''} ${
            d.os ? `· ${d.os}` : ''
          } · IP ${d.ip || ''} · ${date} ${heure}${
            d.timezone ? ` (${d.timezone})` : ''
          }`,

        onClick: goToHistorique,

        className: `cursor-pointer ${
          isLogout
            ? 'bg-red-600 text-white border-red-600'
            : isLogin
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-blue-600 text-white border-blue-600'
        }`,
      } as any);

    },
    [toast, goToHistorique]
  );





  const { logoutRequest, respond } = useSessionUnique({

    isAuthenticated,

    onForceLogout: handleForceLogout,

    onNotification: handleNotification,

  });



  // Rappel visuel toutes les 5 secondes tant que la demande est en attente
  useEffect(() => {

    if (!logoutRequest) return;


    const id = window.setInterval(() => {

      setBlink((b) => b + 1);

    }, 5000);


    return () => window.clearInterval(id);


  }, [logoutRequest]);



  if (!isAuthenticated) return null;


  const summaryBanner = (
    <AnimatePresence>
      {summary && (
        <motion.button
          key={summary.id}
          type="button"
          onClick={goToHistorique}
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="
            fixed top-4 left-1/2 z-[9998] -translate-x-1/2
            w-[92vw] max-w-md text-left
            overflow-hidden rounded-2xl
            border border-white/25
            bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900
            px-4 py-3 shadow-[0_20px_50px_rgba(16,185,129,.35)]
            backdrop-blur-xl hover:scale-[1.01] transition-transform
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <History className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                Activité du jour avant votre connexion
              </p>
              <p className="text-[12px] text-emerald-100">
                <span className="font-semibold text-emerald-300">
                  {summary.details?.connexions || 0}
                </span>{' '}
                connexion(s) ·{' '}
                <span className="font-semibold text-rose-300">
                  {summary.details?.deconnexions || 0}
                </span>{' '}
                déconnexion(s)
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );


  if (!logoutRequest) return summaryBanner;


  return (
   <>
    {summaryBanner}


    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
    <motion.div

      key={`${logoutRequest.requestId}-${blink}`}

      initial={{
        opacity: 0,
        y: -20,
        scale: 0.95
      }}

      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}

      exit={{
        opacity: 0,
        y: -20
      }}

      transition={{
        duration: 0.3
      }}

      className="
        pointer-events-auto
        w-[92vw] max-w-md
        max-h-[85vh] overflow-y-auto
        overflow-hidden
        rounded-2xl
        border border-orange-300/50
        bg-gradient-to-br
        from-orange-500
        via-orange-400
        to-amber-500
        shadow-[0_15px_40px_rgba(249,115,22,.4)]
        backdrop-blur-xl
      "

    >


      {/* HEADER */}

      <div
        className="
          flex items-center gap-2
          border-b border-white/20
          bg-white/10
          px-3 py-3
        "
      >

        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            bg-white/20
          "
        >

          <ShieldQuestion
            className="h-5 w-5 text-white"
          />

        </div>



        <div className="flex-1">

          <h2 className="text-sm font-bold text-white">

            Déconnexion demandée

          </h2>


          <p className="text-[11px] text-orange-100">

            Connexion détectée

          </p>


        </div>



        <AlertTriangle
          className="
            h-5 w-5
            animate-pulse
            text-yellow-200
          "
        />


      </div>





      {/* CONTENU */}

      <div className="space-y-3 p-3">


        <div
          className="
            rounded-xl
            bg-white/15
            p-3
            backdrop-blur
          "
        >

          <p className="text-xs leading-relaxed text-white">

            Votre profil tente de se connecter ailleurs.

            <br />

            <span className="font-semibold">

              Confirmer la déconnexion ?

            </span>

          </p>


        </div>





        {/* INFOS SESSION */}

        <div
          className="
            space-y-2
            rounded-xl
            bg-white/10
            p-3
            backdrop-blur
          "
        >


          <div className="flex items-center gap-2">

            <Monitor
              className="h-4 w-4 text-orange-100"
            />


            <span
              className="
                truncate
                text-xs
                text-white
              "
            >

              {logoutRequest.fromBrowser}

            </span>


          </div>




          <div className="flex items-center gap-2">

            <LogOut
              className="h-4 w-4 text-orange-100"
            />


            <span
              className="
                text-xs
                text-white
              "
            >

              IP : {logoutRequest.fromIp}

            </span>


          </div>


        </div>





        {/* BOUTONS */}

        <div className="flex gap-2">


          <Button

            size="sm"

            onClick={() => respond(true)}

            className="
              h-8
              flex-1
              rounded-lg
              bg-emerald-600
              px-2
              text-xs
              font-semibold
              text-white
              shadow-md
              hover:bg-emerald-700
            "

          >

            <CheckCircle2
              className="mr-1 h-4 w-4"
            />

            Confirmer


          </Button>




          <Button

            size="sm"

            variant="destructive"

            onClick={() => respond(false)}

            className="
              h-8
              flex-1
              rounded-lg
              bg-red-600
              px-2
              text-xs
              font-semibold
              shadow-md
              hover:bg-red-700
            "

          >

            <XCircle
              className="mr-1 h-4 w-4"
            />

            Refuser


          </Button>


        </div>





        {/* MESSAGE AUTO */}

        <div
          className="
            flex gap-2
            rounded-xl
            border border-white/20
            bg-white/10
            p-2
          "
        >

          <Clock3
            className="
              h-4 w-4
              flex-shrink-0
              text-yellow-200
            "
          />


          <p
            className="
              text-[11px]
              leading-relaxed
              text-orange-50
            "
          >

            Sans réponse,
            déconnexion automatique après

            <span className="font-bold text-white">

              {' '}5 minutes

            </span>.

          </p>


        </div>



      </div>



    </motion.div>
   </div>
   </>

  );


};


export default SessionUniqueWatcher;