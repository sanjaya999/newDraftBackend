import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import type { IAuthService } from "../interfaces/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendResponse } from "../utils/response.js";

/**
 * AuthController handles authentication HTTP endpoints.
 * Follows Single Responsibility Principle: only handles HTTP layer.
 * Follows Dependency Inversion Principle: depends on IAuthService abstraction.
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    console.log({ email, password, name });

    const result = await this.authService.register(name, email, password);

    const options = {
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: 1000 * 60 * 60,
    };

    res.cookie("accessToken", result.accessToken, options);
    return sendResponse(res, StatusCodes.CREATED, {
      data: result,
      message: "user created successfully",
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    return sendResponse(res, StatusCodes.OK, {
      data: result,
      message: "User logged in successfully.",
    });
  });

  check = asyncHandler(async (req: Request, res: Response) => {
    return sendResponse(res, StatusCodes.OK, {
      data: "Passed",
      message: "auth Passed",
    });
  });
}

// Backward compatibility exports for gradual migration
import { login, registerUser } from "../services/auth.js";

// Create compatibility auth service adapter
const compatAuthService = {
  register: registerUser,
  login,
};

const defaultAuthController = new AuthController(compatAuthService);

export const registerController = defaultAuthController.register;
export const loginController = defaultAuthController.login;
export const authCheck = defaultAuthController.check;
