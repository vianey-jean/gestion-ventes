/**
 * =============================================================================
 * Index des contrôleurs — Export centralisé
 * =============================================================================
 * 
 * Architecture MVC : chaque contrôleur gère la logique métier d'un module.
 * Les routes ne font que déléguer aux méthodes du contrôleur correspondant.
 */

module.exports = {
  // authController supprimé : la logique d'authentification vit uniquement
  // dans routes/auth.js (flux 2FA avec OTP), pour éviter toute duplication
  // avec une ancienne implémentation moins sécurisée.
  beneficeController: require('./beneficeController'),
  clientController: require('./clientController'),
  commandeController: require('./commandeController'),
  depenseController: require('./depenseController'),
  messageController: require('./messageController'),
  objectifController: require('./objectifController'),
  pointageController: require('./pointageController'),
  productController: require('./productController'),
  rdvController: require('./rdvController'),
  saleController: require('./saleController'),
  tacheController: require('./tacheController'),
  crudControllers: require('./crudControllers'),
};
