import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { authenticate } from "../middleware/authenticate.js";
import { container, DEPS } from "../infrastructure/container.js";
import type { AuthController } from "../api/auth.controller.js";

/**
 * Creates the auth router with DI-injected controller.
 * Follows Dependency Inversion Principle.
 */
export function createAuthRouter(): Router {
  const authController = container.get<AuthController>(DEPS.AUTH_CONTROLLER);
  const router = Router();

  router.post("/register", validate(registerSchema), authController.register);
  router.post("/login", validate(loginSchema), authController.login);
  router.get("/check", authenticate, authController.check);

  return router;
}

// Default export for backward compatibility during transition
const authRouter = Router();

// Lazy initialization - routes are set up when first request comes in
let initialized = false;
authRouter.use((req, res, next) => {
  if (!initialized) {
    const controller = container.get<AuthController>(DEPS.AUTH_CONTROLLER);
    authRouter.post("/register", validate(registerSchema), controller.register);
    authRouter.post("/login", validate(loginSchema), controller.login);
    authRouter.get("/check", authenticate, controller.check);
    initialized = true;
  }
  next();
});

export default authRouter;
