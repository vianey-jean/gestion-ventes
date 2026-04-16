# 🚀 Guide de Démarrage — Riziky Gestion

> Ce guide explique comment installer, lancer et utiliser le projet pas à pas.  
> Même si tu n'as jamais codé, suis les étapes dans l'ordre.

---

## 📋 Pré-requis

Avant de commencer, tu as besoin de ces logiciels sur ton ordinateur :

| Logiciel | Version minimum | Comment l'installer |
|----------|----------------|---------------------|
| **Node.js** | 18 ou plus | https://nodejs.org → Télécharger "LTS" |
| **npm** | Inclus avec Node.js | S'installe automatiquement avec Node.js |
| **Git** | N'importe quelle version | https://git-scm.com |
| **Un éditeur** | — | VS Code recommandé : https://code.visualstudio.com |

### Vérifier l'installation

Ouvre un terminal (ou invite de commandes) et tape :

```bash
node --version    # Doit afficher v18.x.x ou plus
npm --version     # Doit afficher un numéro
git --version     # Doit afficher un numéro
```

---

## 📥 Étape 1 : Télécharger le projet

```bash
git clone https://github.com/vianey-jean/gestion-ventes.git
cd gestion-ventes
```

Tu es maintenant dans le dossier du projet. Il contient :
- Le **frontend** (React) → à la racine
- Le **backend** (Node.js/Express) → dans le sous-dossier `server/`

---

## 📦 Étape 2 : Installer les dépendances

### Frontend
```bash
npm install
```

### Backend
```bash
cd server
npm install
cd ..
```

---

## ⚙️ Étape 3 : Configuration

### Backend (`server/.env`)

Le serveur a besoin d'un fichier `.env` dans le dossier `server/`. Crée-le s'il n'existe pas :

```env
PORT=10000
JWT_SECRET=ta_cle_secrete_ici
ENCRYPTION_KEY=cle_de_chiffrement_10_caracteres_minimum
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port du serveur (par défaut : 10000) |
| `JWT_SECRET` | Clé secrète pour générer les tokens d'authentification |
| `ENCRYPTION_KEY` | Clé pour chiffrer les fichiers JSON de la base de données (min 10 caractères) |

### Frontend

Le frontend se connecte au backend via l'URL configurée dans les services API (`src/services/api/api.ts`). En développement, c'est `http://localhost:10000`.

---

## ▶️ Étape 4 : Lancer le projet

Tu as besoin de **2 terminaux ouverts en même temps** :

### Terminal 1 — Backend
```bash
cd server
npm run dev
```
Message attendu : `Server running on port 10000`

### Terminal 2 — Frontend
```bash
npm run dev
```
Message attendu : `Local: http://localhost:5173`

---

## 🌐 Étape 5 : Utiliser l'application

1. Ouvre ton navigateur à l'adresse : **http://localhost:5173**
2. Tu verras d'abord une **page de vérification de sécurité** (code PIN ou question)
3. Ensuite, tu arrives sur la **page d'accueil**
4. Clique sur **"Connexion"** pour te connecter
5. Si tu n'as pas de compte, clique sur **"Inscription"** pour en créer un

### Première utilisation

Après inscription et connexion, tu arrives sur le **Dashboard** :
- En haut : barre de navigation avec les modules
- Au centre : tableau de bord avec ventes, produits, statistiques
- À gauche dans le menu : accès à toutes les fonctionnalités

---

## 🏭 Déploiement en production

| Service | Plateforme | URL |
|---------|-----------|-----|
| Frontend | **Vercel** | https://riziky-gestion-ventes.vercel.app/ |
| Backend | **Render** | https://server-gestion-ventes.onrender.com |

### Déployer le frontend sur Vercel
1. Connecte ton repo GitHub à Vercel
2. Build command : `npm run build`
3. Output directory : `dist`

### Déployer le backend sur Render
1. Crée un "Web Service" sur Render
2. Pointe vers le dossier `server/`
3. Build command : `npm install`
4. Start command : `node server.js`
5. Ajoute les variables d'environnement (`JWT_SECRET`, `ENCRYPTION_KEY`)

---

## ❓ Problèmes courants

| Problème | Solution |
|----------|----------|
| `ECONNREFUSED` | Le serveur backend n'est pas lancé. Lance `cd server && npm run dev` |
| `500 Internal Server Error` | Vérifie que les fichiers JSON existent dans `server/db/` |
| Page blanche | Vérifie la console du navigateur (F12 → Console) |
| `CORS error` | Le backend n'accepte pas ton domaine. Vérifie la config CORS dans `server.js` |
| `JWT expired` | Reconnecte-toi, le token expire après 8 heures |
