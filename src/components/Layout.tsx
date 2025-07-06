
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RealtimeWrapper } from './common/RealtimeWrapper';

interface LayoutProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const content = (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      <Footer />
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
