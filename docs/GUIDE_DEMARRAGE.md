# 🚀 Guide de démarrage

## Prérequis
Node.js 18+, npm.

## Installation
```bash
npm install
cd server && npm install && cd ..
```

## Variables d'environnement
- Front (`.env`) : `VITE_API_BASE_URL` (URL de l'API).
- Serveur (`server/.env`) : `PORT`, `JWT_SECRET`, `CORS_ORIGINS`, clés de chiffrement.

## Lancement
```bash
npm run dev                 # front  http://localhost:8080
cd server && npm start      # API    http://localhost:5000
```

## Scripts utiles
`npm run build`, `npm run preview`, `npm run lint`, `npx vitest run`.

## Structure minimale à connaître
`src/pages` (écrans), `src/components` (UI), `src/services/api` (réseau), `server/routes` (API), `server/models` (données), `server/db` (JSON).

