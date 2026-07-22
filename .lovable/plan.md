
## Objectif
Ajouter la logique de « réservation ultérieure » dans `CommandeFormDialog` (type = Réservation), avec verrouillage stock, auto-suppression après 10 jours, et notification globale 24h avant.

## 1. Backend

### `server/db/commandes.json` — champs additionnels
Nouveaux champs sur une commande de type `reservation` :
- `reservationUlterieure: boolean`
- `dateReprise?: string` (YYYY-MM-DD, max +10j ; `null` si mode "ulterieur")
- `ulterieurLibre: boolean` (si aucune date, juste "à décider" dans les 10j)
- `expiresAt: string` (ISO — création + 10 jours) — utilisé pour la purge et le compte à rebours
- `statut: 'ulterieur' | ...` (nouveau statut)

### `server/services/reservationCleanupService.js` (nouveau)
- Fonction `purgeExpiredUlterieures()` : lit `commandes.json`, supprime celles avec `statut === 'ulterieur'` et `expiresAt < now`.
- `getExpiringSoon()` : renvoie celles qui expirent dans les prochaines 24h.
- Démarré au boot du serveur via `setInterval` (toutes les 15 min).

### `server/routes/commandes.js` (extension légère)
- À `POST /`, si `reservationUlterieure === true` :
  - Ignorer le check d'indisponibilité (pas de créneau)
  - Forcer `statut = 'ulterieur'`
  - Calculer `expiresAt = createdAt + 10j`
  - **Ne pas** créer de RDV/tâche associé (déjà côté frontend, mais garder cohérence)
- `GET /expiring-soon` : renvoie les réservations ultérieures qui expirent dans 24h.

### `server/routes/products.js` (ou hook stock existant) — verrouillage
- Nouvelle route `GET /api/products/:id/available-quantity` qui renvoie :
  ```
  { total, reservedByUlterieures, available }
  ```
- `reservedByUlterieures` = somme des quantités de ce produit dans commandes `reservation` (ultérieures + en_attente non validées).

Alternative plus simple : ajouter cette info dans un endpoint agrégé `GET /api/reservations/stock-locks` renvoyant `{ [productName]: reservedQty }`.

### Types partagés
Mettre à jour `src/types/commande.ts` :
- `CommandeStatut` : ajouter `'ulterieur'`
- Champs `reservationUlterieure`, `dateReprise`, `ulterieurLibre`, `expiresAt`.

## 2. Frontend

### `src/components/commandes/ReservationUlterieureModal.tsx` (nouveau)
- Ultra moderne (glass, gradient violet/rose), responsive.
- Champ date (max = today + 10j).
- Toggle « À décider (ultérieur libre) ».
- Boutons Valider / Annuler.
- Note : « Cette réservation sera automatiquement supprimée après 10 jours si non modifiée. »

### `src/components/commandes/CommandeFormDialog.tsx` (édit chirurgical)
Section « Type & Planification » :
- Si `type === 'reservation'` (et pas RDV) → afficher icône `CalendarClock` (ou `Hourglass`) juste à droite du Select Type, tooltip "Réservation ultérieure".
- Icône invisible pour `commande` et `rdv`.
- Clic → ouvre `ReservationUlterieureModal`.
- Une fois validée :
  - État local `ulterieurConfig = { dateReprise?, libre }` mémorisé.
  - Champs date + horaire deviennent `disabled` + badge "Mode ultérieur".
  - Alert visuelle : "Statut sera : Ultérieur — expire le JJ/MM/AAAA".
- À la soumission, passer `reservationUlterieure`, `dateReprise`, `ulterieurLibre` dans le payload. Ne pas déclencher la logique RDV/tâche/indispo.

### `src/components/commandes/StatutUlterieurTransitionModal.tsx` (nouveau)
- Déclenché depuis la table commandes quand l'utilisateur veut passer un statut `ulterieur → en_attente`.
- Formulaire : `dateEcheance`, `heureDebut`, `heureFin`, puis confirmation "Créer RDV + tâche ?" avec vérification de disponibilité (réutiliser `availabilityApi`).
- Si oui → PUT `/api/commandes/:id` avec nouveau statut + création RDV/tâche existante (réutiliser le service RDV déjà en place).

### Table `CommandesTable.tsx` (ajout léger)
- Afficher badge `Ultérieur` (violet/dégradé) pour `statut === 'ulterieur'`.
- Action "Passer en attente" ouvrant `StatutUlterieurTransitionModal`.

### `MultiProductSaleForm` — verrouillage stock
- Au moment du choix produit, fetcher `reservedByUlterieures` (via nouveau endpoint agrégé) et calculer `availableForSale = product.quantity - reserved`.
- Si `availableForSale <= 0` → bloquer, message : "Toute la quantité est réservée."
- Si `qty demandée > availableForSale` → bloquer.

### Notification globale 24h avant expiration
`src/components/commandes/ReservationExpiryNotifier.tsx` (nouveau)
- Monté globalement dans `Layout.tsx` (auth requise).
- Au login + toutes les 1h : fetch `GET /api/commandes/expiring-soon`.
- Pour chaque réservation trouvée non déjà notifiée cette heure, `toast(...)` orange (Sonner) en bas de l'écran : "La réservation de <Client> (<produits>) sera supprimée dans XXh YYmin."
- Persist dernier tick dans `sessionStorage` pour éviter spam au refresh (une fois par login + tick 1h).

## 3. UX/Design
- Icône `Hourglass` (lucide) violet dégradé, tooltip natif via `title` + `Tooltip` shadcn.
- Modales : `rounded-3xl`, glass, ombres douces, cohérent avec l'existant.
- Responsive mobile-first (grilles `sm:`, `md:`).

## 4. Points de vigilance
- Ne toucher qu'aux zones décrites, préserver la logique RDV/tâche existante pour les autres statuts.
- Le check indisponibilité côté backend doit ignorer les réservations ultérieures (pas de date/horaire réel).
- Purge côté serveur idempotente ; interval démarré une seule fois.
- Verrouillage stock : cohérent avec l'existant (ventes en cours) sans double-comptage.
