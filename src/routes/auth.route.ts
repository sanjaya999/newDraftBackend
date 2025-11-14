import { Router } from "express";
import { registerController } from "../api/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../schemas/auth.schema.js";

const authRouter = Router();

authRouter.post("/register" , validate(registerSchema),registerController)

export default authRouter;