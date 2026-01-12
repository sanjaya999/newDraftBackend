import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { container, DEPS } from "../infrastructure/container.js";
import type { NotificationController } from "../api/notification.controller.js";

/**
 * Creates the notification router with DI-injected controller.
 * Follows Dependency Inversion Principle.
 */
export function createNotificationRouter(): Router {
  const notificationController = container.get<NotificationController>(
    DEPS.NOTIFICATION_CONTROLLER,
  );
  const router = Router();

  router.get("/", authenticate, notificationController.getAll);

  return router;
}

// Default export for backward compatibility
const notificationRouter = Router();

let initialized = false;
notificationRouter.use((req, res, next) => {
  if (!initialized) {
    const controller = container.get<NotificationController>(
      DEPS.NOTIFICATION_CONTROLLER,
    );
    notificationRouter.get("/", authenticate, controller.getAll);
    initialized = true;
  }
  next();
});

export default notificationRouter;
