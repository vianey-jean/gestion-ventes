
# Guide Backend

## Architecture du serveur

### Structure des dossiers
```
server/
├── routes/                 # Routes de l'API
│   ├── auth.js
│   ├── products.js
│   ├── sales.js
│   └── clients.js
├── middleware/             # Middleware personnalisés
│   ├── auth.js
│   ├── validation.js
│   └── cors.js
├── services/               # Services métier
│   ├── authService.js
│   ├── dataService.js
│   └── realtimeService.js
├── data/                   # Fichiers de données JSON
│   ├── products.json
│   ├── sales.json
│   ├── users.json
│   └── clients.json
└── server.js               # Point d'entrée
```

## Configuration du serveur

### Point d'entrée (server.js)
```javascript
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sync', syncRoutes);
```

## Authentification JWT

### Génération de tokens
```javascript
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET || 'default-secret',
    { 
      expiresIn: '24h' 
    }
  );
};
```

### Middleware d'authentification
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};
```

## Routes API

### Routes d'authentification
```javascript
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérification utilisateur
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Génération du token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

### Routes des produits
```javascript
// GET /api/products
router.get('/', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// POST /api/products
router.post('/', authenticateToken, (req, res) => {
  try {
    const { description, purchasePrice, quantity } = req.body;
    
    // Validation
    if (!description || !purchasePrice || quantity === undefined) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const newProduct = {
      id: uuidv4(),
      description,
      purchasePrice: parseFloat(purchasePrice),
      quantity: parseInt(quantity),
      imageUrl: null,
      createdAt: new Date().toISOString(),
      userId: req.user.id
    };

    products.push(newProduct);
    saveProducts(products);
    
    // Notification temps réel
    notifyDataChange();
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});
```

## Gestion des données

### Service de données JSON
```javascript
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lecture ${filename}:`, error);
    return [];
  }
};

const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erreur écriture ${filename}:`, error);
    return false;
  }
};
```

## Synchronisation temps réel (SSE)

### Service de synchronisation
```javascript
class RealtimeService {
  constructor() {
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);
    
    // Configuration SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Message de connexion
    res.write('data: {"type": "connected", "message": "Connexion établie"}\n\n');
    
    // Nettoyage à la déconnexion
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  notifyDataChange(data = {}) {
    const message = JSON.stringify({
      type: 'data-changed',
      timestamp: new Date().toISOString(),
      data
    });

    this.clients.forEach(client => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (error) {
        // Client déconnecté
        this.clients.delete(client);
      }
    });
  }

  forceSync() {
    const message = JSON.stringify({
      type: 'force-sync',
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (error) {
        this.clients.delete(client);
      }
    });
  }
}
```

## Middleware de validation

### Validation des données
```javascript
const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('description')
    .notEmpty()
    .withMessage('Description requise')
    .isLength({ min: 3, max: 200 })
    .withMessage('Description entre 3 et 200 caractères'),
  
  body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('Prix d\'achat doit être un nombre positif'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantité doit être un entier positif'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }
    next();
  }
];
```

## Gestion des erreurs

### Middleware global d'erreurs
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré' });
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
};
```

## Sécurité

### Configuration CORS
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez dans 15 minutes'
});

app.use('/api/', limiter);
```

## Monitoring et logs

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
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
