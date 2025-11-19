import { prisma } from "../infrastructure/database.js";
import { PERMISSIONS, type PermissionAction } from "../types/permissions.js";

export const checkDocumentPermission = async (
    userId: string,
    documentId: string,
    requiredPermission: PermissionAction
) => {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { ownerId: true }
    });

    if (!document) throw new Error("Document not found");
    if (document.ownerId === userId) return "OWNER";

    const permission = await prisma.documentPermission.findUnique({
        where: {
            userId_documentId: { userId, documentId }
        },
        select: { role: true }
    });

    if (!permission) throw new Error("Access Denied");

    const allowedRoles = PERMISSIONS[requiredPermission];
    if (!allowedRoles || !allowedRoles.includes(permission.role)) {
        throw new Error("Insufficient permissions");
    }

    return permission.role;
};