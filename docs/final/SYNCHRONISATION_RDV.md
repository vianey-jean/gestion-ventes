# Synchronisation Réservation ↔ Rendez-vous

## Vue d'ensemble

Ce document décrit le système de synchronisation automatique entre les réservations et les rendez-vous.

## Service de synchronisation

**Fichier**: `src/services/reservationRdvSyncService.ts`

### Fonctionnalités

- Synchronisation unidirectionnelle : Réservation → Rendez-vous
- Mapping automatique des statuts
- Fiabilité après rafraîchissement

### Mapping des statuts

| Statut Réservation | Statut RDV |
|-------------------|------------|
| en_attente | planifie |
| en_route | confirme |
| arrive | confirme |
| valide | termine |
| annule | annule |
| reporter | reporte |

### Méthodes

- `mapStatusToRdv(commandeStatut)`: Convertit un statut de réservation en statut RDV
- `syncRdvStatus(commandeId, newStatus)`: Synchronise le statut du RDV
- `syncRdvReport(commandeId, newDate, newHoraire)`: Synchronise lors d'un report
- `hasLinkedRdv(commandeId)`: Vérifie si un RDV existe

## Modal Premium RdvCreationModal

**Fichier**: `src/components/commandes/RdvCreationModal.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | Contrôle l'affichage |
| onClose | () => void | Callback de fermeture |
| onConfirm | (titre, description) => Promise | Callback de validation |
| reservation | ReservationData | null | Données de la réservation |
| isLoading | boolean | État de chargement |

### Fonctionnalités

- Design premium avec animations framer-motion
- Champs préremplis depuis la réservation
- Validation du titre obligatoire
- Icônes modernes lucide-react

## Utilisation dans CommandesPage

1. Lors d'un changement de statut de réservation, `reservationRdvSyncService.syncRdvStatus()` est appelé automatiquement
2. Lors de la création d'une réservation avec date/horaire, le modal premium s'affiche pour créer un RDV
