# 📘 Cahier des charges

## 1. Objet

VentePro couvre l'intégralité du cycle commercial d'une activité de vente de produits capillaires : catalogue et stock, clients et fidélité, ventes, commandes et réservations, rendez-vous, pointage du personnel, comptabilité, prêts, partage collaboratif et administration.

## 2. Exigences transverses

| # | Exigence |
|---|---|
| T1 | Interface professionnelle, luxe, entièrement responsive (mobile, tablette, desktop) |
| T2 | CSS critique inline pour éviter tout FOUC au chargement |
| T3 | Synchronisation temps réel par SSE (aucun polling périodique) |
| T4 | Toute donnée persistée dans `server/db/*.json` via un modèle dédié |
| T5 | Authentification JWT obligatoire sur les routes métier |
| T6 | Accessibilité : contrastes, focus visibles, navigation clavier, lecteurs d'écran |
| T7 | Chargement paresseux des pages et découpage en composants courts |
| T8 | Aucune couleur codée en dur : tokens du design system uniquement |

## 3. Exigences fonctionnelles par module

### 3.1 Authentification & accès

- **Pages concernées** : LoginPage, RegisterPage, ResetPasswordPage, SecurityCheckPage
- **Dossiers de composants** : src/components/auth, src/components/security

**Besoins :**

- Inscription avec validation forte du mot de passe
- Connexion JWT (8 h) et déconnexion automatique après inactivité
- Réinitialisation du mot de passe
- Captcha maison drag-and-drop à la première visite du navigateur, mémorisé ensuite
- Historique des connexions consultable dans le profil

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `authApiService` | `server/routes/auth.js` | `server/models/User.js` | `server/db/users.json` |
| `profileApiService` | `server/routes/profile.js` | `server/models/User.js` | `server/db/users.json` |

### 3.2 Tableau de bord & ventes

- **Pages concernées** : DashboardPage, VentesEmbedded, Ventes
- **Dossiers de composants** : src/components/dashboard, src/components/dashboard/forms, src/components/dashboard/sections

**Besoins :**

- Vue synthétique : chiffre d'affaires, bénéfices, stock, objectifs
- Création de vente multi-produits avec calcul automatique des totaux
- Reprise d'un acompte client existant lors d'une vente
- Modification et suppression d'une vente avec réajustement du stock
- Export des ventes (PDF, Excel), génération de facture
- Remboursements et échanges de ventes

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `saleApiService` | `server/routes/sales.js` | `server/models/Sale.js` | `server/db/sales.json` |
| `productApiService` | `server/routes/products.js` | `server/models/Product.js` | `server/db/products.json` |
| `clientApiService` | `server/routes/clients.js` | `server/models/Client.js` | `server/db/clients.json` |
| `beneficeApiService` | `server/routes/benefices.js` | `server/models/Benefice.js` | `server/db/benefice.json` |
| `pretProduitApiService` | `server/routes/pretproduits.js` | `server/models/PretProduit.js` | `server/db/pretproduits.json` |

### 3.3 Produits & stock

- **Pages concernées** : ProduitsPage
- **Dossiers de composants** : src/components/products, src/components/products/modals, src/components/products/attributes

**Besoins :**

- Classification produit : catégorie, modèle, couleur, pouces, autres attributs
- Gestion CRUD des attributs et génération automatique du nom du produit
- Filtrage multi-critères, recherche, pagination
- Historique de prix, historique achats/ventes, fusion de produits
- Commentaires clients notés de 1 à 5 étoiles défilant au-dessus de la description
- Suivi du stock disponible / indisponible et alertes de rupture

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `productApiService` | `server/routes/products.js` | `server/models/Product.js` | `server/db/products.json` |
| `prixProductsApiService` | `server/routes/prixproducts.js` | `server/models/Product.js` | `server/db/prixproducts.json` |
| `productCommentsApiService` | `server/routes/productComments.js` | `server/models/ProductComment.js` | `server/db/productComments.json` |
| `attributKindsApiService` | `server/routes/attributKinds.js` | `server/models/ProductAttribute.js` | `server/db/attribut_kinds.json` |
| `nouvelleAchatApiService` | `server/routes/nouvelleAchat.js` | `server/models/NouvelleAchat.js` | `server/db/nouvelle_achat.json` |

### 3.4 Clients & fidélité

- **Pages concernées** : ClientsPage
- **Dossiers de composants** : src/components/clients

**Besoins :**

- Fiche client multi-téléphones et multi-adresses avec villes
- Photo de profil circulaire, zoom, avatar par défaut
- Badge de fidélité : Nouveau, Simple, Bon, Fidèle, VIP calculé sur sales.json
- Modale de détail : historique d'achats, total dépensé, produits préférés
- Actions téléphone (appel/SMS) et adresse (Google Maps, Waze, Apple Plans)
- Détection de doublons et fusion de clients
- Pagination identique à celle des produits, remontée en haut de grille au changement de page

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `clientApiService` | `server/routes/clients.js` | `server/models/Client.js` | `server/db/clients.json` |
| `fideliteApiService` | `server/routes/fidelite.js` | `server/models/Fidelite.js` | `server/db/fidelite.json` |
| `listesFideliteApiService` | `server/routes/listesFidelite.js` | `server/models/ListesFidelite.js` | `server/db/listes-fidelite.json` |
| `clientsVillesApi` | `server/routes/clientsVilles.js` | `server/models/—` | `server/db/clients-villes.json` |
| `saleApiService` | `server/routes/sales.js` | `server/models/Sale.js` | `server/db/sales.json` |

### 3.5 Commandes & réservations

- **Pages concernées** : CommandesPage
- **Dossiers de composants** : src/components/commandes, src/components/commandes/form

**Besoins :**

- Création de commande avec produits filtrés sur la disponibilité réelle
- Prix unitaire pré-rempli, quantité bornée par le stock disponible + indisponible
- Réservation ultérieure, report, transition de statut, alertes de retard
- Préparation de livraison et création de rendez-vous liés

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `commandeApiService` | `server/routes/commandes.js` | `server/models/Commande.js` | `server/db/commandes.json` |
| `productApiService` | `server/routes/products.js` | `server/models/Product.js` | `server/db/products.json` |
| `clientApiService` | `server/routes/clients.js` | `server/models/Client.js` | `server/db/clients.json` |
| `rdvApiService` | `server/routes/rdv.js` | `server/models/Rdv.js` | `server/db/rdv.json` |
| `prepaLivraisonApiService` | `server/routes/prepaLivraison.js` | `server/models/—` | `server/db/prepa-livraison.json` |

### 3.6 Rendez-vous

- **Pages concernées** : RdvPage
- **Dossiers de composants** : src/components/rdv, src/components/rdvtache

**Besoins :**

- Calendrier et liste des rendez-vous, statistiques par statut
- Confirmation à moins de 24 h → statut « Confirmé »
- Statut « Confirmé » cliquable → passage à « Terminé » après validation
- Après clôture, proposition de créer la vente pré-remplie avec les données client et la date du rendez-vous
- Notifications du jour et rappels globaux

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `rdvApiService` | `server/routes/rdv.js` | `server/models/Rdv.js` | `server/db/rdv.json` |
| `rdvNotificationsApiService` | `server/routes/rdvNotifications.js` | `server/models/RdvNotification.js` | `server/db/rdvNotifications.json` |
| `availabilityApiService` | `server/routes/availability.js` | `server/models/—` | `server/db/indisponible.json` |
| `confirmationRdvApiService` | `server/routes/confirmationRdv.js` | `server/models/—` | `server/db/confirmation-rdv.json` |

### 3.7 Pointage & paie

- **Pages concernées** : PointagePage
- **Dossiers de composants** : src/components/pointage, src/components/pointage/modals

**Besoins :**

- Pointage par entreprise et par travailleur, calendrier mensuel
- Pointage automatique déclenché et sessions associées
- Avances : sélection granulaire par semaine, mois ou année
- Règle de semaine glissante : les jours de fin de mois précédent rattachés à la semaine du 1er comptent dans le mois courant
- Traçabilité des pointages consommés par une avance (pointageIds)
- Totaux par personne, par mois et par année, corbeille des pointages supprimés

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `pointageApiService` | `server/routes/pointage.js` | `server/models/Pointage.js` | `server/db/pointage.json` |
| `travailleurApiService` | `server/routes/travailleur.js` | `server/models/Travailleur.js` | `server/db/travailleur.json` |
| `entrepriseApiService` | `server/routes/entreprise.js` | `server/models/Entreprise.js` | `server/db/entreprise.json` |
| `avanceApiService` | `server/routes/avance.js` | `server/models/Avance.js` | `server/db/avance.json` |
| `pointageAutoApiService` | `server/routes/pointageAuto.js` | `server/models/Pointage.js` | `server/db/pointageauto.json` |

### 3.8 Tâches

- **Pages concernées** : TacheView (onglet Pointage / Dashboard)
- **Dossiers de composants** : src/components/tache

**Besoins :**

- Calendrier des tâches, vue jour et semaine
- Création, validation, notification et bandeau défilant des tâches
- Catalogue de tâches paramétrable

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `tacheApiService` | `server/routes/tache.js` | `server/models/Tache.js` | `server/db/tache.json` |
| `parametresApiService` | `server/routes/parametres.js` | `server/models/—` | `server/db/parametretache.json` |
| `rdvTachesApiService` | `server/routes/rdvTaches.js` | `server/models/Tache.js` | `server/db/rdv-taches.json` |

### 3.9 Notes (Kanban)

- **Pages concernées** : NotesKanbanView, SharedNotesPage
- **Dossiers de composants** : src/components/notes

**Besoins :**

- Colonnes personnalisables, cartes déplaçables
- Dessin libre sur une note (canvas)
- Partage intégral ou sélectif par colonne entière

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `noteApiService` | `server/routes/notes.js` | `server/models/Note.js` | `server/db/notes.json / noteColumns.json` |
| `noteShareApiService` | `server/routes/notesShare.js` | `server/models/Note.js` | `server/db/shareTokens.json` |

### 3.10 Comptabilité & finances

- **Pages concernées** : Comptabilite, Depenses, onglets du Dashboard
- **Dossiers de composants** : src/components/dashboard/comptabilite, src/components/dashboard/accounting, src/components/dashboard/reports

**Besoins :**

- Saisie des achats et dépenses avec pièce justificative (PDF/JPEG/JPG/PNG)
- Modale Facturation : type → année → produit → mois, visualisation et téléchargement
- Statistiques cliquables ouvrant le détail (achats, autres dépenses, solde net, bénéfices)
- Graphiques d'évolution mensuelle et de répartition
- Export PDF et Excel, compte de résultat

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `comptaApiService` | `server/routes/compta.js` | `server/models/Compta.js` | `server/db/compta.json` |
| `depenseApiService` | `server/routes/depenses.js` | `server/models/DepenseDuMois.js` | `server/db/depensedumois.json / depensefixe.json` |
| `beneficeApiService` | `server/routes/benefices.js` | `server/models/Benefice.js` | `server/db/benefice.json` |
| `nouvelleAchatApiService` | `server/routes/nouvelleAchat.js` | `server/models/NouvelleAchat.js` | `server/db/nouvelle_achat.json` |
| `remboursementApiService` | `server/routes/remboursements.js` | `server/models/Remboursement.js` | `server/db/remboursement.json` |
| `fournisseurApiService` | `server/routes/fournisseurs.js` | `server/models/Fournisseur.js` | `server/db/fournisseurs.json` |

### 3.11 Prêts

- **Pages concernées** : PretFamilles, PretProduits
- **Dossiers de composants** : src/components/dashboard/prets

**Besoins :**

- Prêts famille et prêts produits avec paiements partiels
- Regroupement par client, notifications de retard
- Consommation d'un acompte lors d'une vente

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `pretFamilleApiService` | `server/routes/pretfamilles.js` | `server/models/PretFamille.js` | `server/db/pretfamilles.json` |
| `pretProduitApiService` | `server/routes/pretproduits.js` | `server/models/PretProduit.js` | `server/db/pretproduits.json` |

### 3.12 Profil, paramètres & sécurité

- **Pages concernées** : ProfilePage
- **Dossiers de composants** : src/components/profile

**Besoins :**

- Informations personnelles, avatar, changement de mot de passe
- Historique de connexion synchronisé en temps réel avec filtres jour/semaine/mois/année
- Activation/désactivation des modules, mode maintenance
- Indisponibilités et pointage automatique
- Suppression définitive d'utilisateurs par les administrateurs principaux

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `profileApiService` | `server/routes/profile.js` | `server/models/User.js` | `server/db/users.json` |
| `settingsApiService` | `server/routes/settings.js` | `server/models/—` | `server/db/settings.json` |
| `moduleSettingsApiService` | `server/routes/moduleSettings.js` | `server/models/—` | `server/db/moduleSettings.json` |
| `indisponibleApiService` | `server/routes/indisponible.js` | `server/models/—` | `server/db/indisponible.json` |
| `historiqueConnexionApiService` | `server/routes/historiqueConnexion.js` | `server/models/—` | `server/db/historique-connexion.json` |

### 3.13 Partage public & commentaires

- **Pages concernées** : SharedViewPage, SharedNotesPage
- **Dossiers de composants** : src/components/shared

**Besoins :**

- Génération de liens de partage (pointage, tâches, notes) intégraux ou sélectifs
- Bouton « Ajouter un commentaire » côté visiteur avec ciblage d'un élément
- Verrouillage du formulaire après envoi, badges administrateur, export PDF des justificatifs
- Pages partagées en noindex

**Chaîne technique :**

| Service front | Route serveur | Modèle | Base |
|---|---|---|---|
| `shareLinksApiService` | `server/routes/shareLinks.js` | `server/models/—` | `server/db/shareTokens.json / lienIp.json` |
| `shareCommentsApiService` | `server/routes/shareComments.js` | `server/models/—` | `server/db/lienpartagecommente.json / comment-share.json` |
| `noteShareApiService` | `server/routes/notesShare.js` | `server/models/Note.js` | `server/db/shareTokens.json` |

### 3.14 Messagerie & live chat

- **Pages concernées** : MessagesPage
- **Dossiers de composants** : src/components/livechat

**Besoins :**

- Messagerie interne et chat visiteur
- Appel WebRTC avec overlay et bandeau de notification

**Chaîne technique :**

_Aucun accès serveur direct (composant de présentation)._

### 3.15 Site vitrine

- **Pages concernées** : HomePage, AboutPage, ContactPage
- **Dossiers de composants** : src/components (Navbar, Footer, Layout, SEOHead)

**Besoins :**

- Présentation de l'activité, formulaire de contact
- SEO dynamique via SEOHead, sitemap et robots.txt

**Chaîne technique :**

_Aucun accès serveur direct (composant de présentation)._


## 4. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| Performance | Premier rendu < 2 s, table paginée au-delà de 20 éléments, mémoïsation des calculs lourds |
| Sécurité | JWT 8 h, bcrypt 10 rounds, CORS whitelist, rate limiting 100 req/min/IP, en-têtes CSP |
| Fiabilité | Retry automatique des requêtes réseau, ErrorBoundary global, mode maintenance |
| Exploitation | Sauvegarde automatique de la base, journal des connexions, corbeille pointages |
| Évolutivité | Un module = une page + un dossier de composants + un service API + une route + un modèle + un fichier JSON |

## 5. Livrables

Application front déployée sur Vercel, API Express déployée sur Render, base JSON persistée côté serveur, documentation complète du dossier `docs/`.

