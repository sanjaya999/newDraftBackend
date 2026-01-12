import type {
  INotificationService,
  INotificationRepository,
} from "../interfaces/index.js";
import { getIO, userSocketMap } from "../sockets/socket.server.js";

/**
 * NotificationService handles notification business logic.
 * Implements INotificationService interface for dependency injection.
 *
 * Follows Single Responsibility Principle: only handles notification logic.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async send(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.create(
      recipientId,
      message,
      documentId,
      actorId,
    );

    // Real-time notification
    const socketId = userSocketMap.get(recipientId);
    if (socketId && notification) {
      getIO().to(socketId).emit("notification:new", notification);
    }
  }
}

// Backward compatibility - socket handler export
import { notificationHandler } from "./notificationHandler.socket.js";
export { notificationHandler };
