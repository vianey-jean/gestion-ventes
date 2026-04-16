# 📚 Documentation Complète — Riziky Gestion

> **Version** : 5.0.0  
> **Auteur** : Jean RABEMANALINA  
> **URL Production** : https://riziky-gestion-ventes.vercel.app/  
> **Serveur API** : https://server-gestion-ventes.onrender.com

---

## 📖 Table des matières

| N° | Document | Description |
|----|----------|-------------|
| 1 | [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) | Comment installer, lancer et utiliser le projet |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) | Structure complète du projet (dossiers, fichiers, relations) |
| 3 | [FRONTEND.md](./FRONTEND.md) | Toutes les pages, composants, hooks, contexts et services React |
| 4 | [BACKEND.md](./BACKEND.md) | Toutes les routes API, modèles, middlewares et contrôleurs |
| 5 | [FONCTIONNALITES.md](./FONCTIONNALITES.md) | Description détaillée de chaque fonctionnalité métier |
| 6 | [SECURITE.md](./SECURITE.md) | Système de sécurité, authentification, chiffrement |
| 7 | [PARTAGE_COMMENTAIRES.md](./PARTAGE_COMMENTAIRES.md) | Liens partagés, commentaires, snapshots HTML |

---

## 🎯 C'est quoi Riziky Gestion ?

**Riziky Gestion** est une application web complète de gestion commerciale. Elle permet de :

- 🛒 **Gérer les produits** : ajouter, modifier, supprimer, photos, prix, stock
- 💰 **Suivre les ventes** : enregistrer les ventes, voir les profits, exporter en PDF
- 👥 **Gérer les clients** : fiches clients, historique, photos
- 📋 **Gérer les commandes** : réservations, suivi, reportage
- 📅 **Rendez-vous** : calendrier, notifications, rappels
- ⏱️ **Pointage** : suivi heures des travailleurs par entreprise
- 📝 **Notes** : système Kanban avec colonnes et drag & drop
- ✅ **Tâches** : calendrier de tâches avec rappels
- 💳 **Comptabilité** : achats, dépenses, bénéfices, graphiques
- 💬 **Messagerie** : chat interne
- 🔗 **Partage** : liens partagés avec commentaires et snapshots
- 👤 **Profil** : paramètres, sécurité, modules configurables

---

## 🏗️ Technologies utilisées

### Frontend (ce dossier)
| Technologie | Usage |
|-------------|-------|
| React 18 | Interface utilisateur |
| TypeScript 5 | Typage statique |
| Vite 5 | Build et développement |
| Tailwind CSS 3 | Styles utilitaires |
| shadcn/ui | Composants UI (Dialog, Table, Toast...) |
| Recharts | Graphiques (comptabilité, tendances) |
| React Router | Navigation entre pages |
| Axios | Appels API vers le serveur |
| Lucide React | Icônes |

### Backend (dossier `server/`)
| Technologie | Usage |
|-------------|-------|
| Node.js 18+ | Runtime serveur |
| Express 5 | Framework API REST |
| JWT | Authentification (tokens 8h) |
| bcryptjs | Hachage mots de passe |
| JSON files | Base de données locale (dans `server/db/`) |
| Multer | Upload fichiers et photos |
| SSE | Synchronisation temps réel |
| Compression | Optimisation réseau |

---

## ⚡ Démarrage rapide

```bash
# 1. Cloner le projet
git clone https://github.com/vianey-jean/gestion-ventes.git
cd gestion-ventes

# 2. Installer le frontend
npm install

# 3. Installer le backend
cd server && npm install && cd ..

# 4. Lancer le backend (terminal 1)
cd server && npm run dev

# 5. Lancer le frontend (terminal 2)
npm run dev
```

➡️ Frontend : http://localhost:5173  
➡️ Backend : http://localhost:10000

Pour plus de détails, voir [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md).
