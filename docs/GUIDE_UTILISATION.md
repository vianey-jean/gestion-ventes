# 📖 Guide d'utilisation

## 0. Accès
1. Vérification de sécurité : au premier accès sur un navigateur, résoudre le captcha (glisser l'étoile sur la cible). Le navigateur est ensuite mémorisé ; vider les données de navigation réaffiche le captcha.
2. Se connecter via **/login**. Après 8 h ou en cas d'inactivité prolongée, la session se ferme automatiquement.

## 1. Tableau de bord (/dashboard)
Barre latérale : Ventes, Produits, Clients, Commandes, Rendez-vous, Comptabilité, Prêts, Pointage, Tâches, Notes, Profil.
- **Ajouter une vente** : bouton « Nouvelle vente » → choisir le client (recherche), ajouter un ou plusieurs produits (quantité bornée par le stock), le total se calcule seul. Si le client possède un acompte, une modale propose de l'appliquer.
- **Modifier / supprimer une vente** : depuis le tableau des ventes, icônes crayon et corbeille (confirmation requise). Le stock est réajusté automatiquement.
- **Exporter** : « Exporter » (PDF/Excel) ou « Facture » pour un document client.

## 2. Produits (/produits)
- Barre d'outils masquable (l'état est mémorisé) pour gérer catégories, modèles, couleurs, pouces et autres attributs.
- « Ajouter un produit » : la classification remplit automatiquement le nom.
- Recherche, filtre par classification (multi-sélection), pagination (compteur à gauche, flèches simple/double à droite).
- Colonne **Notation** : moyenne des avis. Les commentaires défilent au-dessus de la description.
- Modale « Voir » : détail, photos, historique achats/ventes, historique de prix, commentaires avec étoiles et nom du client.

## 3. Clients (/clients)
- Fiche client : plusieurs numéros et adresses avec villes, photo circulaire (clic = zoom).
- Badge de fidélité (Nouveau → VIP) + icône « voir » : historique d'achats, total dépensé, produits préférés.
- Clic sur un téléphone : appeler ou envoyer un SMS. Clic sur une adresse : Google Maps, Waze ou Plans.
- Doublons détectés : fusion possible. Pagination en bas de grille, remontée automatique en haut au changement de page.

## 4. Commandes (/commandes)
Créer une commande : seuls les produits ayant du stock (disponible ou indisponible) apparaissent ; le prix unitaire se remplit seul et la quantité est plafonnée. Statuts, report, réservation ultérieure, préparation de livraison et création de rendez-vous liés.

## 5. Rendez-vous (/rdv)
Vue calendrier ou liste, statistiques par statut. À moins de 24 h, confirmer le maintien : le statut passe à « Confirmé ». Cliquer alors sur le badge « Confirmé » puis valider pour passer à « Terminé » ; l'application demande si une vente a eu lieu et ouvre le formulaire de vente pré-rempli (client, téléphone, adresse, ville, date du rendez-vous).

## 6. Pointage (/pointage)
Onglets Entreprises / Travailleurs / Calendrier. Saisie manuelle ou automatique. **Avances** : choisir la granularité semaine, mois ou année ; seules les périodes non encore payées sont proposées. La semaine glissante rattache les derniers jours du mois précédent au mois courant.

## 7. Tâches et Notes
- Tâches : calendrier, vue jour/semaine, validation, bandeau défilant des tâches du jour.
- Notes : tableau Kanban, colonnes personnalisables, dessin libre sur une note.

## 8. Comptabilité
Saisir un **achat** ou une **dépense** avec pièce justificative (PDF, JPEG, JPG, PNG). Bouton **Facturation** : type → année → produit → mois pour retrouver et télécharger un justificatif. Les cartes de statistiques sont cliquables et ouvrent le détail. Exports PDF et Excel disponibles.

## 9. Partage
Bouton de partage sur Pointage, Tâches et Notes : lien intégral ou sélectif (par colonne entière pour les notes). Le visiteur peut cliquer « Ajouter un commentaire », désigner un élément et envoyer son retour ; l'administrateur voit une pastille de notification et peut consulter ou télécharger les retours.

## 10. Profil et paramètres (/profile)
Informations personnelles, avatar, mot de passe, historique de connexion en temps réel (filtres jour/semaine/mois/année), activation des modules, mode maintenance, indisponibilités, pointage automatique, suppression définitive d'utilisateurs (administrateurs principaux).

