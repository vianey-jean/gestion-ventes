// Résumé :
// Ce fichier définit la configuration principale de l'application React.
// - Fournit les Contexts globaux : Auth, App, Theme, Accessibilité
// - Configure les routes avec sécurité (ProtectedRoute) et lazy loading
// - Utilise ErrorBoundary pour isoler les erreurs critiques
// - Améliore les performances en chargeant les pages "à la demande"

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

// Sécurité et erreurs
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

// Fallback pendant chargement des pages
import PremiumLoading from '@/components/ui/premium-loading';

// ==================
// Lazy loading pages
// ==================
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TendancesPage = lazy(() => import('@/pages/TendancesPage'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                {/* Suspense : gestion du chargement asynchrone */}
                <Suspense
                  fallback={
                    <PremiumLoading
                      text="Chargement des données en cours..."
                      size="xl"
                      overlay={true}
                      variant="default"
                    />
                  }
                >
                  <Routes>
                    {/* Routes publiques */}
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="contact" element={<ContactPage />} />

                    {/* Routes protégées */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tendances"
                      element={
                        <ProtectedRoute>
                          <TendancesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <ClientsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Page 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
              <Toaster />
            </AppProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
