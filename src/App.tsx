
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

// Pages
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import TendancesPage from '@/pages/TendancesPage';
import ClientsPage from '@/pages/ClientsPage';
import MessagesPage from '@/pages/MessagesPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                <Routes>
                  {/* Routes publiques avec Layout standard */}
                  
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />

                  {/* Page Contact sans navbar */}
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Routes protégées avec Layout d'authentification */}
               
                   <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/tendances" element={
                      <ProtectedRoute>
                        <TendancesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/clients" element={
                      <ProtectedRoute>
                        <ClientsPage />
                      </ProtectedRoute>
                    } /> 
                    <Route path="/messages" element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    } /> 
                   
                  {/* Route 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
