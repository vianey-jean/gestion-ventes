# 📦 Déploiement

| Composant | Plateforme | Commande / réglage |
|---|---|---|
| Frontend | Vercel | `npm run build` → dossier `dist`, variable `VITE_API_BASE_URL` |
| Backend | Render | service Node, `node server/server.js`, disque persistant monté sur `server/db` et `server/uploads` |
| Base | Fichiers JSON sur le disque persistant Render | sauvegarde régulière de `server/db` |

## Checklist de mise en production
1. `npm run build` sans erreur, `npx vitest run` au vert.
2. `CORS_ORIGINS` du serveur contient le domaine du front (aperçu et production).
3. `JWT_SECRET` et clés de chiffrement définis côté serveur uniquement.
4. `public/robots.txt` et `public/sitemap.xml` à jour ; pages partagées en `noindex`.
5. Métadonnées `index.html` (title, description, Open Graph) conformes.
6. Vérifier le flux SSE `/api/sync/events` après déploiement.

