
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RealtimeWrapper } from '@/components/common/RealtimeWrapper';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { ErrorBoundaryProvider } from '@/hooks/use-error-boundary';

import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import TendancesPage from '@/pages/TendancesPage';
import NotFound from '@/pages/NotFound';

import './App.css';

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundaryProvider>
          <AccessibilityProvider>
            <ThemeProvider>
              <AuthProvider>
                <AppProvider>
                  <RealtimeWrapper>
                    <div className="App min-h-screen bg-background text-foreground">
                      <Router>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/reset-password" element={<ResetPasswordPage />} />
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route path="/tendances" element={<TendancesPage />} />
                          <Route path="/404" element={<NotFound />} />
                          <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                      </Router>
                      <Toaster />
                    </div>
                  </RealtimeWrapper>
                </AppProvider>
              </AuthProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </ErrorBoundaryProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
