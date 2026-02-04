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
  ChevronDown,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useMessages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-white/90 via-slate-50/90 to-violet-50/90 dark:from-slate-950/90 dark:via-slate-900/90 dark:to-violet-950/90 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-violet-500/5">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">

          {/* Logo + Objectif */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center group">
              <img
                src="/images/logo.ico"
                alt="Logo"
                className="h-12 w-24 sm:h-16 sm:w-32 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            
            {/* Objectif - visible on all sizes */}
            {isAuthenticated && <ObjectifIndicator />}
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="rounded-xl hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-violet-500" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/commandes">
                  <Button variant="ghost" className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                    <Package className="mr-2 h-4 w-4 text-emerald-500" />
                    Commandes
                  </Button>
                </Link>
              </>
            )}

            <Link to="/rdv">
              <Button variant="ghost" className="rounded-xl hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300">
                <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                Rendez-vous
              </Button>
            </Link>

            {isAuthenticated && <RdvNotifications />}

            {/* Theme */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-xl h-9 w-9 hover:bg-amber-500/10 transition-all duration-300 hover:scale-110"
            >
              {theme === 'dark'
                ? <Sun className="h-5 w-5 text-amber-500" />
                : <Moon className="h-5 w-5 text-indigo-600" />}
            </Button>

            {/* USER MENU */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-violet-200/50 dark:border-violet-800/50 hover:bg-violet-500/10 hover:border-violet-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 mr-2">
                      <UserCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{user?.firstName}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-violet-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl">

                  <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-500/10 focus:bg-blue-500/10 cursor-pointer">
                    <Link to="/messages" className="flex items-center w-full py-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 mr-3">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="font-medium">Messages</span>
                      {unreadCount > 0 && (
                        <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer">
                    <Link to="/tendances" className="flex items-center w-full py-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 mr-3">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="font-medium">Tendances</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg hover:bg-violet-500/10 focus:bg-violet-500/10 cursor-pointer">
                    <Link to="/Clients" className="flex items-center w-full py-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 mr-3">
                        <Users className="h-4 w-4 text-violet-500" />
                      </div>
                      <span className="font-medium">Clients</span>
                    </Link>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <Button 
                variant="ghost" 
                onClick={logout}
                className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            )}
          </div>

          {/* ================= TABLET & MOBILE ================= */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && <RdvNotifications />}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-xl h-9 w-9 hover:bg-amber-500/10 transition-all duration-300"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl h-9 w-9 hover:bg-violet-500/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE/TABLET MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden grid grid-cols-2 gap-2 pb-4 animate-in slide-in-from-top-2 duration-300">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-violet-200/50 dark:border-violet-800/50 hover:bg-violet-500/10">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-violet-500" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/commandes" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-500/10">
                    <Package className="mr-2 h-4 w-4 text-emerald-500" />
                    Commandes
                  </Button>
                </Link>
                <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-violet-200/50 dark:border-violet-800/50 hover:bg-violet-500/10">
                    <Users className="mr-2 h-4 w-4 text-violet-500" />
                    Clients
                  </Button>
                </Link>
                <Link to="/rdv" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-500/10">
                    <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                    Rendez-vous
                  </Button>
                </Link>
                <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-500/10">
                    <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/tendances" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-500/10">
                    <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
                    Tendances
                  </Button>
                </Link>
                <Button 
                  className="col-span-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/30" 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="col-span-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30">
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
