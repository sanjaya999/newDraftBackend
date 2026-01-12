import type {
  Document,
  DocumentRole,
  User,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../types/documents.js";
import type { IDocumentRepository } from "../interfaces/index.js";

export const documentSelectPublic = {
  id: true,
  title: true,
  ownerId: true,
  docType: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

export type PublicDocument = Prisma.DocumentGetPayload<{
  select: typeof documentSelectPublic;
}>;

/**
 * DocumentRepository handles all document-related database operations.
 * Implements IDocumentRepository interface for dependency injection.
 */
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    ownerId: string,
    input: CreateDocumentInput
  ): Promise<PublicDocument> {
    return this.prisma.document.create({
      data: {
        title: input.title ?? "Untitled Document",
        ...(input.docType && { docType: input.docType }),
        ownerId,
      },
      select: documentSelectPublic,
    });
  }

  async findById(id: string): Promise<PublicDocument | null> {
    return this.prisma.document.findUnique({
      where: { id },
      select: documentSelectPublic,
    });
  }

  async findByOwnerId(ownerId: string): Promise<PublicDocument[]> {
    return this.prisma.document.findMany({
      where: { ownerId },
      select: documentSelectPublic,
    });
  }

  async update(id: string, input: UpdateDocumentInput): Promise<PublicDocument> {
    return this.prisma.document.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
      },
      select: documentSelectPublic,
    });
  }

  async delete(id: string): Promise<Document> {
    return this.prisma.document.delete({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async upsertPermission(
    documentId: string,
    userId: string,
    role: DocumentRole
  ): Promise<{ id: string; role: DocumentRole }> {
    return this.prisma.documentPermission.upsert({
      where: { userId_documentId: { userId, documentId } },
      update: { role },
      create: { userId, documentId, role },
    });
  }

  async getCollaborators(documentId: string) {
    return this.prisma.documentPermission.findMany({
      where: { documentId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async getCollaborationDocuments(userId: string) {
    return this.prisma.documentPermission.findMany({
      where: { userId },
      include: {
        document: {
          select: { id: true, title: true, docType: true },
        },
      },
    });
  }

  async deletePermission(permissionId: string): Promise<void> {
    await this.prisma.documentPermission.delete({
      where: { id: permissionId },
    });
  }
}

// Backward compatibility exports for gradual migration
import { prisma } from "../infrastructure/database.js";

const defaultRepository = new DocumentRepository(prisma);

export async function createDocument(
  ownerId: string,
  createDocumentInput: CreateDocumentInput
): Promise<PublicDocument> {
  return defaultRepository.create(ownerId, createDocumentInput);
}

export async function findDocumentById(
  id: string
): Promise<PublicDocument | null> {
  return defaultRepository.findById(id);
}

export async function findDocument(
  id: string
): Promise<PublicDocument[] | null> {
  return defaultRepository.findByOwnerId(id);
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  return defaultRepository.update(id, input);
}

export async function deleteDocument(id: string): Promise<Document> {
  return defaultRepository.delete(id);
}

export async function findUserByEmail(email: string) {
  return defaultRepository.findUserByEmail(email);
}

export async function upsertDocumentPermission(
  documentId: string,
  userId: string,
  role: DocumentRole
) {
  return defaultRepository.upsertPermission(documentId, userId, role);
}

export async function getDocumentCollaborators(documentId: string) {
  return defaultRepository.getCollaborators(documentId);
}

export async function getCollaborationDocument(userId: string) {
  return defaultRepository.getCollaborationDocuments(userId);
}

export async function deleteDocumentPermission(permissionId: string) {
  return defaultRepository.deletePermission(permissionId);
}
