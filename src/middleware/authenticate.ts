import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../core/ApiError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../infrastructure/envConfig.js";
import { asyncHandler } from "./asyncHandler.js";
import { findUserById } from "../repository/user.repository.js";
import type { Socket } from "socket.io";

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(
          "No authorization token provided",
          StatusCodes.UNAUTHORIZED,
        );
      }

      const token = authHeader.replace("Bearer ", "");

      const decodedToken = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
      ) as jwt.JwtPayload;
      const user = await findUserById(decodedToken?.id);

      if (!user) {
        throw new ApiError(
          "User not found or invalid token",
          StatusCodes.UNAUTHORIZED,
        );
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError("Token has expired", StatusCodes.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(
          "Invalid token format or signature",
          StatusCodes.UNAUTHORIZED,
        );
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Authentication failed", StatusCodes.UNAUTHORIZED);
    }
  },
);

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "") ||
      (socket.handshake.query.token as string);

    if (!token) {
      return next(
        new ApiError(
          "Unauthorized: Socket requires auth token",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    const decodedToken = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as jwt.JwtPayload;
    const user = await findUserById(decodedToken?.id);

    if (!user) {
      return next(
        new ApiError(
          "Unauthorized: Invalid Access Token",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    socket.data.user = user;
    console.log("connecting user ,", socket.data.user);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError("Token has expired", StatusCodes.UNAUTHORIZED));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new ApiError(
          "Invalid token format or signature",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }
    return next(
      new ApiError(
        "Unauthorized: Token validation failed",
        StatusCodes.UNAUTHORIZED,
      ),
    );
  }
}
