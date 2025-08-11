
# GUIDE UTILISATEUR - SYSTÈME DE GESTION COMMERCIALE

## Table des matières
1. [Premiers pas](#premiers-pas)
2. [Tableau de bord](#tableau-de-bord)
3. [Gestion des produits](#gestion-des-produits)
4. [Enregistrement des ventes](#enregistrement-des-ventes)
5. [Gestion des clients](#gestion-des-clients)
6. [Calculateur de bénéfices](#calculateur-de-bénéfices)
7. [Gestion des prêts](#gestion-des-prêts)
8. [Suivi des dépenses](#suivi-des-dépenses)
9. [Analyses et tendances](#analyses-et-tendances)
10. [Paramètres et configuration](#paramètres-et-configuration)

## Premiers pas

### Connexion à l'application

1. **Accès à l'application**
   - Ouvrez votre navigateur web
   - Rendez-vous à l'adresse : `http://localhost:5173`
   - Vous arrivez sur la page de connexion

2. **Création d'un compte (première utilisation)**
   - Cliquez sur "S'inscrire"
   - Remplissez le formulaire avec vos informations :
     - Email (obligatoire)
     - Mot de passe sécurisé (obligatoire)
     - Prénom et nom (obligatoire)
     - Genre, adresse, téléphone
   - Acceptez les conditions d'utilisation
   - Cliquez sur "Créer mon compte"

3. **Connexion avec un compte existant**
   - Saisissez votre email
   - Saisissez votre mot de passe
   - Cliquez sur "Se connecter"

4. **Mot de passe oublié**
   - Cliquez sur "Mot de passe oublié ?"
   - Saisissez votre email
   - Suivez les instructions reçues par email

### Interface principale

Une fois connecté, vous accédez au tableau de bord principal avec :
- **Menu de navigation** à gauche
- **Zone de contenu** au centre
- **Indicateur de connexion** en haut à droite
- **Notifications** en temps réel

⚠️ **Déconnexion automatique** : L'application vous déconnecte automatiquement après 10 minutes d'inactivité pour votre sécurité.

## Tableau de bord

### Vue d'ensemble

Le tableau de bord vous donne une vue complète de votre activité :

1. **Statistiques rapides**
   - Nombre total de produits
   - Ventes du mois
   - Bénéfices générés
   - Clients enregistrés

2. **Graphiques de performance**
   - Évolution des ventes
   - Répartition des bénéfices
   - Tendances mensuelles

3. **Actions rapides**
   - Ajouter un produit
   - Enregistrer une vente
   - Consulter les clients
   - Calculer un bénéfice

### Navigation

- **Tableau de bord** : Vue d'ensemble
- **Produits** : Gestion de l'inventaire
- **Ventes** : Historique et enregistrement
- **Clients** : Base de données clients
- **Prêts** : Familiaux et produits
- **Dépenses** : Suivi financier
- **Tendances** : Analyses et graphiques

## Gestion des produits

### Ajouter un nouveau produit

1. **Accès à la section produits**
   - Cliquez sur "Inventaire" dans le tableau de bord
   - Ou utilisez le menu "Produits"

2. **Création d'un produit**
   - Cliquez sur le bouton "➕ Ajouter Produit"
   - Remplissez le formulaire :
     - **Description** : Nom détaillé du produit (ex: "Perruque Lisse 20 pouces")
     - **Prix d'achat** : Coût d'acquisition en euros
     - **Quantité** : Stock disponible
   - Cliquez sur "Ajouter"

3. **Ajout d'une image (optionnel)**
   - Après création, cliquez sur l'icône image du produit
   - Glissez-déposez une image ou cliquez pour sélectionner
   - Formats acceptés : JPG, PNG, GIF (max 5MB)

### Modifier un produit

1. **Localiser le produit**
   - Utilisez la barre de recherche si nécessaire
   - Trouvez le produit dans la liste

2. **Édition**
   - Cliquez sur l'icône "✏️" dans la ligne du produit
   - Modifiez les informations nécessaires
   - Cliquez sur "Sauvegarder"

### Supprimer un produit

1. **Sélection**
   - Cliquez sur l'icône "🗑️" dans la ligne du produit

2. **Confirmation**
   - Confirmez la suppression dans la boîte de dialogue
   - ⚠️ Cette action est irréversible

### Recherche et filtres

- **Barre de recherche** : Tapez le nom du produit
- **Tri** : Cliquez sur les en-têtes de colonnes
- **Filtres** : Par stock, prix, etc.

## Enregistrement des ventes

### Enregistrer une nouvelle vente

1. **Accès au formulaire**
   - Section "Ventes Produits" du tableau de bord
   - Ou menu "Ventes" → "Nouvelle vente"

2. **Remplir le formulaire de vente**
   - **Date** : Date de la vente (aujourd'hui par défaut)
   - **Produit** : Sélectionnez dans la liste déroulante
   - **Prix de vente** : Prix final payé par le client
   - **Quantité vendue** : Nombre d'unités vendues

3. **Informations client (optionnel mais recommandé)**
   - **Prénom** et **Nom** du client
   - **Téléphone** : Numéro de contact
   - **Adresse** : Adresse de livraison ou résidence

4. **Validation**
   - Vérifiez les informations
   - Le **bénéfice** se calcule automatiquement
   - Cliquez sur "Enregistrer la vente"

### Gestion automatique

- **Stock** : Se met à jour automatiquement après la vente
- **Bénéfice** : Calculé automatiquement (Prix vente - Prix achat) × Quantité
- **Client** : Ajouté automatiquement à la base de données clients

### Produits "avance"

Pour les ventes sans stock disponible :
- Sélectionnez un produit avec quantité = 0
- Le système permet la vente en mode "avance"
- Gérez ensuite dans la section "Prêts Produits"

## Gestion des clients

### Base de données clients

La page clients centralise tous vos contacts :

1. **Accès**
   - Menu "Clients" ou lien depuis le tableau de bord

2. **Informations affichées**
   - Nom complet (Prénom + Nom)
   - Numéro de téléphone
   - Adresse
   - Date de création du contact

### Ajouter un client manuellement

1. **Formulaire d'ajout**
   - Cliquez sur "➕ Nouveau Client"
   - Remplissez les informations :
     - Prénom (obligatoire)
     - Nom (obligatoire)
     - Téléphone
     - Adresse
   - Cliquez sur "Ajouter"

### Modifier un client

1. **Sélection**
   - Trouvez le client dans la liste
   - Cliquez sur "✏️ Modifier"

2. **Édition**
   - Modifiez les informations
   - Cliquez sur "Sauvegarder"

### Synchronisation temps réel

- Les clients ajoutés via les ventes apparaissent automatiquement
- Les modifications se synchronisent en temps réel
- Pas besoin d'actualiser la page

## Calculateur de bénéfices

### Utilisation du calculateur

1. **Accès**
   - Section "Calculateur Profit" du tableau de bord
   - Ou menu "Outils" → "Calculateur"

2. **Paramètres de calcul**
   - **Prix d'achat** : Coût initial du produit
   - **Taxe douanière** : Pourcentage ou montant fixe
   - **TVA** : Pourcentage (défaut: 20%)
   - **Autres frais** : Frais de transport, emballage, etc.
   - **Marge désirée** : Pourcentage de bénéfice souhaité

3. **Résultats automatiques**
   - **Coût total** : Prix d'achat + taxes + frais
   - **Prix recommandé** : Prix de vente suggéré
   - **Bénéfice net** : Profit réalisé
   - **Taux de marge** : Pourcentage de marge réelle

### Sauvegarde des calculs

1. **Enregistrement**
   - Après calcul, cliquez sur "Sauvegarder le calcul"
   - Ajoutez une description si nécessaire

2. **Historique**
   - Consultez vos calculs précédents
   - Réutilisez des paramètres existants

## Gestion des prêts

### Prêts familiaux

1. **Enregistrer un prêt**
   - Section "Prêts Familles" du tableau de bord
   - Cliquez sur "➕ Nouveau Prêt"
   - Remplissez :
     - Nom de la famille
     - Montant prêté
     - Date du prêt
     - Raison (optionnel)

2. **Suivi des remboursements**
   - Cliquez sur un prêt existant
   - Ajoutez les remboursements partiels
   - Le solde se calcule automatiquement

### Prêts produits (Avances)

1. **Création automatique**
   - Se crée automatiquement lors de ventes "avance"
   - Ou ajoutez manuellement via "➕ Nouveau Prêt Produit"

2. **Informations trackées**
   - Client concerné
   - Produit vendu
   - Montant total
   - Avance reçue
   - Montant restant

3. **Gestion des paiements**
   - Marquez comme "Payé" quand soldé
   - Ajoutez des paiements partiels
   - Historique complet des transactions

## Suivi des dépenses

### Dépenses mensuelles

1. **Ajouter une dépense**
   - Section "Dépense du Mois"
   - Choisissez le type :
     - **Débit** : Sortie d'argent (dépense)
     - **Crédit** : Entrée d'argent (recette)

2. **Catégories disponibles**
   - **Salaire** : Revenus fixes
   - **Courses** : Achats alimentaires
   - **Restaurant** : Repas extérieurs
   - **Transport** : Frais de déplacement
   - **Santé** : Frais médicaux
   - **Divers** : Autres dépenses

3. **Saisie des informations**
   - Montant (en euros)
   - Catégorie
   - Description
   - Date (aujourd'hui par défaut)

### Dépenses fixes

1. **Configuration**
   - Paramétrez vos charges récurrentes :
     - Abonnement téléphone
     - Assurance voiture
     - Assurance vie
     - Autres abonnements

2. **Calcul automatique**
   - Total des charges fixes calculé automatiquement
   - Pris en compte dans le solde mensuel

### Réinitialisation mensuelle

- **Automatique** : Le système détecte la fin du mois
- **Manuelle** : Bouton "Réinitialiser le mois"
- Les dépenses fixes sont conservées
- Nouveau décompte pour le mois suivant

## Analyses et tendances

### Graphiques disponibles

1. **Évolution des ventes**
   - Courbe des ventes mensuelles
   - Comparaison année précédente
   - Tendance générale

2. **Répartition des bénéfices**
   - Camembert par catégorie de produits
   - Top des produits les plus rentables

3. **Performance mensuelle**
   - Barres de comparaison mois par mois
   - Objectifs vs réalisé

### Filtres et périodes

1. **Sélection de période**
   - Mois en cours
   - Trimestre
   - Année complète
   - Période personnalisée

2. **Types d'analyse**
   - Chiffre d'affaires
   - Bénéfices nets
   - Volume des ventes
   - Performance par produit

### Export des données

1. **Formats disponibles**
   - PDF pour les rapports
   - Excel pour les données brutes
   - Images pour les graphiques

2. **Données exportables**
   - Ventes du mois
   - Historique complet
   - Rapports personnalisés

## Paramètres et configuration

### Paramètres du compte

1. **Informations personnelles**
   - Modifier nom, prénom
   - Changer adresse email
   - Mettre à jour téléphone/adresse

2. **Sécurité**
   - Changer mot de passe
   - Déconnexion de tous les appareils
   - Historique des connexions

### Paramètres de l'application

1. **Préférences d'affichage**
   - Thème (clair/sombre)
   - Langue de l'interface
   - Format des dates

2. **Notifications**
   - Alertes de stock faible
   - Rappels de paiements prêts
   - Notifications de synchronisation

### Sauvegarde et restauration

1. **Sauvegarde automatique**
   - Données sauvegardées en temps réel
   - Historique des modifications

2. **Export complet**
   - Téléchargement de toutes les données
   - Format JSON pour réimport

## Conseils d'utilisation

### Bonnes pratiques

1. **Saisie des ventes**
   - Enregistrez les ventes rapidement après transaction
   - Remplissez toujours les informations client
   - Vérifiez les prix de vente

2. **Gestion des stocks**
   - Mettez à jour les quantités régulièrement
   - Surveillez les alertes de stock faible
   - Planifiez les réapprovisionnements

3. **Suivi financier**
   - Enregistrez toutes les dépenses
   - Vérifiez les calculs de bénéfices
   - Analysez les tendances mensuellement

### Résolution de problèmes

1. **Problèmes de connexion**
   - Vérifiez votre connexion internet
   - Actualisez la page si nécessaire
   - Reconnectez-vous si déconnecté

2. **Données non synchronisées**
   - L'indicateur de connexion indique le statut
   - Les données se synchronisent automatiquement
   - Contactez le support si problème persistant

3. **Erreurs de saisie**
   - Utilisez les boutons "Modifier" pour corriger
   - Supprimez et recréez si nécessaire
   - Sauvegardez régulièrement

### Support et assistance

- **Documentation** : Consultez ce guide
- **Aide contextuelle** : Bulles d'aide dans l'interface
- **Support technique** : Contact via l'application

Ce guide complet vous accompagne dans l'utilisation optimale de votre système de gestion commerciale.
