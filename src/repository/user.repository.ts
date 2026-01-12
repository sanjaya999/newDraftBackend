import type { User, Prisma, PrismaClient } from "@prisma/client";
import type { IUserRepository, UserWithoutPassword } from "../interfaces/index.js";

export const userSelectWithoutPassword = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

/**
 * UserRepository handles all user-related database operations.
 * Implements IUserRepository interface for dependency injection.
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelectWithoutPassword,
    });
  }

  async create(
    name: string,
    email: string,
    passwordHash: string
  ): Promise<UserWithoutPassword> {
    return this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
      },
      select: userSelectWithoutPassword,
    });
  }
}

// Backward compatibility exports for gradual migration
import { prisma } from "../infrastructure/database.js";

const defaultRepository = new UserRepository(prisma);

export type { UserWithoutPassword } from "../interfaces/index.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  return defaultRepository.findByEmail(email);
}

export async function findUserById(
  id: string
): Promise<UserWithoutPassword | null> {
  return defaultRepository.findById(id);
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<UserWithoutPassword> {
  return defaultRepository.create(name, email, passwordHash);
}
