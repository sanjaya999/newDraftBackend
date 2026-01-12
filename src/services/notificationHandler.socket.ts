import type { Socket } from "socket.io";
import { prisma } from "../infrastructure/database.js";

/**
 * Socket handler for real-time notifications.
 * This remains a function as it handles socket events, not HTTP requests.
 */
export function notificationHandler(socket: Socket) {
  socket.on("notification:send", async (data) => {
    const notification = await prisma.notification.findMany({
      where: {
        recipientId: socket.data.user?.id,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        actor: true,
        document: true,
      },
    });
    socket.emit("notification:list", notification);
  });

  socket.on("notification:markRead", async (notificationId: string) => {
    try {
      await prisma.notification.update({
        where: { id: notificationId, recipientId: socket.data.user?.id },
        data: { isRead: true },
      });
      socket.emit("notification:read_success", notificationId);
    } catch (error) {
      console.error(
        `Error marking notification ${notificationId} read:`,
        error,
      );
    }
  });
}
