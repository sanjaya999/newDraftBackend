import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getUserNotifications } from "../api/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/", authenticate, getUserNotifications);

export default notificationRouter;
