
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessages } from '@/hooks/use-messages';
import { 
  Home, 
  Info, 
  Mail, 
  LogIn, 
  UserCircle, 
  LogOut, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  Sparkles, 
  TrendingUp, 
  Users,
  MessageSquare,
  ChevronDown
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

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="transition-all duration-200" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo with modern styling */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="logo-container flex items-center p-2 rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300">
                  <div className="relative">
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-purple-500 animate-pulse" />
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">G</span>
                  </div>
                  <span className="text-2xl font-light text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">estion</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-2">V</span>
                  <span className="text-2xl font-light text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">ente</span>
                </div>
              </Link>
            </div>
            
            {/* Navigation links with modern styling */}
            <div className="flex items-center">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <p className="text-blue-600 bg-transparent">Tableau de Bord</p>
                    </Link>
                    
                    <Link to="/tendances" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200">
                      <TrendingUp className="mr-2 h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <p className="text-emerald-600 bg-transparent">Tendances</p>
                    </Link>

                    <Link to="/clients" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                      <Users className="mr-2 h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      <p className="text-purple-600 bg-transparent">Clients</p>
                    </Link>
                  </>
                )}

                {!isAuthenticated && (
                  <Link to="/about" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                    <Info className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    À propos
                  </Link>
                )}
                
                <Link to="/contact" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Contact
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="ml-2 h-10 w-10 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                >
                  {theme === 'dark' ? 
                    <Sun className="h-4 w-4 text-yellow-500 hover:rotate-180 transition-transform duration-500" /> : 
                    <Moon className="h-4 w-4 text-blue-600 hover:rotate-180 transition-transform duration-500" />
                  }
                </Button>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3 ml-4">
                    {/* Menu déroulant utilisateur */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-200"
                        >
                          <UserCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {user?.firstName} {user?.lastName}
                          </span>
                          <ChevronDown className="h-4 w-4 ml-1 text-purple-600 dark:text-purple-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <DropdownMenuItem asChild>
                          <Link to="/messages" className="flex items-center w-full cursor-pointer">
                            <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Messages</span>
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 px-4 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:border-red-500 transition-all duration-200"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="ml-4">
                    <Button 
                      className="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Mobile menu with modern styling */}
              <div className="sm:hidden flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="h-10 w-10 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                >
                  {theme === 'dark' ? 
                    <Sun className="h-4 w-4 text-yellow-500" /> : 
                    <Moon className="h-4 w-4 text-blue-600" />
                  }
                </Button>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Link to="/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl border-2 border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link to="/tendances">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link to="/clients">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link to="/messages" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center bg-red-500 text-white"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                    
                    <div className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {user?.firstName}
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 w-10 p-0 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/">
                    <Button 
                      className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    >
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
