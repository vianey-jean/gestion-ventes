# GUIDE DE DÉPLOIEMENT ET MAINTENANCE

## Système de Gestion Commerciale

**Version**: 2.0.0  
**Dernière mise à jour**: 24 décembre 2025

---

## 📋 Table des Matières

1. [Environnements](#environnements)
2. [Variables d'Environnement](#variables-denvironnement)
3. [Déploiement Frontend](#déploiement-frontend)
4. [Déploiement Backend](#déploiement-backend)
5. [Configuration Nginx](#configuration-nginx)
6. [Docker](#docker)
7. [Monitoring et Logs](#monitoring-et-logs)
8. [Maintenance](#maintenance)
9. [Notifications](#notifications---déploiement)
10. [Rendez-vous](#rendez-vous---déploiement)
11. [Objectifs](#objectifs---déploiement)

---

## Environnements

### Développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Backend
cd server && npm start

# Tests
npm test
npm run test:coverage
```

### Production

```bash
# Build optimisé
npm run build

# Preview du build
npm run preview

# Vérification du build
npm run check
```

---

## Variables d'Environnement

### Frontend (.env)

```env
VITE_API_BASE_URL=https://api.votre-domaine.com
```

### Backend (server/.env)

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=votre-secret-super-securise-minimum-32-caracteres
FRONTEND_URL=https://votre-domaine.com
```

### Génération du JWT Secret

```bash
# Génération sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Déploiement Frontend

### Netlify

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Vercel

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Déploiement Backend

### Heroku

```json
{
  "name": "gestion-commerciale-api",
  "description": "API pour système de gestion commerciale",
  "image": "heroku/nodejs",
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": { "required": true }
  }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gestion-commerciale-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 10000
    },
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    time: true
  }]
};
```

```bash
# Démarrage PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### AWS EC2

```bash
#!/bin/bash
# deploy.sh

# Mise à jour système
sudo yum update -y

# Installation Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Installation PM2
sudo npm install -g pm2

# Clonage et installation
git clone https://github.com/votre-repo/gestion-commerciale.git
cd gestion-commerciale
npm install

# Build et démarrage
npm run build
pm2 start ecosystem.config.js --env production
```

---

## Configuration Nginx

### Reverse Proxy

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SSE pour synchronisation temps réel
    location /api/sync/events {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Cache-Control 'no-cache';
        proxy_set_header X-Accel-Buffering 'no';
        proxy_read_timeout 24h;
    }
}
```

### SSL avec Let's Encrypt

```bash
# Installation certificat
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci --only=production

# Code source
COPY . .
RUN npm run build

EXPOSE 10000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "10000:10000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./server/db:/app/server/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

```bash
# Build et démarrage
docker-compose up -d --build

# Logs
docker-compose logs -f

# Redémarrage
docker-compose restart app
```

---

## Monitoring et Logs

### Configuration Winston

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: checkDatabaseConnection(),
    memory: process.memoryUsage()
  };
  
  res.status(healthCheck.database ? 200 : 503).json(healthCheck);
});
```

### Alertes

```javascript
// Alerte si mémoire critique
setInterval(() => {
  const used = process.memoryUsage();
  if (used.heapUsed / used.heapTotal > 0.9) {
    logger.warn('Memory usage critical', { usage: used });
    // Envoyer alerte email/Slack
  }
}, 60000);
```

---

## Maintenance

### Script de Déploiement

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Déploiement en production..."

# Backup
pm2 save
cp -r server/db server/db_backup_$(date +%Y%m%d)

# Pull et installation
git pull origin main
npm ci --only=production

# Build
npm run build

# Tests rapides
npm run test:prod

# Redémarrage
pm2 reload gestion-commerciale-api

# Vérification
sleep 10
curl -f http://localhost:10000/health || exit 1

echo "✅ Déploiement réussi!"
```

### Rollback

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rollback en cours..."

# Restauration version précédente
git checkout HEAD~1

# Restauration données
if [ -d "server/db_backup_latest" ]; then
    cp -r server/db_backup_latest/* server/db/
fi

# Redémarrage
pm2 restart gestion-commerciale-api

echo "✅ Rollback terminé!"
```

### Backup Automatique

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/gestion-commerciale"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup des données JSON
tar -czf "$BACKUP_DIR/db_$DATE.tar.gz" server/db/

# Nettoyage des backups > 30 jours
find "$BACKUP_DIR" -name "db_*.tar.gz" -mtime +30 -delete

echo "Backup créé: db_$DATE.tar.gz"
```

### Cron Jobs

```cron
# Backup quotidien à 2h
0 2 * * * /path/to/backup.sh

# Nettoyage logs hebdomadaire
0 3 * * 0 find /var/log/gestion-commerciale -name "*.log" -mtime +7 -delete

# Renouvellement SSL
0 12 * * * /usr/bin/certbot renew --quiet

# Health check toutes les 5 minutes
*/5 * * * * curl -s http://localhost:10000/health || systemctl restart gestion-commerciale
```

---

## Notifications - Déploiement

### Configuration SSE

Pour les notifications en temps réel, assurez-vous que :

1. **Nginx** est configuré pour les connexions SSE longues :
```nginx
location /api/sync/events {
    proxy_read_timeout 24h;
    proxy_set_header X-Accel-Buffering 'no';
}
```

2. **Base de données** `rdvNotifications.json` est accessible :
```json
{
  "notifications": [],
  "lastId": 0
}
```

3. **Service** de vérification des rappels :
```javascript
// Vérification toutes les heures
setInterval(async () => {
  const rdvs = await Rdv.getTomorrow();
  rdvs.forEach(rdv => {
    Notification.create({
      type: 'rdv_reminder',
      title: 'Rappel RDV demain',
      message: `${rdv.titre} à ${rdv.heure}`,
      priority: 'medium'
    });
  });
}, 3600000);
```

---

## Rendez-vous - Déploiement

### Fichiers Requis

```
server/db/
├── rdv.json
└── rdvNotifications.json
```

### Initialisation

```json
// rdv.json
{
  "rdvs": [],
  "lastId": 0
}
```

### Permissions

```bash
# Permissions fichiers
chmod 644 server/db/rdv.json
chmod 644 server/db/rdvNotifications.json

# Propriétaire
chown www-data:www-data server/db/*.json
```

---

## Objectifs - Déploiement

### Fichier de Données

```json
// server/db/objectif.json
{
  "objectif": 2000,
  "totalVentesMois": 0,
  "mois": 12,
  "annee": 2025,
  "historique": []
}
```

### Recalcul Initial

Après déploiement, recalculer les objectifs depuis les ventes :

```bash
curl -X POST http://localhost:10000/api/objectif/recalculate \
  -H "Authorization: Bearer $TOKEN"
```

### Vérification

```bash
# Vérifier que les objectifs sont corrects
curl http://localhost:10000/api/objectif \
  -H "Authorization: Bearer $TOKEN"
```

### Comportement Attendu

1. **Objectif par défaut** : 2000€
2. **Mois en cours** : Modifiable
3. **Mois passés** : Verrouillés (403 si tentative de modification)
4. **Nouveau mois** : Reset automatique à 2000€

---

## Base de Données - Migration PostgreSQL

### Script de Migration

```sql
-- init.sql
CREATE DATABASE gestion_commerciale;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    product_id UUID REFERENCES products(id),
    selling_price DECIMAL(10,2) NOT NULL,
    quantity_sold INTEGER NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rdv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    heure TIME,
    client_nom VARCHAR(200),
    description TEXT,
    statut VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE objectifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mois INTEGER NOT NULL,
    annee INTEGER NOT NULL,
    objectif DECIMAL(10,2) DEFAULT 2000,
    total_ventes_mois DECIMAL(10,2) DEFAULT 0,
    pourcentage INTEGER DEFAULT 0,
    UNIQUE(mois, annee)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

*Guide de Déploiement et Maintenance mis à jour le 24 décembre 2025*
