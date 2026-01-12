import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserNotifications } from "../api/notification.controller.js";
import * as notificationService from "../services/notification.service.js";
import { StatusCodes } from "http-status-codes";

vi.mock("../services/notification.service.js", () => ({
  getUserNotifications: vi.fn(),
}));

describe("Notification Controller", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      user: { id: "user-123" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("getUserNotifications", () => {
    it("should fetch user notifications", async () => {
      const mockNotifications = [
        { id: "notif-1", message: "Test message", recipientId: "user-123" },
      ];
      (notificationService.getUserNotifications as any).mockResolvedValue(
        mockNotifications,
      );

      await getUserNotifications(req, res, next);

      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(
        "user-123",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notifications fetched successfully",
        data: mockNotifications,
      });
    });
  });
});
