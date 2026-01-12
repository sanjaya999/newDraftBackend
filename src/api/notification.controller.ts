import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getUserNotifications as getNotificationsService } from "../services/notification.service.js";
import { sendResponse } from "../utils/response.js";
import { StatusCodes } from "http-status-codes";

/**
 * HTTP handler for fetching user notifications.
 * Delegates to notification service layer.
 */
export const getUserNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const notifications = await getNotificationsService(userId);

    return sendResponse(res, StatusCodes.OK, {
      data: notifications,
      message: "Notifications fetched successfully",
    });
  },
);
