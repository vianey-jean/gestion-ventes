# Documentation - Module Rendez-vous

## Vue d'ensemble

Le module Rendez-vous permet de gérer efficacement les rendez-vous clients avec une interface calendrier intuitive et des fonctionnalités avancées comme le glisser-déposer.

---

## Fonctionnalités

### 1. Calendrier Mensuel

- Vue mensuelle complète
- Navigation entre les mois
- Affichage des rendez-vous par jour
- Code couleur selon le statut

### 2. Gestion des Rendez-vous

#### Création
- Titre du rendez-vous
- Date et heure
- Client associé (optionnel)
- Description/notes
- Statut initial

#### Modification
- Édition des informations
- Changement de date par glisser-déposer
- Modification du statut

#### Suppression
- Confirmation avant suppression
- Historique conservé

### 3. Statuts des Rendez-vous

| Statut | Couleur | Description |
|--------|---------|-------------|
| `pending` | Jaune | En attente de confirmation |
| `confirmed` | Vert | Confirmé |
| `cancelled` | Rouge | Annulé |
| `completed` | Bleu | Terminé |

### 4. Glisser-Déposer

Le calendrier supporte le glisser-déposer pour déplacer facilement les rendez-vous d'un jour à l'autre :

1. Cliquer et maintenir sur un rendez-vous
2. Le faire glisser vers le jour souhaité
3. Relâcher pour confirmer le déplacement

---

## Types TypeScript

```typescript
// Type principal d'un rendez-vous
interface Rdv {
  id: string;
  titre: string;
  date: string;           // Format ISO
  heure?: string;         // Format HH:mm
  clientId?: string;
  clientNom?: string;
  description?: string;
  statut: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

// Pour la création
interface CreateRdvDto {
  titre: string;
  date: string;
  heure?: string;
  clientId?: string;
  clientNom?: string;
  description?: string;
  statut?: string;
}

// Pour la mise à jour
interface UpdateRdvDto {
  titre?: string;
  date?: string;
  heure?: string;
  clientId?: string;
  clientNom?: string;
  description?: string;
  statut?: string;
}
```

---

## API Endpoints

### GET /api/rdv
Récupère tous les rendez-vous.

**Réponse:**
```json
[
  {
    "id": "1",
    "titre": "Consultation client",
    "date": "2025-01-15T10:00:00.000Z",
    "heure": "10:00",
    "clientNom": "Marie Dupont",
    "statut": "confirmed"
  }
]
```

### POST /api/rdv
Crée un nouveau rendez-vous.

**Corps de la requête:**
```json
{
  "titre": "Nouveau rendez-vous",
  "date": "2025-01-20",
  "heure": "14:30",
  "clientNom": "Jean Martin",
  "description": "Présentation produits",
  "statut": "pending"
}
```

### PUT /api/rdv/:id
Modifie un rendez-vous existant.

### DELETE /api/rdv/:id
Supprime un rendez-vous.

### PATCH /api/rdv/:id/status
Change uniquement le statut d'un rendez-vous.

**Corps:**
```json
{
  "statut": "confirmed"
}
```

---

## Composants React

### RdvCalendar

Composant principal du calendrier.

```tsx
import { RdvCalendar } from '@/components/rdv/RdvCalendar';

<RdvCalendar
  rdvs={listeDesRdv}
  onRdvClick={(rdv) => handleClick(rdv)}
  onDateSelect={(date) => handleNewRdv(date)}
  onRdvDrop={(rdv, newDate) => handleMove(rdv, newDate)}
/>
```

### RdvCard

Carte d'affichage d'un rendez-vous.

```tsx
import { RdvCard } from '@/components/rdv/RdvCard';

<RdvCard
  rdv={rdv}
  onEdit={() => openEditModal(rdv)}
  onDelete={() => confirmDelete(rdv)}
  onStatusChange={(status) => updateStatus(rdv.id, status)}
/>
```

### RdvForm

Formulaire de création/édition.

```tsx
import { RdvForm } from '@/components/rdv/RdvForm';

<RdvForm
  rdv={rdvToEdit} // undefined pour création
  clients={listeClients}
  onSubmit={(data) => saveRdv(data)}
  onCancel={() => closeModal()}
/>
```

---

## Hook useRdv

```tsx
import { useRdv } from '@/hooks/useRdv';

const {
  rdvs,           // Liste des rendez-vous
  isLoading,      // État de chargement
  error,          // Erreur éventuelle
  createRdv,      // Fonction de création
  updateRdv,      // Fonction de mise à jour
  deleteRdv,      // Fonction de suppression
  refetch         // Recharger les données
} = useRdv();

// Exemple d'utilisation
const handleCreate = async (data) => {
  try {
    await createRdv(data);
    toast({ title: "RDV créé avec succès" });
  } catch (error) {
    toast({ title: "Erreur", variant: "destructive" });
  }
};
```

---

## Intégration avec les Clients

Le module RDV peut être lié aux fiches clients :

1. **Depuis la fiche client**: Bouton "Créer RDV" pré-remplit le nom du client
2. **Depuis le calendrier**: Sélecteur de client dans le formulaire
3. **Historique**: Vue des RDV passés dans la fiche client

---

## Notifications de Rendez-vous

Voir la documentation [NOTIFICATIONS.md](./NOTIFICATIONS.md) pour les détails sur :
- Rappels automatiques
- Configuration des délais
- Types de notifications

---

## Bonnes Pratiques

1. **Validation des dates**: Toujours vérifier que la date est dans le futur pour les nouveaux RDV
2. **Statut initial**: Par défaut "pending" jusqu'à confirmation
3. **Nettoyage**: Archiver les RDV de plus de 6 mois
4. **Performance**: Paginer les requêtes si beaucoup de RDV

---

## Exemples d'Utilisation

### Créer un RDV depuis une réservation

```tsx
import { createRdvFromReservation } from '@/services/rdvFromReservationService';

const handleReservation = async (reservation) => {
  const rdv = await createRdvFromReservation({
    clientNom: reservation.clientName,
    date: reservation.date,
    description: `Réservation #${reservation.id}`
  });
  
  navigate(`/rdv/${rdv.id}`);
};
```

### Filtrer les RDV du jour

```tsx
const rdvsAujourdhui = rdvs.filter(rdv => {
  const rdvDate = new Date(rdv.date);
  const today = new Date();
  return rdvDate.toDateString() === today.toDateString();
});
```

---

*Documentation mise à jour le 22 décembre 2025*
