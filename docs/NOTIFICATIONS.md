# Documentation - Système de Notifications

## Vue d'ensemble

Le système de notifications permet d'alerter les utilisateurs sur les événements importants : rendez-vous à venir, paiements en retard, stocks faibles, etc.

---

## Types de Notifications

### 1. Notifications de Rendez-vous

| Type | Déclencheur | Délai |
|------|-------------|-------|
| `rdv_reminder` | RDV à venir | 24h avant |
| `rdv_today` | RDV du jour | Le matin même |
| `rdv_missed` | RDV manqué | 1h après l'heure |

### 2. Notifications de Paiements

| Type | Déclencheur |
|------|-------------|
| `payment_due` | Paiement dû aujourd'hui |
| `payment_late` | Paiement en retard |
| `payment_received` | Paiement reçu |

### 3. Notifications de Stock

| Type | Déclencheur |
|------|-------------|
| `stock_low` | Stock < seuil minimum |
| `stock_empty` | Stock épuisé |

### 4. Notifications Système

| Type | Déclencheur |
|------|-------------|
| `system_update` | Mise à jour disponible |
| `backup_complete` | Sauvegarde terminée |

---

## Structure des Données

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  readAt?: string;
  data?: {
    rdvId?: string;
    clientId?: string;
    productId?: string;
    amount?: number;
  };
}

type NotificationType = 
  | 'rdv_reminder'
  | 'rdv_today'
  | 'rdv_missed'
  | 'payment_due'
  | 'payment_late'
  | 'payment_received'
  | 'stock_low'
  | 'stock_empty'
  | 'system_update';
```

---

## API Endpoints

### GET /api/rdv-notifications
Récupère toutes les notifications.

**Paramètres de requête:**
- `unreadOnly`: boolean - Uniquement les non lues
- `type`: string - Filtrer par type
- `limit`: number - Nombre maximum (défaut: 50)

**Réponse:**
```json
{
  "notifications": [...],
  "unreadCount": 5,
  "total": 23
}
```

### POST /api/rdv-notifications
Crée une nouvelle notification.

**Corps:**
```json
{
  "type": "rdv_reminder",
  "title": "Rappel de RDV",
  "message": "Vous avez un RDV demain à 10h",
  "priority": "medium",
  "data": {
    "rdvId": "123"
  }
}
```

### PATCH /api/rdv-notifications/:id/read
Marque une notification comme lue.

### PATCH /api/rdv-notifications/read-all
Marque toutes les notifications comme lues.

### DELETE /api/rdv-notifications/:id
Supprime une notification.

---

## Composants React

### RdvNotifications

Centre de notifications principal.

```tsx
import { RdvNotifications } from '@/components/rdv/RdvNotifications';

<RdvNotifications
  notifications={notifications}
  onNotificationClick={(notif) => handleClick(notif)}
  onMarkAsRead={(id) => markAsRead(id)}
  onMarkAllAsRead={() => markAllAsRead()}
/>
```

### NotificationBadge

Badge de compteur dans la navigation.

```tsx
<NotificationBadge count={unreadCount} />
```

### NotificationToast

Toast pour les nouvelles notifications.

```tsx
<NotificationToast
  notification={newNotification}
  onDismiss={() => dismissToast()}
  onAction={() => navigateToSource()}
/>
```

---

## Service de Notifications

```typescript
import { notificationService } from '@/services/notificationService';

// Créer une notification
await notificationService.create({
  type: 'payment_due',
  title: 'Paiement dû',
  message: 'Le client Jean doit 150€',
  priority: 'high',
  data: { clientId: '123', amount: 150 }
});

// Récupérer les non lues
const unread = await notificationService.getUnread();

// Marquer comme lue
await notificationService.markAsRead(notificationId);

// Écouter les nouvelles notifications (temps réel)
notificationService.subscribe((notification) => {
  showToast(notification);
});
```

---

## Notifications en Temps Réel

Le système utilise Server-Sent Events (SSE) pour les notifications en temps réel.

### Connexion SSE

```typescript
// Service de connexion SSE
const eventSource = new EventSource('/api/sync/events');

eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  handleNewNotification(notification);
});

eventSource.addEventListener('error', (error) => {
  console.error('Connexion SSE perdue:', error);
  // Reconnexion automatique
});
```

### Événements SSE

| Événement | Description |
|-----------|-------------|
| `notification` | Nouvelle notification |
| `notification:read` | Notification marquée comme lue |
| `notification:delete` | Notification supprimée |

---

## Priorités et Comportement

### Niveau de Priorité

| Priorité | Couleur | Comportement |
|----------|---------|--------------|
| `low` | Gris | Silencieux, badge uniquement |
| `medium` | Bleu | Toast discret |
| `high` | Orange | Toast persistant |
| `urgent` | Rouge | Toast + son + vibration (mobile) |

### Durée d'affichage Toast

```typescript
const toastDuration = {
  low: 3000,      // 3 secondes
  medium: 5000,   // 5 secondes
  high: 8000,     // 8 secondes
  urgent: 0       // Jusqu'à fermeture manuelle
};
```

---

## Configuration

### Préférences Utilisateur

```typescript
interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  emailDigest: 'none' | 'daily' | 'weekly';
  types: {
    rdv_reminder: boolean;
    payment_due: boolean;
    stock_low: boolean;
    // ...
  };
}
```

### Stockage des Préférences

Les préférences sont stockées localement et synchronisées avec le serveur :

```typescript
// Sauvegarder les préférences
localStorage.setItem('notificationPrefs', JSON.stringify(prefs));

// Récupérer
const prefs = JSON.parse(localStorage.getItem('notificationPrefs') || '{}');
```

---

## Bonnes Pratiques

1. **Ne pas spammer**: Grouper les notifications similaires
2. **Contexte clair**: Message concis avec action possible
3. **Priorité appropriée**: Réserver "urgent" aux cas critiques
4. **Nettoyage**: Supprimer les notifications de plus de 30 jours
5. **Accessibilité**: Texte lisible par les lecteurs d'écran

---

## Intégration avec d'autres Modules

### Rendez-vous

```typescript
// Créer notification de rappel automatique
const scheduleRdvReminder = async (rdv: Rdv) => {
  const reminderTime = new Date(rdv.date);
  reminderTime.setHours(reminderTime.getHours() - 24);
  
  await notificationService.schedule({
    type: 'rdv_reminder',
    scheduledFor: reminderTime.toISOString(),
    title: 'Rappel de rendez-vous',
    message: `RDV "${rdv.titre}" demain`,
    data: { rdvId: rdv.id }
  });
};
```

### Prêts en Retard

```typescript
// Vérification quotidienne des retards
const checkOverduePayments = async () => {
  const overdue = await pretService.getOverdue();
  
  for (const pret of overdue) {
    await notificationService.create({
      type: 'payment_late',
      priority: 'high',
      title: 'Paiement en retard',
      message: `${pret.clientNom} doit ${pret.reste}€`,
      data: { pretId: pret.id, clientId: pret.clientId }
    });
  }
};
```

---

## Dépannage

### Les notifications ne s'affichent pas

1. Vérifier que les notifications sont activées dans les préférences
2. Vérifier la connexion SSE dans les DevTools
3. Vérifier que le navigateur autorise les notifications

### Trop de notifications

1. Ajuster les seuils de déclenchement
2. Activer le regroupement de notifications similaires
3. Désactiver les types non essentiels

---

*Documentation mise à jour le 22 décembre 2025*
