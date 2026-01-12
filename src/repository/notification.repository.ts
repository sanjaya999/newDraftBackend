import type { PrismaClient } from "@prisma/client";
import type { INotificationRepository } from "../interfaces/index.js";

/**
 * NotificationRepository handles all notification-related database operations.
 * Implements INotificationRepository interface for dependency injection.
 */
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string,
    type: string = "DOCUMENT_SHARED",
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        recipientId,
        message,
        documentId,
        actorId,
        type: type as any,
      },
    });
  }

  async findUnreadByRecipient(recipientId: string, limit: number) {
    return this.prisma.notification.findMany({
      where: {
        recipientId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        actor: {
          select: { id: true, name: true },
        },
        document: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId, recipientId },
      data: { isRead: true },
    });
  }
}

// Backward compatibility exports for gradual migration
import { prisma } from "../infrastructure/database.js";

const defaultRepository = new NotificationRepository(prisma);

export async function createNotification(
  recipientId: string,
  message: string,
  documentId: string,
  actorId: string,
): Promise<void> {
  return defaultRepository.create(recipientId, message, documentId, actorId);
}

export async function findUnreadNotifications(
  recipientId: string,
  limit: number = 10,
) {
  return defaultRepository.findUnreadByRecipient(recipientId, limit);
}

export async function markNotificationAsRead(
  notificationId: string,
  recipientId: string,
): Promise<void> {
  return defaultRepository.markAsRead(notificationId, recipientId);
}
