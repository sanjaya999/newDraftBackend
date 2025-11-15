
import { DocumentRole } from '@prisma/client';

export const PERMISSIONS: { [key: string]: DocumentRole[] } = {
  CREATE_DOCUMENT: [DocumentRole.OWNER, DocumentRole.EDITOR, DocumentRole.VIEWER], 
  READ_DOCUMENT: [DocumentRole.OWNER, DocumentRole.EDITOR, DocumentRole.VIEWER],
  UPDATE_DOCUMENT: [DocumentRole.OWNER, DocumentRole.EDITOR],
  DELETE_DOCUMENT: [DocumentRole.OWNER],
  
  SHARE_DOCUMENT: [DocumentRole.OWNER],
  MANAGE_PERMISSIONS: [DocumentRole.OWNER],
  ADD_COLLABORATOR: [DocumentRole.OWNER],
  REMOVE_COLLABORATOR: [DocumentRole.OWNER],
  
  CREATE_COMMENT: [DocumentRole.OWNER, DocumentRole.EDITOR, DocumentRole.VIEWER],
  DELETE_COMMENT: [DocumentRole.OWNER, DocumentRole.EDITOR],
};

export type PermissionAction = keyof typeof PERMISSIONS;

export { DocumentRole };