import type { Document, DocumentRole, Prisma } from "@prisma/client";
import type{ CreateDocumentInput, UpdateDocumentInput } from "../types/documents.js";
import { prisma } from "../infrastructure/database.js";

export const documentSelectPublic = {
    id: true,
    title: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
}satisfies Prisma.DocumentSelect;

export type PublicDocument = Prisma.DocumentGetPayload<{
    select: typeof documentSelectPublic;
}>

export const documentSelectWithContent = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

export type DocumentWithContent = Prisma.DocumentGetPayload<{
  select: typeof documentSelectWithContent;
}>;

export async function createDocument(
  ownerId: string,
  createDocumentInput: CreateDocumentInput 
): Promise<PublicDocument> {
  return prisma.document.create({
    data: {
      title: createDocumentInput.title ?? 'Untitled Document',
      content: createDocumentInput.content ?? null,
      ownerId,
    },
    select: documentSelectPublic,
  });
}

export async function findDocumentById(id: string): Promise<PublicDocument | null> {
  return prisma.document.findUnique({
    where: { id },
    select: documentSelectPublic,
  });
}

export async function findDocumentWithContent(id: string): Promise<DocumentWithContent | null> {
  return prisma.document.findUnique({
    where: { id },
    select: documentSelectWithContent,
  });
}


export async function updateDocument(
  id: string,
  input: UpdateDocumentInput,
  selectPublic = true
) {
  return prisma.document.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
    },
    select: selectPublic ? documentSelectPublic : documentSelectWithContent,
  });
}


export async function deleteDocument(id: string): Promise<Document> {
  return prisma.document.delete({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function upsertDocumentPermission(
  documentId: string,
  userId: string,
  role: DocumentRole
) {
  return prisma.documentPermission.upsert({
    where: { userId_documentId: { userId, documentId } },
    update: { role },
    create: { userId, documentId, role },
  });
}

export async function getDocumentCollaborators(documentId: string) {
  return prisma.documentPermission.findMany({
    where: { documentId },
    include: {
      user: {
        select: { id: true, email: true, name: true }
      }
    }
  });
}

export async function deleteDocumentPermission(permissionId: string) {
  return prisma.documentPermission.delete({
    where: { id: permissionId }
  });
}