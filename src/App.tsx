
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AccessibilityProvider } from './components/accessibility/AccessibilityProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import Produits from './pages/Produits';
import Ventes from './pages/Ventes';
import PretFamilles from './pages/PretFamilles';
import PretProduits from './pages/PretProduits';
import Depenses from './pages/Depenses';
import TendancesPage from './pages/TendancesPage';
import Comptabilite from './pages/Comptabilite';
import { Toaster } from './components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ResetPasswordPage />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/produits" element={
                      <ProtectedRoute>
                        <Produits />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventes" element={
                      <ProtectedRoute>
                        <Ventes />
                      </ProtectedRoute>
                    } />
                    <Route path="/pret-familles" element={
                      <ProtectedRoute>
                        <PretFamilles />
                      </ProtectedRoute>
                    } />
                    <Route path="/pret-produits" element={
                      <ProtectedRoute>
                        <PretProduits />
                      </ProtectedRoute>
                    } />
                    <Route path="/depenses" element={
                      <ProtectedRoute>
                        <Depenses />
                      </ProtectedRoute>
                    } />
                    <Route path="/tendances" element={
                      <ProtectedRoute>
                        <TendancesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/comptabilite" element={
                      <ProtectedRoute>
                        <Comptabilite />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Toaster />
              </Router>
            </AppProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
