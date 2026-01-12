import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import { StatusCodes } from "http-status-codes";
import type {
  INotificationRepository,
  INotificationService,
} from "../interfaces/index.js";

/**
 * NotificationController handles notification HTTP endpoints and real-time emission.
 * Follows Single Responsibility Principle: only handles HTTP/socket layer.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class NotificationController {
  constructor(
    private readonly notificationService: INotificationService,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  /**
   * Send a notification to a user.
   */
  async send(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string,
  ): Promise<void> {
    await this.notificationService.send(
      recipientId,
      message,
      documentId,
      actorId,
    );
  }

  /**
   * Get notifications for the authenticated user.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    // We use the repository directly for queries (CQRS pattern lite)
    // or we could add a getAll to the service. For now, repo is fine.
    const notifications =
      await this.notificationRepository.findUnreadByRecipient(userId, 20);

    return sendResponse(res, StatusCodes.OK, {
      data: notifications,
      message: "Notifications fetched successfully",
    });
  });
}

// Backward compatibility exports for gradual migration
import { prisma } from "../infrastructure/database.js";
import { NotificationService } from "../services/notification.service.js";
import { NotificationRepository } from "../repository/notification.repository.js";

const notificationRepository = new NotificationRepository(prisma);
const notificationService = new NotificationService(notificationRepository);
const defaultNotificationController = new NotificationController(
  notificationService,
  notificationRepository,
);

export const notificationController = (
  recipientId: string,
  message: string,
  documentId: string,
  actorId: string,
) =>
  defaultNotificationController.send(recipientId, message, documentId, actorId);

export const getUserNotifications = defaultNotificationController.getAll;
