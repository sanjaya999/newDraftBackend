import { Router } from "express";
import { authCheck, registerController } from "../api/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../schemas/auth.schema.js";
import { authenticate } from "../middleware/authenticate.js";

const authRouter = Router();

authRouter.post("/register" , validate(registerSchema),registerController)
authRouter.get("/check" , authenticate , authCheck);
export default authRouter;