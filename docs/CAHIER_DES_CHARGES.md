
# CAHIER DES CHARGES - SYSTÈME DE GESTION COMMERCIALE

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Contexte
Application web de gestion commerciale permettant de gérer les produits, ventes, prêts et dépenses d'une entreprise.

### 1.2 Objectifs principaux
- Gérer l'inventaire des produits
- Enregistrer et suivre les ventes
- Calculer automatiquement les bénéfices
- Gérer les prêts familiaux et produits
- Suivre les dépenses mensuelles
- Analyser les tendances commerciales

## 2. PÉRIMÈTRE FONCTIONNEL

### 2.1 Gestion des utilisateurs
- **Inscription/Connexion**
  - Création de compte avec validation email
  - Authentification par email/mot de passe
  - Réinitialisation de mot de passe
  - Déconnexion automatique après inactivité (10 min)

### 2.2 Gestion des produits
- **CRUD Produits**
  - Ajout de produits (description, prix d'achat, quantité)
  - Modification des informations produit
  - Suppression de produits
  - Upload d'images produits
  - Recherche de produits

### 2.3 Gestion des ventes
- **Enregistrement des ventes**
  - Sélection de produit
  - Saisie du prix de vente
  - Calcul automatique du bénéfice
  - Gestion des quantités vendues
  - Support des produits "avance" (quantité = 0)

- **Suivi des ventes**
  - Affichage par mois/année
  - Export mensuel
  - Statistiques de vente

### 2.4 Calcul de bénéfices
- **Paramètres configurables**
  - Prix d'achat
  - Taxe douanière
  - TVA (défaut: 20%)
  - Autres frais
  - Marge désirée

- **Calculs automatiques**
  - Coût total
  - Prix de vente recommandé
  - Bénéfice net
  - Taux de marge

### 2.5 Gestion des prêts
- **Prêts familiaux**
  - Enregistrement des prêts
  - Suivi des remboursements
  - Calcul des soldes restants

- **Prêts produits**
  - Produits vendus avec avance
  - Suivi des paiements restants
  - Statut payé/non payé

### 2.6 Gestion des dépenses
- **Dépenses mensuelles**
  - Enregistrement débit/crédit
  - Catégorisation des dépenses
  - Calcul automatique du solde

- **Dépenses fixes**
  - Configuration des charges fixes
  - Calcul automatique du total

### 2.7 Analyse et tendances
- **Graphiques et statistiques**
  - Évolution des ventes
  - Répartition des bénéfices
  - Tendances mensuelles
  - Comparaisons périodiques

## 3. EXIGENCES TECHNIQUES

### 3.1 Performance
- Temps de réponse < 2 secondes
- Interface réactive
- Synchronisation temps réel

### 3.2 Sécurité
- Authentification obligatoire
- Hashage des mots de passe
- Tokens JWT sécurisés
- Validation des données

### 3.3 Compatibilité
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile/desktop)
- Support TypeScript

### 3.4 Maintenabilité
- Code documenté
- Architecture modulaire
- Tests unitaires possibles
- Gestion d'erreurs robuste

## 4. CONTRAINTES

### 4.1 Techniques
- React avec TypeScript obligatoire
- Base de données JSON (développement)
- Pas de framework backend lourd

### 4.2 Fonctionnelles
- Interface utilisateur intuitive
- Sauvegarde automatique
- Validation des données stricte

## 5. LIVRABLES

### 5.1 Code source
- Application React complète
- API REST Node.js/Express
- Documentation technique
- Tests unitaires

### 5.2 Documentation
- Guide d'installation
- Manuel utilisateur
- Documentation API
- Architecture technique

## 6. CRITÈRES D'ACCEPTATION

### 6.1 Fonctionnels
- ✅ Authentification complète
- ✅ CRUD produits fonctionnel
- ✅ Enregistrement ventes
- ✅ Calculs automatiques
- ✅ Gestion prêts
- ✅ Suivi dépenses
- ✅ Synchronisation temps réel

### 6.2 Techniques
- ✅ Interface responsive
- ✅ Performance acceptable
- ✅ Sécurité implémentée
- ✅ Code documenté
- ✅ Architecture respectée

## 7. PLANNING DE DÉVELOPPEMENT

### Phase 1: Base (Terminée)
- Authentification
- CRUD Produits
- Interface de base

### Phase 2: Fonctionnalités métier (Terminée)
- Gestion des ventes
- Calculs de bénéfices
- Prêts et dépenses

### Phase 3: Optimisation (Terminée)
- Synchronisation temps réel
- Interface utilisateur avancée
- Analyses et tendances

### Phase 4: Finalisation (En cours)
- Documentation complète
- Tests et corrections
- Optimisations finales
