import { prisma } from "../config/db.js";

export interface CreateNotificationDto {
  recipientId: string;
  actorId: string;
  type: string;
  entityId: string;
}

export class NotificationRepository {
  async createNotification(data: CreateNotificationDto) {
    return await prisma.notification.create({ data });
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async getNotifications(userId: string, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id, recipientId: userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
