
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RealtimeWrapper } from './common/RealtimeWrapper';
import { useAccessibility } from './accessibility/AccessibilityProvider';
import LiveChatAdmin from './livechat/LiveChatAdmin';
import { useAutoLogout } from '@/hooks/use-auto-logout';
import TimeoutNotification from './navbar/TimeoutNotification';

interface LayoutProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { announceToScreenReader } = useAccessibility();
  const location = useLocation();
  const { sessionWarningVisible, sessionMinutesLeft, inactivityWarningVisible, inactivitySecondsLeft } = useAutoLogout();
  
  React.useEffect(() => {
    const pageTitle = document.title;
    announceToScreenReader(`Page chargée: ${pageTitle}`);
  }, [location.pathname, announceToScreenReader]);
  
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const content = (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <TimeoutNotification
        sessionWarningVisible={sessionWarningVisible}
        sessionMinutesLeft={sessionMinutesLeft}
        inactivityWarningVisible={inactivityWarningVisible}
        inactivitySecondsLeft={inactivitySecondsLeft}
      />
      
      <main 
        id="main-content"
        className="flex-grow"
        role="main"
        aria-label="Contenu principal"
        tabIndex={-1}
      >
        {children || <Outlet />}
      </main>
      
      <Footer />
      <ScrollToTop />
      <LiveChatAdmin />
    </div>
  );
  
  // Envelopper avec la synchronisation temps réel si authentifié
  if (isAuthenticated) {
    return (
      <RealtimeWrapper>
        {content}
      </RealtimeWrapper>
    );
  }
  
  return content;
};

export default Layout;
