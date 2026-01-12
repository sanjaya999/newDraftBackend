import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "./documents.js";
import type { PublicDocument } from "../repository/document.repository.js";

/**
 * Interface for Document Repository operations.
 * Enables dependency injection and easier unit testing.
 */
export interface IDocumentRepository {
  createDocument(
    ownerId: string,
    input: CreateDocumentInput,
  ): Promise<PublicDocument>;

  findDocumentById(id: string): Promise<PublicDocument | null>;

  findDocument(userId: string): Promise<PublicDocument[] | null>;

  updateDocument(
    id: string,
    input: UpdateDocumentInput,
  ): Promise<PublicDocument>;

  deleteDocument(id: string): Promise<unknown>;

  getDocumentCollaborators(
    documentId: string,
  ): Promise<Array<{ userId: string; role: string }>>;

  getCollaborationDocument(userId: string): Promise<unknown[]>;
}

/**
 * Interface for Notification Service operations.
 * Decouples notification logic from consumers.
 */
export interface INotificationService {
  notifyUser(input: {
    recipientId: string;
    message: string;
    documentId: string;
    actorId: string;
  }): Promise<unknown>;

  notifyCollaboratorAdded(
    recipientId: string,
    documentId: string,
    documentTitle: string,
    role: string,
    actorId: string,
  ): Promise<unknown>;

  getUserNotifications(userId: string, limit?: number): Promise<unknown[]>;
}

/**
 * Interface for Notification Repository operations.
 */
export interface INotificationRepository {
  createNotification(input: {
    recipientId: string;
    message: string;
    documentId: string;
    actorId: string;
    type: string;
  }): Promise<unknown>;

  findNotificationsByRecipient(
    recipientId: string,
    limit?: number,
  ): Promise<unknown[]>;

  markNotificationAsRead(notificationId: string): Promise<unknown>;
}
