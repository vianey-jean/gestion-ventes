
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Info, Mail, LogIn, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-app-red">Gestion Vente</h1>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-app-red">
                <Home className="mr-1 h-4 w-4" />
                Accueil
              </Link>
              
              <Link to="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-app-red">
                <Info className="mr-1 h-4 w-4" />
                À propos
              </Link>
              
              <Link to="/contact" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-app-red">
                <Mail className="mr-1 h-4 w-4" />
                Contact
              </Link>
              
              {isAuthenticated && (
                <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-app-red">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Admin
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-750">
                    <UserCircle className="inline mr-1 h-4 w-4" />
                    {user?.firstName} {user?.lastName}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-app-red text-app-red hover:bg-app-red hover:text-white"
                    onClick={logout}
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-app-red text-app-red hover:bg-app-red hover:text-white">
                    <LogIn className="mr-1 h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
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
                  
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-app-red text-app-red hover:bg-app-red hover:text-white"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-app-red text-app-red hover:bg-app-red hover:text-white">
                    <LogIn className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
