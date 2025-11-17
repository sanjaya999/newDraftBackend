import { DocumentRole } from '@prisma/client';
import * as Y from 'yjs'

export interface DocumentData{
  ydoc: Y.Doc;
  connections: Set<string>;
  lastSaved : string
}
export interface DocumentMetaData {
    id: string;
    title: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}


export interface CreateDocumentInput {
  title?: string;
  // content?: any;
}

export interface UpdateDocumentInput {
  title?: string;
  // content?: any;
}

export interface ShareDocumentInput {
  documentId: string;
  userEmail: string;
  role: DocumentRole;
}

export interface UpdatePermissionInput {
  permissionId: string;
  role: DocumentRole;
}

export interface DocumentAccessCheck {
  hasAccess: boolean;
  role?: DocumentRole;
  isOwner: boolean;
}

export interface WSMessage {
  type: 'sync' | 'awareness' | 'ping' | 'pong';
  documentId?: string;
  data?: Uint8Array;
}

export interface ConnectedClient {
  userId: string;
  userName: string | null;
  role: DocumentRole;
  lastSeen: Date;
}