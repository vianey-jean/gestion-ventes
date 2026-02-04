
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  User,
  Search,
  Filter,
  Archive,
  Star,
  Reply,
  Send,
  MoreVertical
} from 'lucide-react';
import { useMessages, Message } from '@/hooks/use-messages';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import Layout from '@/components/Layout';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import PremiumLoading from '@/components/ui/premium-loading';

const MessagesPage: React.FC = () => {
  const { messages, unreadCount, isLoading, markAsRead, markAsUnread, deleteMessage } = useMessages();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return (
      <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardContent className="pt-12 pb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <MessageSquare className="relative h-20 w-20 text-blue-500 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Accès Requis
            </h2>
            <div className="text-slate-600 dark:text-slate-300 mb-6">
              Connectez-vous pour accéder à votre messagerie sécurisée.
            </div>
          </CardContent>
        </Card>
      </div>
      </Layout>
    );
  }

    // Affichage du loader premium lors du chargement des messages
  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Chargement de votre messages"
          size="xl"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  const handleMarkAsRead = async (message: Message) => {
    await markAsRead(message.id);
    if (selectedMessage?.id === message.id) {
      setSelectedMessage({ ...message, lu: true });
    }
  };

  const handleMarkAsUnread = async (message: Message) => {
    await markAsUnread(message.id);
    if (selectedMessage?.id === message.id) {
      setSelectedMessage({ ...message, lu: false });
    }
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId);
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
    toast({
      title: "Message supprimé",
      description: "Le message a été supprimé avec succès.",
    });
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.lu) {
      handleMarkAsRead(message);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.expediteurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header Premium */}
       <div className="text-center mb-10">
  <div className="relative inline-block mb-6">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full blur-3xl opacity-25"></div>
    <h1 className="relative text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
      Votre Messagerie
    </h1>
  </div>

  <div className="flex items-center justify-center gap-6 mb-8">
    {/* Messages totaux */}
    <div className="flex items-center gap-3 px-8 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-purple-300/50 dark:border-purple-700/50 shadow-2xl hover:scale-105 transition-transform duration-300">
      <MessageSquare className="h-6 w-6 text-purple-600" />
      <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
        {messages.length} message{messages.length > 1 ? 's' : ''}
      </span>
    </div>

    {/* Messages non lus */}
    {unreadCount > 0 && (
      <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-400/20 via-pink-400/20 to-purple-400/20 backdrop-blur-2xl rounded-3xl border border-red-300/50 dark:border-red-600/50 shadow-2xl hover:scale-105 transition-transform duration-300">
        <Mail className="h-6 w-6 text-red-600" />
        <span className="font-semibold text-red-700 dark:text-red-300 text-lg">
          {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
        </span>
      </div>
    )}
  </div>
</div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-8xl mx-auto">
          {/* Sidebar des messages */}
          <div className="lg:col-span-2">
  <Card className="shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl">
    <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-2xl shadow-xl">
          <Mail className="h-6 w-6 text-white" />
        </div>
        Boîte de réception
      </CardTitle>

      {/* Barre de recherche premium */}
      <div className="relative mt-4">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Rechercher dans les messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-14 pr-4 py-3 bg-white/40 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 shadow-md backdrop-blur-sm transition-all duration-300"
        />
      </div>
    </CardHeader>

    <CardContent className="p-0">
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-500 mx-auto mb-4 shadow-lg"></div>
          <div className="text-slate-500 dark:text-slate-400">Chargement de vos messages...</div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="p-12 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full blur-2xl opacity-25"></div>
            <MessageSquare className="relative h-16 w-16 mx-auto text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-lg">Aucun message trouvé</div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 group ${
                !message.lu 
                  ? 'bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/30 dark:to-green-900/30 border-l-4 border-emerald-400' 
                  : ''
              } ${
                selectedMessage?.id === message.id 
                  ? 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/40 dark:to-pink-900/40 border-l-4 border-purple-400' 
                  : ''
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-xl shadow-sm">
                    <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <span className={`font-semibold text-base ${!message.lu ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {message.expediteurNom}
                  </span>
                </div>
                {!message.lu && (
                  <Badge className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white text-xs px-3 py-1 shadow-lg">
                    Nouveau
                  </Badge>
                )}
              </div>

              <div className={`text-base mb-3 line-clamp-2 ${!message.lu ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {message.sujet}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(message.dateEnvoi), { addSuffix: true, locale: fr })}
                </div>
                {!message.lu && (
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full shadow-md"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</div>


          {/* Panneau de lecture du message */}
          <div className="lg:col-span-3">
  {selectedMessage ? (
    <Card className="shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl">
      <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 mb-4 text-2xl">
              <div className="p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-2xl shadow-xl">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {selectedMessage.sujet}
              </span>
              {!selectedMessage.lu && (
                <Badge className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white shadow-lg">
                  Non lu
                </Badge>
              )}
            </CardTitle>

            <div className="space-y-3 text-base">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/20 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl shadow-inner">
                <User className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">De:</span>
                <span className="text-slate-600 dark:text-slate-300">{selectedMessage.expediteurNom}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/20 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl shadow-inner">
                <Mail className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span>
                <span className="text-slate-600 dark:text-slate-300">{selectedMessage.expediteurEmail}</span>
              </div>
              {selectedMessage.expediteurTelephone && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/20 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl shadow-inner">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Téléphone:</span>
                  <span className="text-slate-600 dark:text-slate-300">{selectedMessage.expediteurTelephone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/20 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl shadow-inner">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Reçu le:</span>
                <span className="text-slate-600 dark:text-slate-300">{new Date(selectedMessage.dateEnvoi).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedMessage.lu 
                ? handleMarkAsUnread(selectedMessage) 
                : handleMarkAsRead(selectedMessage)
              }
              className="bg-white/50 dark:bg-slate-700/50 border border-purple-300/50 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 shadow-md"
            >
              {selectedMessage.lu ? (
                <>
                  <EyeOff className="h-5 w-5 mr-2 text-red-500" />
                  Marquer non lu
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2 text-green-500" />
                  Marquer comme lu
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:to-pink-600 shadow-lg"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-0 shadow-2xl rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-300">
                    Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl px-4 py-2">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:to-pink-600 rounded-xl px-4 py-2 shadow-lg"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-slate-800/70 dark:to-purple-900/20 p-8 rounded-3xl border border-slate-200/30 dark:border-slate-600/30 shadow-inner">
            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed text-lg">
              {selectedMessage.contenu}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="h-full shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl">
      <CardContent className="flex items-center justify-center h-full py-32">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full blur-3xl opacity-25"></div>
            <MessageSquare className="relative h-24 w-24 mx-auto text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Sélectionnez un message
          </h3>
          <div className="text-slate-500 dark:text-slate-400 text-lg">
            Choisissez un message dans votre boîte de réception pour le lire
          </div>
        </div>
      </CardContent>
    </Card>
  )}
</div>

        </div>
      </div>
    </div>
    </Layout>
  );
};

export default MessagesPage;
