import { StatusCodes } from "http-status-codes";
import type { PrismaClient, DocumentRole } from "@prisma/client";
import { ApiError } from "../core/ApiError.js";
import type { IPermissionService } from "../interfaces/index.js";
import { PERMISSIONS, type PermissionAction } from "../types/permissions.js";

/**
 * PermissionService handles document permission business logic.
 * Implements IPermissionService interface for dependency injection.
 *
 * Follows Single Responsibility Principle: only handles permission checks.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class PermissionService implements IPermissionService {
  constructor(private readonly prisma: PrismaClient) {}

  async checkDocumentPermission(
    userId: string,
    documentId: string,
    requiredPermission: string,
  ): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });

    if (!document) {
      throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
    }

    if (document.ownerId === userId) {
      return "OWNER";
    }

    const permission = await this.prisma.documentPermission.findUnique({
      where: {
        userId_documentId: { userId, documentId },
      },
      select: { role: true },
    });

    if (!permission) {
      throw new ApiError("Access Denied", StatusCodes.FORBIDDEN);
    }

    const allowedRoles = PERMISSIONS[requiredPermission as PermissionAction];
    if (!allowedRoles || !allowedRoles.includes(permission.role)) {
      throw new ApiError("Insufficient permissions", StatusCodes.FORBIDDEN);
    }

    return permission.role;
  }
}

// Backward compatibility export for gradual migration
import { prisma } from "../infrastructure/database.js";

const defaultPermissionService = new PermissionService(prisma);

export const checkDocumentPermission = async (
  userId: string,
  documentId: string,
  requiredPermission: string,
) => {
  return defaultPermissionService.checkDocumentPermission(
    userId,
    documentId,
    requiredPermission,
  );
};
