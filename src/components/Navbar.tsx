import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessages } from '@/hooks/use-messages';

import RdvNotifications from '@/components/rdv/RdvNotifications';
import ObjectifIndicator from '@/components/navbar/ObjectifIndicator';

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  LogIn,
  LogOut,
  UserCircle,
  Moon,
  Sun,
  Menu,
  X,
  Package,
  Info,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useMessages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">

          {/* Logo + Objectif */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img
                src="/images/logo.ico"
                alt="Logo"
                className="h-12 w-24 sm:h-16 sm:w-32 object-contain"
              />
            </Link>
            
            {/* Objectif - visible on all sizes */}
            {isAuthenticated && <ObjectifIndicator />}
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden lg:flex items-center space-x-2">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/commandes">
                  <Button variant="ghost">
                    <Package className="mr-2 h-4 w-4" />
                    Commandes
                  </Button>
                </Link>

                <Link to="/clients">
                  <Button variant="ghost">
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </Button>
                </Link>
              </>
            )}

            <Link to="/rdv">
              <Button variant="ghost">
                <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                Rendez-vous
              </Button>
            </Link>

            {isAuthenticated && <RdvNotifications />}

            {/* Theme */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark'
                ? <Sun className="h-4 w-4 text-yellow-500" />
                : <Moon className="h-4 w-4 text-blue-600" />}
            </Button>

            {/* USER MENU */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <UserCircle className="mr-2 h-4 w-4" />
                    {user?.firstName}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge className="ml-auto">{unreadCount}</Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/tendances" className="flex items-center w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Tendances
                    </Link>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <Button variant="destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            )}
          </div>

          {/* ================= TABLET & MOBILE ================= */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && <RdvNotifications />}

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-600" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* MOBILE/TABLET MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden grid grid-cols-2 gap-2 pb-4">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/commandes" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Commandes
                  </Button>
                </Link>
                <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </Button>
                </Link>
                <Link to="/rdv" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start border-orange-200 text-orange-600">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Rendez-vous
                  </Button>
                </Link>
                <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="ml-auto">{unreadCount}</Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/tendances" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Tendances
                  </Button>
                </Link>
                <Button variant="destructive" className="col-span-2" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="col-span-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
