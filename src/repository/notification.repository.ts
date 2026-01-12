import type { NotificationType } from "@prisma/client";
import { prisma } from "../infrastructure/database.js";

export interface CreateNotificationInput {
  recipientId: string;
  message: string;
  documentId: string;
  actorId: string;
  type: NotificationType;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      message: input.message,
      documentId: input.documentId,
      actorId: input.actorId,
      type: input.type,
    },
    include: { actor: true, document: true },
  });
}

export async function findNotificationsByRecipient(
  recipientId: string,
  limit: number = 20,
) {
  return prisma.notification.findMany({
    where: { recipientId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: true,
      document: true,
    },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}
