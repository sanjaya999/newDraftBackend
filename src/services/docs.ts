import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../types/documents.js";
import {
  createDocument,
  findDocumentById,
  getDocumentCollaborators,
  upsertDocumentPermission,
  updateDocument,
  findDocument,
  getCollaborationDocument,
} from "../repository/document.repository.js";
import { ApiError } from "../core/ApiError.js";
import { StatusCodes } from "http-status-codes";
import type { Document, DocumentRole } from "@prisma/client";
import { findUserByEmail } from "../repository/user.repository.js";
import { notificationController } from "../api/notification.controller.js";

export async function createNewDocument(
  ownerId: string,
  createDocumentInput: CreateDocumentInput,
) {
  const document = await createDocument(ownerId, createDocumentInput);

  return {
    document,
    message: "Document created successfully",
  };
}
export async function getAllDocument(userId: string) {
  const document = await findDocument(userId);
  if (!document) {
    throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
  }
  return { document };
}

export async function getDocumentCollaboratorsService(id: string) {
  const collaborators = await getDocumentCollaborators(id);
  return { collaborators };
}
export async function getAllCollaborationDocument(userId: string) {
  const documents = await getCollaborationDocument(userId);
  return { documents };
}

export async function getDocumentById(id: string, userId: string) {
  const document = await findDocumentById(id);

  if (!document) {
    throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
  }

  if (document.ownerId !== userId) {
    const collaborators = await getDocumentCollaborators(id);
    const hasAccess = collaborators.some((collab) => collab.userId === userId);

    if (!hasAccess) {
      throw new ApiError(
        "You don't have access to this document",
        StatusCodes.FORBIDDEN,
      );
    }
  }

  return { document };
}

export async function addCollaborator(
  documentId: string,
  requesterId: string,
  email: string,
  role: DocumentRole,
) {
  const document = await findDocumentById(documentId);
  if (!document) {
    throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
  }
  if (document.ownerId !== requesterId) {
    throw new ApiError(
      "Only the owner can add collaborators",
      StatusCodes.FORBIDDEN,
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(
      "User with this email does not exist",
      StatusCodes.NOT_FOUND,
    );
  }

  if (user.id === document.ownerId) {
    throw new ApiError(
      "Owner cannot be added as collaborator",
      StatusCodes.BAD_REQUEST,
    );
  }

  const permissions = await upsertDocumentPermission(documentId, user.id, role);

  await notificationController(
    user.id,
    `You have been added as a ${role} to "${document.title}"`,
    documentId,
    requesterId,
  );

  return {
    collaborator: {
      id: user.id,
      email: user.email,
      role: permissions.role,
      permissionId: permissions.id,
    },
  };
}

export async function updateDocumentService(
  input: UpdateDocumentInput,
  docsId: string,
) {
  const document = await findDocumentById(docsId);
  if (!document) {
    throw new ApiError("No document found", StatusCodes.NOT_FOUND);
  }

  const updatedDocument = await updateDocument(docsId, input);
  return {
    document: updatedDocument,
    message: "Document updated successfully",
  };
}
