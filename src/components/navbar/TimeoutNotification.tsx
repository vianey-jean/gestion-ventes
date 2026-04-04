import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeoutNotificationProps {
  sessionWarningVisible: boolean;
  sessionMinutesLeft: number;
  inactivityWarningVisible: boolean;
  inactivitySecondsLeft: number;
}

const TimeoutNotification: React.FC<TimeoutNotificationProps> = ({
  sessionWarningVisible,
  sessionMinutesLeft,
  inactivityWarningVisible,
  inactivitySecondsLeft,
}) => {
  const showAny = sessionWarningVisible || inactivityWarningVisible;

  return (
    <AnimatePresence>
      {showAny && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-[60px] left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg"
        >
          {inactivityWarningVisible && (
            <div className="mb-2 rounded-2xl backdrop-blur-2xl bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white shadow-2xl shadow-red-500/30 border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Site inactif</p>
                  <p className="text-xs opacity-90">
                    Déconnexion dans {inactivitySecondsLeft}s — bougez la souris ou cliquez
                  </p>
                </div>
              </div>
            </div>
          )}

          {sessionWarningVisible && (
            <div className="rounded-2xl backdrop-blur-2xl bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 text-white shadow-2xl shadow-violet-500/30 border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Session bientôt expirée</p>
                  <p className="text-xs opacity-90">
                    Il vous reste {sessionMinutesLeft} minute{sessionMinutesLeft > 1 ? 's' : ''}
                  </p>
                </div>
                <Link to="/profile?tab=securite">
                  <Button size="sm" className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 h-8 text-xs">
                    <Settings className="w-3 h-3 mr-1" /> Prolonger
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimeoutNotification;
