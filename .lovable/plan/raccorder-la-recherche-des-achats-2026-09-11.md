# Raccorder la recherche des achats

## Objectif
Finaliser uniquement la recherche d’achats dans l’en-tête Comptabilité et vérifier la synchronisation achat-produit.

## Modifications
- Ajouter les deux actions de modification et suppression aux propriétés de `ComptabiliteHeader`.
- Afficher la loupe de recherche juste à gauche du bouton « Achat ».
- Transmettre les actions déjà fournies par le module Comptabilité au composant de recherche.
- Corriger uniquement les éventuels défauts bloquant la recherche, la confirmation ou le formulaire de modification.

## Vérifications
- Vérifier la compilation et les erreurs d’exécution.
- Tester l’ouverture de la recherche et l’affichage des résultats après trois caractères.
- Effectuer un test isolé de modification puis de suppression sur des données temporaires, et confirmer la mise à jour cohérente des achats et produits sans altérer les données réelles existantes.

## Détails techniques
- Réutiliser `AchatSearchBar`, `handleUpdateAchat` et `handleDeleteAchat` déjà présents.
- Le test serveur sauvegardera les fichiers concernés avant l’essai et les restaurera ensuite.
