import type { DocumentRole, User } from "@prisma/client";
import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export interface authUser {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
declare global {
  namespace Express {
    interface Request {
      user: authUser;
      userRole?: DocumentRole;
      documentId?: string;
    }
  }
}
