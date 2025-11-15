import { Router } from "express";
import { authCheck, loginController, registerController } from "../api/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { authenticate } from "../middleware/authenticate.js";

const authRouter = Router();

authRouter.post("/register" , validate(registerSchema),registerController)
authRouter.post("/login" ,validate(loginSchema), loginController)

authRouter.get("/check" , authenticate , authCheck);
export default authRouter;