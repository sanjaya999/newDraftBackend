import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { getIO, userSocketMap } from "../sockets/socket.server.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import { StatusCodes } from "http-status-codes";
import type { INotificationRepository } from "../interfaces/index.js";

/**
 * NotificationController handles notification HTTP endpoints and real-time emission.
 * Follows Single Responsibility Principle: only handles HTTP/socket layer.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class NotificationController {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Send a notification to a user (creates in DB and emits via socket if online).
   */
  async send(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string
  ): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId,
        message,
        documentId,
        actorId,
        type: "DOCUMENT_SHARED",
      },
      include: { actor: true, document: true },
    });

    const socketId = userSocketMap.get(recipientId);
    if (socketId) {
      getIO().to(socketId).emit("notification:new", notification);
    }
  }

  /**
   * Get notifications for the authenticated user.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: true,
        document: true,
      },
    });

    return sendResponse(res, StatusCodes.OK, {
      data: notifications,
      message: "Notifications fetched successfully",
    });
  });
}

// Backward compatibility exports for gradual migration
import { prisma } from "../infrastructure/database.js";

const defaultNotificationController = new NotificationController(prisma);

export const notificationController = (
  recipientId: string,
  message: string,
  documentId: string,
  actorId: string
) => defaultNotificationController.send(recipientId, message, documentId, actorId);

export const getUserNotifications = defaultNotificationController.getAll;
