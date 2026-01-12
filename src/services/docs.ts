import type { DocumentRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../core/ApiError.js";
import type {
  IDocumentService,
  IDocumentRepository,
  INotificationService,
  ServiceResult,
  CollaboratorResult,
} from "../interfaces/index.js";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../types/documents.js";

/**
 * DocumentService handles document business logic.
 * Implements IDocumentService interface for dependency injection.
 * 
 * Follows Single Responsibility Principle: only handles document logic.
 * Follows Dependency Inversion Principle: depends on abstractions.
 */
export class DocumentService implements IDocumentService {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly notificationService: INotificationService
  ) {}

  async create(
    ownerId: string,
    input: CreateDocumentInput
  ): Promise<ServiceResult<any>> {
    const document = await this.documentRepository.create(ownerId, input);
    return {
      data: document,
      message: "Document created successfully",
    };
  }

  async getById(
    id: string,
    userId: string
  ): Promise<ServiceResult<any>> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
    }

    if (document.ownerId !== userId) {
      const collaborators = await this.documentRepository.getCollaborators(id);
      const hasAccess = collaborators.some((collab) => collab.userId === userId);

      if (!hasAccess) {
        throw new ApiError(
          "You don't have access to this document",
          StatusCodes.FORBIDDEN
        );
      }
    }

    return { data: document, message: "Document fetched successfully" };
  }

  async getAll(userId: string): Promise<ServiceResult<any[]>> {
    const documents = await this.documentRepository.findByOwnerId(userId);
    if (!documents) {
      throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
    }
    return { data: documents, message: "Documents fetched successfully" };
  }

  async getAllCollaborationDocuments(userId: string): Promise<ServiceResult<any>> {
    const documents = await this.documentRepository.getCollaborationDocuments(userId);
    return { data: documents, message: "Collaboration documents fetched successfully" };
  }

  async getCollaborators(documentId: string): Promise<ServiceResult<any>> {
    const collaborators = await this.documentRepository.getCollaborators(documentId);
    return { data: collaborators, message: "Collaborators fetched successfully" };
  }

  async addCollaborator(
    documentId: string,
    requesterId: string,
    email: string,
    role: DocumentRole
  ): Promise<ServiceResult<CollaboratorResult>> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new ApiError("Document not found", StatusCodes.NOT_FOUND);
    }

    if (document.ownerId !== requesterId) {
      throw new ApiError(
        "Only the owner can add collaborators",
        StatusCodes.FORBIDDEN
      );
    }

    const user = await this.documentRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(
        "User with this email does not exist",
        StatusCodes.NOT_FOUND
      );
    }

    if (user.id === document.ownerId) {
      throw new ApiError(
        "Owner cannot be added as collaborator",
        StatusCodes.BAD_REQUEST
      );
    }

    const permissions = await this.documentRepository.upsertPermission(
      documentId,
      user.id,
      role
    );

    await this.notificationService.send(
      user.id,
      `You have been added as a ${role} to "${document.title}"`,
      documentId,
      requesterId
    );

    return {
      data: {
        id: user.id,
        email: user.email,
        role: permissions.role,
        permissionId: permissions.id,
      },
      message: "Collaborator added successfully",
    };
  }

  async update(
    id: string,
    input: UpdateDocumentInput
  ): Promise<ServiceResult<any>> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new ApiError("No document found", StatusCodes.NOT_FOUND);
    }

    const updatedDocument = await this.documentRepository.update(id, input);
    return {
      data: updatedDocument,
      message: "Document updated successfully",
    };
  }
}

// Backward compatibility exports for gradual migration
import {
  createDocument,
  findDocumentById,
  getDocumentCollaborators,
  upsertDocumentPermission,
  updateDocument,
  findDocument,
  getCollaborationDocument,
} from "../repository/document.repository.js";
import { findUserByEmail } from "../repository/user.repository.js";
import { notificationController } from "../api/notification.controller.js";

// Create compatibility adapters
const compatDocRepo = {
  create: createDocument,
  findById: findDocumentById,
  findByOwnerId: (ownerId: string) => findDocument(ownerId).then(docs => docs || []),
  update: updateDocument,
  delete: async (id: string) => { throw new Error("Not implemented"); },
  findUserByEmail,
  upsertPermission: upsertDocumentPermission,
  getCollaborators: getDocumentCollaborators,
  getCollaborationDocuments: getCollaborationDocument,
  deletePermission: async () => {},
};

const compatNotificationService = {
  send: notificationController,
};

const defaultDocumentService = new DocumentService(
  compatDocRepo as any,
  compatNotificationService
);

export async function createNewDocument(
  ownerId: string,
  createDocumentInput: CreateDocumentInput
) {
  const result = await defaultDocumentService.create(ownerId, createDocumentInput);
  return { document: result.data, message: result.message };
}

export async function getAllDocument(userId: string) {
  const result = await defaultDocumentService.getAll(userId);
  return { document: result.data };
}

export async function getDocumentCollaboratorsService(id: string) {
  const result = await defaultDocumentService.getCollaborators(id);
  return { collaborators: result.data };
}

export async function getAllCollaborationDocument(userId: string) {
  const result = await defaultDocumentService.getAllCollaborationDocuments(userId);
  return { documents: result.data };
}

export async function getDocumentById(id: string, userId: string) {
  const result = await defaultDocumentService.getById(id, userId);
  return { document: result.data };
}

export async function addCollaborator(
  documentId: string,
  requesterId: string,
  email: string,
  role: DocumentRole
) {
  const result = await defaultDocumentService.addCollaborator(
    documentId,
    requesterId,
    email,
    role
  );
  return { collaborator: result.data };
}

export async function updateDocumentService(
  input: UpdateDocumentInput,
  docsId: string
) {
  const result = await defaultDocumentService.update(docsId, input);
  return { document: result.data, message: result.message };
}
