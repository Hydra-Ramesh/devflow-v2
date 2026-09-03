import { notificationRepository, CreateNotificationDto } from '../repositories/notification.repository.js';
import { redis } from '../config/redis.js';

export class NotificationService {
  async getNotifications(userId: string) {
    const notifications = await notificationRepository.getNotifications(userId);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    
    const actorIds = [...new Set(notifications.map(n => n.actorId))];
    const redisKeys = actorIds.map(id => `user:profile:${id}`);
    
    let cachedUsers: Record<string, any> = {};
    if (redisKeys.length > 0) {
      const redisData = await redis.mget(...redisKeys);
      actorIds.forEach((id, index) => {
        if (redisData[index]) {
          cachedUsers[id] = JSON.parse(redisData[index] as string);
        }
      });
    }

    const formatted = notifications.map(n => ({
      _id: n.id,
      id: n.id,
      recipient_id: n.recipientId,
      actor_id: n.actorId,
      type: n.type,
      entity_id: n.entityId,
      is_read: n.isRead,
      created_at: n.createdAt,
      actor: cachedUsers[n.actorId] || null
    }));

    return { notifications: formatted, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    await notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
