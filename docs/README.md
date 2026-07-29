# 📚 Documentation VentePro — Sommaire général

> **Application** : VentePro — Gestion commerciale full-stack (React + Express + base JSON)
> **Version documentaire** : 7.0.0 — refonte complète
> **Généré le** : 2026-07-29
> **Périmètre couvert** : 544 fichiers frontend, 56 fichiers de routes API, 27 modèles serveur, 66 fichiers de base de données.

## 🗂️ Table des documents

| Document | Contenu |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture MVC, flux de données, temps réel, arborescence |
| [CAHIER_DE_CHARGE.md](./CAHIER_DE_CHARGE.md) | Cahier des charges fonctionnel complet, page par page et composant par composant |
| [PAGES.md](./PAGES.md) | Spécification détaillée de **toutes** les pages et de leurs sous-composants |
| [COMPOSANTS.md](./COMPOSANTS.md) | Spécification détaillée de **tous** les composants (props, API, dépendances) |
| [COMPOSANTS_UI.md](./COMPOSANTS_UI.md) | Bibliothèque de composants de base (shadcn/ui) et composants partagés |
| [FRONTEND.md](./FRONTEND.md) | Stack front, contextes, stores, hooks, services, types, utils |
| [BACKEND.md](./BACKEND.md) | Serveur Express : routes, contrôleurs, modèles, middlewares, services |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Référence exhaustive des endpoints REST + services front correspondants |
| [BASE_DE_DONNEES.md](./BASE_DE_DONNEES.md) | Description de chaque fichier JSON de la base et de ses champs |
| [GUIDE_UTILISATION.md](./GUIDE_UTILISATION.md) | Guide utilisateur pas à pas de chaque page |
| [GUIDE_MODIFICATION.md](./GUIDE_MODIFICATION.md) | **« Pour modifier X, il faut toucher ces fichiers »** — carte de modification par fonctionnalité |
| [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) | Installation, configuration, lancement |
| [SECURITE.md](./SECURITE.md) | Authentification, chiffrement, captcha, RGPD, durcissement |
| [TEMPS_REEL.md](./TEMPS_REEL.md) | Synchronisation SSE, cache, invalidation |
| [PARTAGE.md](./PARTAGE.md) | Liens de partage, partage sélectif, commentaires visiteurs |
| [PERFORMANCE.md](./PERFORMANCE.md) | Optimisations, budgets, bonnes pratiques |
| [TESTS_GUIDE.md](./TESTS_GUIDE.md) | Stratégie et exécution des tests |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Déploiement front (Vercel) et back (Render) |
| [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) | Exploitation, sauvegardes, mode maintenance, incidents |

## ⚡ Démarrage rapide

```bash
npm install && npm run dev          # frontend  → http://localhost:8080
cd server && npm install && npm start  # backend  → http://localhost:5000
```

## 🧭 Conventions de lecture

- **Page** = composant routé (`src/pages`), **Composant** = brique réutilisable (`src/components`).
- Tout accès réseau passe par `src/services/api/*Api.ts` → jamais d'appel `axios` direct dans un composant.
- Tout accès disque serveur passe par `server/models/*.js` → jamais de `fs` direct dans une route.

