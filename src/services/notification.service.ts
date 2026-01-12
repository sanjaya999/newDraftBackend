import type { DocumentRole } from "@prisma/client";
import {
  createNotification,
  findNotificationsByRecipient,
  type CreateNotificationInput,
} from "../repository/notification.repository.js";
import { getIO, userSocketMap } from "../sockets/socket.server.js";

export interface NotifyUserInput {
  recipientId: string;
  message: string;
  documentId: string;
  actorId: string;
}

/**
 * Creates a notification and emits a socket event to the recipient if online.
 * This function decouples notification logic from both the controller and other services.
 */
export async function notifyUser(input: NotifyUserInput) {
  const notificationInput: CreateNotificationInput = {
    recipientId: input.recipientId,
    message: input.message,
    documentId: input.documentId,
    actorId: input.actorId,
    type: "DOCUMENT_SHARED",
  };

  const notification = await createNotification(notificationInput);

  const socketId = userSocketMap.get(input.recipientId);
  if (socketId) {
    getIO().to(socketId).emit("notification:new", notification);
  }

  return notification;
}

/**
 * Creates a collaborator-added notification with formatted message.
 */
export async function notifyCollaboratorAdded(
  recipientId: string,
  documentId: string,
  documentTitle: string,
  role: DocumentRole,
  actorId: string,
) {
  return notifyUser({
    recipientId,
    message: `You have been added as a ${role} to "${documentTitle}"`,
    documentId,
    actorId,
  });
}

/**
 * Retrieves notifications for a user.
 */
export async function getUserNotifications(userId: string, limit: number = 20) {
  return findNotificationsByRecipient(userId, limit);
}
