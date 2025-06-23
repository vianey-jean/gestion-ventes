
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Home, Info, Mail, LogIn, UserCircle, LogOut, LayoutDashboard, Moon, Sun, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
                <Link to="/" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Accueil
                </Link>
                
                <Link to="/about" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <Info className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  À propos
                </Link>
                
                <Link to="/contact" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Contact
                </Link>
                
                {isAuthenticated && (
                  <Link to="/dashboard" className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <p className="text-blue-600 bg-transparent">Tableau de Bord</p>

                  </Link>
                )}

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
                    <div className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                      <UserCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    
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
                  <Link to="/login">
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
