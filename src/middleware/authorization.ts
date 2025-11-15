import type { Request, Response, NextFunction } from "express";
import { PERMISSIONS, type PermissionAction } from "../types/permissions.js";
import { ApiError } from "../core/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../infrastructure/database.js";

export const authorize = (requiredPermission: PermissionAction) =>{
    return async(req: Request , res: Response, next: NextFunction)=>{
            const userId = req.user.id;
            if(!userId){
                throw new ApiError("Unauthorize, Login first" , StatusCodes.UNAUTHORIZED);
            }

            const documentId = req.params.docID || req.body.documentId;
            if(!documentId){
                throw new ApiError("Document Id not found" , StatusCodes.BAD_REQUEST);
            }
            const document = await prisma.document.findUnique({
                where: { id: documentId },
                select: { ownerId: true }
            });
             if (!document) {
                return next(new ApiError("Document not found", StatusCodes.NOT_FOUND));
            }
                if (document.ownerId === userId) {
                    req.userRole = "OWNER";
                    req.documentId = documentId;
                    return next();
                }

            const permission = await prisma.documentPermission.findUnique({
            where: {
                userId_documentId: {
                userId,
                documentId
                    }
                },
                select: { role: true }
            });

            if(!permission){
                throw new ApiError("Access Denied - You dont have permission" , StatusCodes.FORBIDDEN)
            }
            const userRole = permission.role;

            const allowedRoles = PERMISSIONS[requiredPermission];
            if(!allowedRoles){
                throw new ApiError("Invalid permission configuration" , StatusCodes.INTERNAL_SERVER_ERROR)
            }
            if(!allowedRoles.includes(userRole)){
                throw new ApiError("Access Denied! cannot perform this action" , StatusCodes.FORBIDDEN)
            }

           
            req.userRole = userRole;
            req.documentId = documentId;

            next();
    }
}