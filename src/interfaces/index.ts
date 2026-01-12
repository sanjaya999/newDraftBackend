import type { User, DocumentRole, Prisma } from "@prisma/client";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../types/documents.js";

// ============================================================================
// Common Types
// ============================================================================

export type UserWithoutPassword = Omit<User, "password">;

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: UserWithoutPassword;
}

export interface ServiceResult<T> {
  data: T;
  message: string;
}

export interface CollaboratorResult {
  id: string;
  email: string;
  role: DocumentRole;
  permissionId: string;
}

// Public document type (without content field for security)
export interface PublicDocumentData {
  id: string;
  title: string;
  ownerId: string;
  docType: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Repository Interfaces
// ============================================================================

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<UserWithoutPassword | null>;
  create(
    name: string,
    email: string,
    passwordHash: string
  ): Promise<UserWithoutPassword>;
}

/**
 * IDocumentRepository interface.
 * Uses generic return types to allow implementations to return
 * different subsets of Document data (PublicDocument, full Document, etc.)
 */
export interface IDocumentRepository {
  create(ownerId: string, input: CreateDocumentInput): Promise<PublicDocumentData>;
  findById(id: string): Promise<PublicDocumentData | null>;
  findByOwnerId(ownerId: string): Promise<PublicDocumentData[]>;
  update(id: string, input: UpdateDocumentInput): Promise<PublicDocumentData>;
  delete(id: string): Promise<unknown>;
  findUserByEmail(email: string): Promise<User | null>;
  upsertPermission(
    documentId: string,
    userId: string,
    role: DocumentRole
  ): Promise<{ id: string; role: DocumentRole }>;
  getCollaborators(documentId: string): Promise<
    Array<{
      userId: string;
      role: DocumentRole;
      user: { id: string; email: string; name: string };
    }>
  >;
  getCollaborationDocuments(userId: string): Promise<
    Array<{
      document: { id: string; title: string; docType: string };
    }>
  >;
  deletePermission(permissionId: string): Promise<void>;
}

export interface INotificationRepository {
  create(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string,
    type?: string
  ): Promise<void>;
  findUnreadByRecipient(recipientId: string, limit: number): Promise<unknown[]>;
  markAsRead(notificationId: string, recipientId: string): Promise<void>;
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface IAuthService {
  register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
}

export interface IDocumentService {
  create(
    ownerId: string,
    input: CreateDocumentInput
  ): Promise<ServiceResult<PublicDocumentData>>;
  getById(id: string, userId: string): Promise<ServiceResult<PublicDocumentData>>;
  getAll(userId: string): Promise<ServiceResult<PublicDocumentData[]>>;
  getAllCollaborationDocuments(userId: string): Promise<
    ServiceResult<Array<{ document: { id: string; title: string; docType: string } }>>
  >;
  getCollaborators(documentId: string): Promise<
    ServiceResult<
      Array<{
        userId: string;
        role: DocumentRole;
        user: { id: string; email: string; name: string };
      }>
    >
  >;
  addCollaborator(
    documentId: string,
    requesterId: string,
    email: string,
    role: DocumentRole
  ): Promise<ServiceResult<CollaboratorResult>>;
  update(
    id: string,
    input: UpdateDocumentInput
  ): Promise<ServiceResult<PublicDocumentData>>;
}

export interface IPermissionService {
  checkDocumentPermission(
    userId: string,
    documentId: string,
    requiredPermission: string
  ): Promise<string>;
}

export interface INotificationService {
  send(
    recipientId: string,
    message: string,
    documentId: string,
    actorId: string
  ): Promise<void>;
}

// ============================================================================
// Token Service Interface
// ============================================================================

export interface ITokenService {
  generateAccessToken(userId: string): string;
  generateRefreshToken(userId: string): string;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
