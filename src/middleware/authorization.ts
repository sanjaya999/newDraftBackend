import type { NextFunction, Request, Response } from "express";
import { PERMISSIONS, type PermissionAction } from "../types/permissions.js";
import { checkDocumentPermission } from "../services/permissionService.js";
import { ApiError } from "../core/ApiError.js";
import { StatusCodes } from "http-status-codes";
import type { Socket } from "socket.io";
import { prisma } from "../infrastructure/database.js";

export const authorize = (requiredPermission: PermissionAction) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const documentId = req.params.docID || req.body.documentId;
            
            const role = await checkDocumentPermission(userId, documentId, requiredPermission);
            
            req.userRole = role;
            req.documentId = documentId;
            next();
        } catch (error) {
            throw new ApiError("Access Denied ", StatusCodes.FORBIDDEN);
        }
    };
};


export const socketAuthorize = (requiredPermission: PermissionAction) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const userId = socket.data.user?.id; 
      if (!userId) return next(new Error("Unauthorized"));
      const documentId = socket.handshake.auth.docID;
      console.log("doc id in socket middleware" , socket.handshake.auth.docID)

      if (!documentId) return next(new Error("Document Id not found"));

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { ownerId: true },
      });

      if (!document) return next(new Error("Document not found"));

      if (document.ownerId === userId) {
        socket.data.userRole = "OWNER"; 
        socket.data.documentId = documentId;
        return next();
      }

      const permission = await prisma.documentPermission.findUnique({
        where: { userId_documentId: { userId, documentId } },
        select: { role: true },
      });

      if (!permission) return next(new Error("Access Denied"));

      const allowedRoles = PERMISSIONS[requiredPermission];
      console.log("allowed roles" , allowedRoles)
      if (!allowedRoles || !allowedRoles.includes(permission.role)) {
        return next(new Error("Access Denied! cannot perform this action"));
      }

      socket.data.userRole = permission.role;
      socket.data.documentId = documentId;
      next();
      
    } catch (err) {
      console.error(err);
      next(new Error("Internal Server Error"));
    }
  };
};