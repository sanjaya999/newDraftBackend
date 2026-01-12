import type { Prisma, User } from "@prisma/client";
import { prisma } from "../infrastructure/database.js";

export const userSelectWithoutPassword = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserWithoutPassword = Prisma.UserGetPayload<{
  select: typeof userSelectWithoutPassword;
}>;

export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}
export async function findUserById(
  id: string,
): Promise<UserWithoutPassword | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: userSelectWithoutPassword,
  });
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<Omit<User, "password">> {
  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}
