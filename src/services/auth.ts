import { StatusCodes } from "http-status-codes";
import { ApiError } from "../core/ApiError.js";
import type {
  IAuthService,
  IUserRepository,
  ITokenService,
  AuthResult,
} from "../interfaces/index.js";

/**
 * AuthService handles authentication business logic.
 * Implements IAuthService interface for dependency injection.
 *
 * Follows Single Responsibility Principle: only handles auth logic.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError("Email already exist", StatusCodes.CONFLICT);
    }

    const passwordHash = await this.tokenService.hashPassword(password);
    const newUser = await this.userRepository.create(name, email, passwordHash);

    const accessToken = this.tokenService.generateAccessToken(newUser.id);
    const refreshToken = this.tokenService.generateRefreshToken(newUser.id);

    return {
      accessToken,
      refreshToken,
      user: newUser,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError("No user found", StatusCodes.UNAUTHORIZED);
    }

    const isPasswordValid = await this.tokenService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ApiError("Invalid Password", StatusCodes.UNAUTHORIZED);
    }

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    // Destructure to remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }
}

// Backward compatibility exports for gradual migration
import * as userRepository from "../repository/user.repository.js";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from "../utils/auth.utils.js";

// Create a compatibility token service
const compatTokenService = {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
};

// Create a compatibility user repository adapter
const compatUserRepository = {
  findByEmail: userRepository.findUserByEmail,
  findById: userRepository.findUserById,
  create: userRepository.createUser,
};

const defaultAuthService = new AuthService(
  compatUserRepository,
  compatTokenService,
);

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  return defaultAuthService.register(name, email, password);
}

export async function login(email: string, password: string) {
  return defaultAuthService.login(email, password);
}
