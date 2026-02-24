# Cahier des Charges - Application de Gestion Commerciale

## 1. Présentation du Projet

Application web de gestion commerciale complète permettant de gérer les ventes, produits, clients, remboursements, comptabilité, rendez-vous et messages pour une activité de vente de perruques et tissages.

## 2. Objectifs

- Centraliser la gestion des ventes (mono et multi-produits)
- Suivre les stocks en temps réel
- Gérer les remboursements avec traçabilité
- Analyser les tendances et performances
- Gérer la comptabilité (achats, dépenses, bénéfices)
- Planifier les rendez-vous clients
- Fournir un tableau de bord temps réel

## 3. Spécifications Fonctionnelles

### 3.1 Authentification
- Inscription / Connexion JWT
- Auto-déconnexion après inactivité
- Routes protégées

### 3.2 Gestion des Produits
- CRUD complet avec photos multiples
- Code produit auto-généré (P/T/E/X-XX-XXXXXX)
- Recherche par description et code
- Gestion du stock (quantité)
- Slideshow de photos

### 3.3 Gestion des Ventes
- Vente mono-produit (AddSaleForm)
- Vente multi-produits (MultiProductSaleForm)
- Recherche de produit par description/code
- Calcul automatique des prix et bénéfices
- Gestion des avances (produits spéciaux)
- Export PDF de factures
- Tableau des ventes temps réel (mois en cours)

### 3.4 Système de Remboursement
- **Accès** : Bouton "Remboursement" dans SalesManagementSection + Bouton "Rembourser" sur chaque vente
- **Recherche** : Par nom de client (min. 3 caractères) dans les ventes positives
- **Sélection** : Choix de la vente spécifique à rembourser
- **Modification** : 
  - Retrait de produits (minimum 1 obligatoire)
  - Modification de la quantité (max = quantité vendue)
  - Modification du prix de remboursement unitaire
- **Stock** :
  - Si prix remboursé = prix de vente original → confirmation modale "Remettre en stock ?"
  - Si prix remboursé < prix de vente → pas de remise en stock (remboursement partiel)
- **Enregistrement** :
  - Vente négative dans sales.json (isRefund: true, valeurs négatives)
  - Détails dans remboursement.json
- **Suppression de remboursement** :
  - Confirmation de suppression
  - Si stock avait été restauré → diminution du stock
  - Suppression de la vente négative et du remboursement

### 3.5 Gestion des Clients
- CRUD complet
- Fiche client détaillée
- Recherche et filtrage
- Historique d'achats dans Tendances

### 3.6 Commandes et Réservations
- CRUD complet avec statuts
- Synchronisation avec les RDV
- Notifications

### 3.7 Rendez-vous
- Calendrier interactif
- Notifications et rappels
- Liaison avec les commandes

### 3.8 Comptabilité
- Gestion des achats et dépenses
- Bilan mensuel automatique
- Export PDF comptable
- Graphiques d'évolution

### 3.9 Tendances et Analytics
- Graphiques par produit, catégorie, période
- **Analyse clients** : classement par CA, tri, détails avec historique et remboursements
- Recommandations d'achat par ROI
- Alertes stock critique

### 3.10 Prêts
- Prêts familles et prêts produits
- Suivi des avances et restes
- Impact sur les remboursements

### 3.11 Dashboard
- Stats cliquables avec modals de détails
- Navigation vers /produits depuis les stats stock
- Temps réel via SSE

## 4. Spécifications Techniques

### 4.1 Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Recharts (graphiques)
- Axios (HTTP)
- jsPDF (export PDF)

### 4.2 Backend
- Node.js + Express.js
- JWT (authentification)
- Multer (upload fichiers)
- SSE (temps réel)

### 4.3 Base de données
- Fichiers JSON exclusivement
- Aucune base de données externe

### 4.4 Sécurité
- JWT tokens
- Rate limiting
- CORS configuré
- Validation des entrées
- Headers de sécurité

## 5. Contraintes

- Stockage exclusif en fichiers JSON
- Application web responsive (mobile + desktop)
- Mode sombre/clair
- Accessibilité WCAG
