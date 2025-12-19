import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerController,
  loginController,
  authCheck,
} from "../api/auth.controller.js";
import * as authService from "../services/auth.js";
import { StatusCodes } from "http-status-codes";

vi.mock("../services/auth.js", () => ({
  registerUser: vi.fn(),
  login: vi.fn(),
}));

describe("Auth Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("registerController", () => {
    it("should register a user and set a cookie", async () => {
      const mockResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "1", name: "Test User", email: "test@example.com" },
      };
      req.body = {
        email: "test@example.com",
        password: "password",
        name: "Test User",
      };
      (authService.registerUser as any).mockResolvedValue(mockResult);

      await registerController(req, res, () => {});

      expect(authService.registerUser).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "password",
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "user created successfully",
        data: mockResult,
      });
    });
  });

  describe("loginController", () => {
    it("should login a user successfully", async () => {
      const mockResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "1", name: "Test User", email: "test@example.com" },
      };
      req.body = { email: "test@example.com", password: "password" };
      (authService.login as any).mockResolvedValue(mockResult);

      await loginController(req, res, () => {});

      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User logged in successfully.",
        data: mockResult,
      });
    });
  });

  describe("authCheck", () => {
    it("should return Passed", async () => {
      await authCheck(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "auth Passed",
        data: "Passed",
      });
    });
  });
});
