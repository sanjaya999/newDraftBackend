import { StatusCodes } from "http-status-codes";
import { ApiError } from "../core/ApiError.js";
import { prisma } from "../infrastructure/database.js";
import { PERMISSIONS, type PermissionAction } from "../types/permissions.js";

export const checkDocumentPermission = async (
  userId: string,
  documentId: string,
  requiredPermission: PermissionAction,
) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });

  if (!document)
    throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
  if (document.ownerId === userId) return "OWNER";

  const permission = await prisma.documentPermission.findUnique({
    where: {
      userId_documentId: { userId, documentId },
    },
    select: { role: true },
  });

  if (!permission) throw new ApiError("Access Denied", StatusCodes.FORBIDDEN);

  const allowedRoles = PERMISSIONS[requiredPermission];
  if (!allowedRoles || !allowedRoles.includes(permission.role)) {
    throw new ApiError("Insufficient permissions", StatusCodes.FORBIDDEN);
  }

  return permission.role;
};
