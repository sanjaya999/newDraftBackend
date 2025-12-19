import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserNotifications } from "../api/notification.controller.js";
import { prisma } from "../infrastructure/database.js";

vi.mock("../infrastructure/database.js", () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../sockets/socket.server.js", () => ({
  getIO: vi.fn(),
  userSocketMap: {
    get: vi.fn(),
  },
}));

describe("Notification Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      user: { id: "user-123" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("getUserNotifications", () => {
    it("should fetch user notifications", async () => {
      const mockNotifications = [
        { id: "notif-1", message: "Test message", recipientId: "user-123" },
      ];
      (prisma.notification.findMany as any).mockResolvedValue(
        mockNotifications,
      );

      await getUserNotifications(req, res);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { recipientId: "user-123" },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
      });
    });
  });
});
