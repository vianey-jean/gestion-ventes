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
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useMessages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="
      sticky top-0 z-50
      backdrop-blur-2xl
      bg-gradient-to-r from-white/70 via-violet-50/60 to-fuchsia-50/70
      dark:from-slate-950/80 dark:via-violet-950/70 dark:to-slate-900/80
      border-b border-white/20 dark:border-white/10
      shadow-[0_20px_60px_-15px_rgba(139,92,246,0.25)]
    ">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO + OBJECTIF */}
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center">
              <img
                src="/images/logo.ico"
                alt="Logo"
                className="h-12 w-24 sm:h-16 sm:w-32 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
            {isAuthenticated && <ObjectifIndicator />}
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden lg:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="rounded-2xl px-4 hover:bg-violet-500/10 hover:shadow-md transition-all">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-violet-500" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/commandes">
                  <Button variant="ghost" className="rounded-2xl px-4 hover:bg-emerald-500/10 hover:shadow-md transition-all">
                    <Package className="mr-2 h-4 w-4 text-emerald-500" />
                    Commandes
                  </Button>
                </Link>
              </>
            )}

            <Link to="/rdv">
              <Button variant="ghost" className="rounded-2xl px-4 hover:bg-orange-500/10 hover:shadow-md transition-all">
                <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                Rendez-vous
              </Button>
            </Link>

            {isAuthenticated && <RdvNotifications />}

            {/* THEME */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="
                rounded-2xl h-9 w-9
                hover:scale-110
                hover:bg-amber-500/10
                transition-all
              "
            >
              {theme === 'dark'
                ? <Sun className="h-5 w-5 text-amber-400" />
                : <Moon className="h-5 w-5 text-indigo-600" />}
            </Button>

            {/* USER MENU */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="
                      rounded-2xl px-3
                      border-white/30 dark:border-white/10
                      bg-white/60 dark:bg-slate-900/60
                      backdrop-blur-xl
                      hover:shadow-lg hover:bg-white/80
                      transition-all
                    "
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mr-2 shadow-md">
                      <UserCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{user?.firstName}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-violet-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
                    w-56 rounded-2xl
                    bg-white/80 dark:bg-slate-900/80
                    backdrop-blur-2xl
                    border border-white/30 dark:border-white/10
                    shadow-2xl
                  "
                >
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-blue-500/10">
                    <Link to="/messages" className="flex items-center w-full py-2">
                      <MessageSquare className="h-4 w-4 text-blue-500 mr-3" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-emerald-500/10">
                    <Link to="/tendances" className="flex items-center w-full py-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500 mr-3" />
                      Tendances
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-violet-500/10">
                    <Link to="/Clients" className="flex items-center w-full py-2">
                      <Users className="h-4 w-4 text-violet-500 mr-3" />
                      Clients
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-xl hover:scale-105 transition-all">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={logout}
                className="rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            )}
          </div>

          {/* ================= MOBILE ================= */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && <RdvNotifications />}

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-2xl h-9 w-9">
              {theme === 'dark'
                ? <Sun className="h-5 w-5 text-amber-400" />
                : <Moon className="h-5 w-5 text-indigo-600" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-2xl h-9 w-9"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
