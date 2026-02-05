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
 import { motion } from 'framer-motion';
 
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
   Moon,
   Sun,
   Menu,
   X,
   Package,
   ChevronDown,
   TrendingUp,
   Sparkles,
   Crown,
   Diamond,
   Gem,
   Star,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const Navbar: React.FC = () => {
   const { isAuthenticated, user, logout } = useAuth();
   const { theme, toggleTheme } = useTheme();
   const { unreadCount } = useMessages();
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
   return (
     <header className="sticky top-0 z-50 backdrop-blur-2xl bg-gradient-to-r from-white/95 via-slate-50/95 to-violet-50/95 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-violet-950/95 border-b-2 border-violet-200/30 dark:border-violet-800/30 shadow-2xl shadow-violet-500/10">
       {/* Ultra Premium Top Gradient Bar */}
       <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
       
       <nav className="max-w-7xl mx-auto px-4 relative">
         {/* Decorative Background Elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
           <div className="absolute top-0 right-1/4 w-40 h-40 bg-fuchsia-500/5 rounded-full blur-3xl" />
         </div>
         
         <div className="flex justify-between h-16 items-center">
 
           {/* Logo + Objectif */}
           <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center group relative">
               <motion.div
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="relative"
               >
                 <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                 <img
                   src="/images/logo.ico"
                   alt="Logo"
                   className="relative h-12 w-24 sm:h-16 sm:w-32 object-contain"
                 />
               </motion.div>
             </Link>
             
             {/* Objectif - visible on all sizes */}
             {isAuthenticated && <ObjectifIndicator />}
           </div>
 
           {/* ================= DESKTOP ================= */}
           <div className="hidden lg:flex items-center space-x-1">
             {isAuthenticated && (
               <>
                 <Link to="/dashboard">
                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button variant="ghost" className="relative rounded-2xl hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10 transition-all duration-300 group overflow-hidden px-4 py-2">
                       <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                       <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 mr-2 shadow-lg shadow-violet-500/30">
                         <LayoutDashboard className="h-4 w-4 text-white" />
                       </div>
                       <span className="font-bold">Dashboard</span>
                     </Button>
                   </motion.div>
                 </Link>
 
                 <Link to="/commandes">
                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button variant="ghost" className="relative rounded-2xl hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 transition-all duration-300 group overflow-hidden px-4 py-2">
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                       <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mr-2 shadow-lg shadow-emerald-500/30">
                         <Package className="h-4 w-4 text-white" />
                       </div>
                       <span className="font-bold">Commandes</span>
                     </Button>
                   </motion.div>
                 </Link>
               </>
             )}
 
             <Link to="/rdv">
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button variant="ghost" className="relative rounded-2xl hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-amber-500/10 transition-all duration-300 group overflow-hidden px-4 py-2">
                   <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                   <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 mr-2 shadow-lg shadow-orange-500/30">
                     <CalendarDays className="h-4 w-4 text-white" />
                   </div>
                   <span className="font-bold">Rendez-vous</span>
                 </Button>
               </motion.div>
             </Link>
 
             {isAuthenticated && <RdvNotifications />}
 
             {/* Theme */}
             <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleTheme}
                 className="relative rounded-2xl h-10 w-10 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 transition-all duration-300 overflow-hidden group"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                 {theme === 'dark'
                   ? <Sun className="h-5 w-5 text-amber-500 drop-shadow-lg" />
                   : <Moon className="h-5 w-5 text-indigo-600 drop-shadow-lg" />}
               </Button>
             </motion.div>
 
             {/* USER MENU */}
             {isAuthenticated ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                     <Button 
                       variant="outline" 
                       className="relative rounded-2xl border-2 border-violet-300/50 dark:border-violet-700/50 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10 hover:border-violet-400/60 transition-all duration-300 shadow-lg shadow-violet-500/10 overflow-hidden group px-4"
                     >
                       <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                       <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 mr-2 shadow-lg shadow-violet-500/40">
                         <Crown className="h-4 w-4 text-white" />
                       </div>
                       <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{user?.firstName}</span>
                       <ChevronDown className="ml-2 h-4 w-4 text-violet-500" />
                       <Sparkles className="ml-1 h-3 w-3 text-amber-500 animate-pulse" />
                     </Button>
                   </motion.div>
                 </DropdownMenuTrigger>
 
                 <DropdownMenuContent align="end" className="w-64 rounded-2xl border-2 border-violet-200/50 dark:border-violet-800/50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl shadow-violet-500/20 p-2">
                   {/* Premium Header in Dropdown */}
                   <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-200/50 dark:border-violet-800/50">
                     <div className="flex items-center gap-2">
                       <Diamond className="h-4 w-4 text-violet-500" />
                       <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Menu Premium</span>
                       <Gem className="h-3 w-3 text-fuchsia-500 animate-pulse" />
                     </div>
                   </div>
 
                   <DropdownMenuItem asChild className="rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 focus:bg-blue-500/10 cursor-pointer transition-all duration-300 py-3">
                     <Link to="/messages" className="flex items-center w-full py-2">
                       <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mr-3 shadow-lg shadow-blue-500/30">
                         <MessageSquare className="h-5 w-5 text-white" />
                       </div>
                       <span className="font-bold">Messages</span>
                       {unreadCount > 0 && (
                         <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg animate-pulse">
                           {unreadCount}
                         </Badge>
                       )}
                     </Link>
                   </DropdownMenuItem>
 
                   <DropdownMenuItem asChild className="rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 focus:bg-emerald-500/10 cursor-pointer transition-all duration-300 py-3">
                     <Link to="/tendances" className="flex items-center w-full py-2">
                       <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mr-3 shadow-lg shadow-emerald-500/30">
                         <TrendingUp className="h-5 w-5 text-white" />
                       </div>
                       <span className="font-bold">Tendances</span>
                       <Star className="ml-auto h-4 w-4 text-amber-500" />
                     </Link>
                   </DropdownMenuItem>
 
                   <DropdownMenuItem asChild className="rounded-xl hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10 focus:bg-violet-500/10 cursor-pointer transition-all duration-300 py-3">
                     <Link to="/Clients" className="flex items-center w-full py-2">
                       <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 mr-3 shadow-lg shadow-violet-500/30">
                         <Users className="h-5 w-5 text-white" />
                       </div>
                       <span className="font-bold">Clients</span>
                     </Link>
                   </DropdownMenuItem>
 
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Link to="/login">
                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                   <Button className="rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 shadow-xl shadow-violet-500/40 transition-all duration-300 px-6 py-3 font-bold">
                     <LogIn className="mr-2 h-5 w-5" />
                     Connexion
                     <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
                   </Button>
                 </motion.div>
               </Link>
             )}
 
             {isAuthenticated && (
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button 
                   variant="ghost" 
                   onClick={logout}
                   className="rounded-2xl text-rose-500 hover:text-rose-600 hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-pink-500/10 transition-all duration-300 font-bold"
                 >
                   <LogOut className="mr-2 h-4 w-4" />
                   Déconnexion
                 </Button>
               </motion.div>
             )}
           </div>
 
           {/* ================= TABLET & MOBILE ================= */}
           <div className="lg:hidden flex items-center gap-2">
             {isAuthenticated && <RdvNotifications />}
 
             <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleTheme}
                 className="rounded-xl h-10 w-10 hover:bg-amber-500/10 transition-all duration-300"
               >
                 {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
               </Button>
             </motion.div>
 
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="rounded-xl h-10 w-10 hover:bg-violet-500/10 transition-all duration-300"
               >
                 {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
               </Button>
             </motion.div>
           </div>
         </div>
 
         {/* MOBILE/TABLET MENU */}
         {isMobileMenuOpen && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="lg:hidden grid grid-cols-2 gap-3 pb-6 pt-2"
           >
             {isAuthenticated && (
               <>
                 <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-violet-200/50 dark:border-violet-800/50 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 mr-3 shadow-md">
                       <LayoutDashboard className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Dashboard</span>
                   </Button>
                 </Link>
                 <Link to="/commandes" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 mr-3 shadow-md">
                       <Package className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Commandes</span>
                   </Button>
                 </Link>
                 <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-violet-200/50 dark:border-violet-800/50 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 mr-3 shadow-md">
                       <Users className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Clients</span>
                   </Button>
                 </Link>
                 <Link to="/rdv" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-orange-200/50 dark:border-orange-800/50 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-amber-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                       <CalendarDays className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Rendez-vous</span>
                   </Button>
                 </Link>
                 <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mr-3 shadow-md">
                       <MessageSquare className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Messages</span>
                     {unreadCount > 0 && (
                       <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md">
                         {unreadCount}
                       </Badge>
                     )}
                   </Button>
                 </Link>
                 <Link to="/tendances" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button variant="outline" className="w-full justify-start rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 py-6 shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 mr-3 shadow-md">
                       <TrendingUp className="h-4 w-4 text-white" />
                     </div>
                     <span className="font-bold">Tendances</span>
                   </Button>
                 </Link>
                 <Button 
                   className="col-span-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:via-pink-400 hover:to-fuchsia-400 shadow-xl shadow-rose-500/40 py-6 font-bold text-lg" 
                   onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                 >
                   <LogOut className="mr-2 h-5 w-5" />
                   Déconnexion
                 </Button>
               </>
             )}
 
             {!isAuthenticated && (
               <Link to="/login" className="col-span-2" onClick={() => setIsMobileMenuOpen(false)}>
                 <Button className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 shadow-xl shadow-violet-500/40 py-6 font-bold text-lg">
                   <LogIn className="mr-2 h-5 w-5" />
                   Connexion
                   <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
                 </Button>
               </Link>
             )}
           </motion.div>
         )}
       </nav>
     </header>
   );
 };
 
 export default Navbar;