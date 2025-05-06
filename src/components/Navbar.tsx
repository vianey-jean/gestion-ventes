
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Home, Info, Mail, LogIn, UserCircle, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand name */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="logo-container flex items-center">
                  <span className="text-2xl font-extrabold text-app-red dark:text-app-purple">G</span>
                  <span className="text-2xl font-light text-app-red dark:text-app-purple">estion</span>
                  <span className="text-2xl font-extrabold text-app-red dark:text-app-purple ml-2">V</span>
                  <span className="text-2xl font-light text-app-red dark:text-app-purple">ente</span>
                </div>
              </Link>
            </div>
            
            {/* Navigation links */}
            <div className="flex items-center">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-purple">
                  <Home className="mr-1 h-4 w-4" />
                  Accueil
                </Link>
                
                <Link to="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-purple">
                  <Info className="mr-1 h-4 w-4" />
                  À propos
                </Link>
                
                <Link to="/contact" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-purple">
                  <Mail className="mr-1 h-4 w-4" />
                  Contact
                </Link>
                
                {isAuthenticated && (
                  <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-purple">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Admin
                  </Link>
                )}

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="text-gray-700 dark:text-gray-200"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    {/* Updated user name style */}
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      <UserCircle className="inline mr-1 h-4 w-4" />
                      {user?.firstName} {user?.lastName}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-app-red text-app-red hover:bg-app-red hover:text-white dark:border-app-purple dark:text-app-purple dark:hover:bg-app-purple"
                      onClick={logout}
                    >
                      <LogOut className="mr-1 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-app-red text-app-red hover:bg-app-red hover:text-white dark:border-app-purple dark:text-app-purple dark:hover:bg-app-purple">
                      <LogIn className="mr-1 h-4 w-4" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Mobile menu */}
              <div className="sm:hidden flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="text-gray-700 dark:text-gray-200"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Link to="/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-app-green text-app-green hover:bg-app-green hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {user?.firstName}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-app-red text-app-red hover:bg-app-red hover:text-white dark:border-app-purple dark:text-app-purple dark:hover:bg-app-purple"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-app-red text-app-red hover:bg-app-red hover:text-white dark:border-app-purple dark:text-app-purple dark:hover:bg-app-purple">
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
