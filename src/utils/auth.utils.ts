import bcrypt from "bcrypt";
import { env } from "../infrastructure/envConfig.js";
import jwt, { type SignOptions } from "jsonwebtoken";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (userId: string): string => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_KEY is not defined in environment variables");
  }

  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET!, { expiresIn: "5d" });
};

export const generateRefreshToken = (userId: string): string => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_KEY is not defined in environment variables");
  }

  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};
