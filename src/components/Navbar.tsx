import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessages } from '@/hooks/use-messages';
import RdvNotifications from '@/components/rdv/RdvNotifications';
import {
  LayoutDashboard,
  TrendingUp,
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
  ChevronDown,
  Package,
  Info,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useMessages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b">
      <nav>
        <div className="max-w-7xl mx-auto px-4">

          {/* ================= TOP BAR ================= */}
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/images/logo.ico"
                alt="Logo"
                className="h-12 w-24 sm:h-16 sm:w-32 object-contain"
              />
            </Link>

            {/* ================= DESKTOP MENU ================= */}
            <div className="hidden md:flex items-center space-x-2">

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

                  <Link to="/tendances">
                    <Button variant="ghost">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Tendances
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

              {!isAuthenticated && (
                <Link to="/about">
                  <Button variant="ghost">
                    <Info className="mr-2 h-4 w-4" />
                    À propos
                  </Button>
                </Link>
              )}

              {/* RDV Desktop */}
              <Link to="/rdv">
                <Button variant="ghost">
                  <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                  Rendez-vous
                </Button>
              </Link>

              {/* 🔔 Notifications Desktop */}
              {isAuthenticated && <RdvNotifications />}

              {/* Theme */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-600" />
                )}
              </Button>

              {/* User menu */}
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

            {/* ================= MOBILE / TABLET BAR ================= */}
            <div className="md:hidden flex items-center gap-2">

              {/* 🔔 Notifications MOBILE */}
              {isAuthenticated && <RdvNotifications />}

              {/* Theme */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun /> : <Moon />}
              </Button>

              {/* Menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* ================= MOBILE MENU ================= */}
          {isMobileMenuOpen && (
            <div className="md:hidden grid grid-cols-2 gap-2 pb-4">

              {isAuthenticated && (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" size="icon" className="w-full">
                      <LayoutDashboard />
                    </Button>
                  </Link>

                  <Link to="/commandes">
                    <Button variant="outline" size="icon" className="w-full">
                      <Package />
                    </Button>
                  </Link>

                  <Link to="/tendances">
                    <Button variant="outline" size="icon" className="w-full">
                      <TrendingUp />
                    </Button>
                  </Link>

                  <Link to="/clients">
                    <Button variant="outline" size="icon" className="w-full">
                      <Users />
                    </Button>
                  </Link>
                </>
              )}

              {/* RDV Mobile */}
              <Link to="/rdv">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"
                >
                  <CalendarDays />
                </Button>
              </Link>

              {isAuthenticated && (
                <Link to="/messages" className="relative">
                  <Button variant="outline" size="icon" className="w-full">
                    <MessageSquare />
                  </Button>
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <Button
                  variant="destructive"
                  size="icon"
                  className="col-span-2"
                  onClick={logout}
                >
                  <LogOut />
                </Button>
              ) : (
                <Link to="/login" className="col-span-2">
                  <Button className="w-full">
                    <LogIn />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
