import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../infrastructure/envConfig.js";
import type { ITokenService } from "../interfaces/index.js";

const SALT_ROUNDS = 10;

/**
 * TokenService handles all authentication token and password operations.
 * Implements ITokenService interface for dependency injection.
 */
export class TokenService implements ITokenService {
  generateAccessToken(userId: string): string {
    if (!env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_KEY is not defined in environment variables");
    }
    return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, { expiresIn: "5d" });
  }

  generateRefreshToken(userId: string): string {
    if (!env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT_REFRESH_KEY is not defined in environment variables",
      );
    }
    return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

// Backward compatibility exports for gradual migration
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (userId: string): string => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_KEY is not defined in environment variables");
  }
  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, { expiresIn: "5d" });
};

export const generateRefreshToken = (userId: string): string => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_KEY is not defined in environment variables");
  }
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
