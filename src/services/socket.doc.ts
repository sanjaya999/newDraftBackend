import type { Socket } from "socket.io";
import { documents, joinDocument, persistDocument } from "../utils/document.manager.js";
import { logger } from "../infrastructure/logger.js";
import * as Y from "yjs";
import { checkDocumentPermission } from "./permissionService.js";
import { PERMISSIONS } from "../types/permissions.js";
import { SharedCRDT } from "../shared/crdt.js";
import type { CustomDocumentData } from "../types/documents.js";

const customDocuments = new Map<string, CustomDocumentData>();

async function onDocumentJoin(
  socket: Socket,
  userId: string,
  docID: string,
  callback: (resp: any) => void
) {
  try {
    socket.join(docID);
    const result = await joinDocument(docID, userId, socket.id);

    if (result.success) {
      callback({
        success: true,
        state: result.state,
      })
      logger.info(`User ${userId} joined doc ${docID}`);
    } else {
      callback({ success: false, error: result.error });
    }
  } catch (err: any) {
    logger.error(`Error in document:join:`, err);
    callback({ success: false, error: "Server error" });
  }
}

export async function onDocumentSync(socket: Socket, docID: string, update: Uint8Array) {
  try {
    const docData = documents.get(docID);
    if (docData) {
      Y.applyUpdate(docData.ydoc, update, socket.id);
      socket.to(docID).emit("document:sync", update);
    }
  } catch (err: any) {
    logger.error(`Error in document:sync:`, err);
  }
}

function onDisconnect(socket: Socket) {
  logger.info(`Socket ${socket.id} disconnected`);

  socket.rooms.forEach((docID) => {
    if (docID === socket.id) return;

    const docData = documents.get(docID);
    if (docData) {
      docData.connections.delete(socket.id);
      logger.info(`Removed ${socket.id} from doc ${docID}`);

      if (docData.connections.size === 0) {
        logger.info(`Document ${docID} is empty. Persisting and removing.`);
        persistDocument(docID);
        docData.ydoc.destroy();
        documents.delete(docID);
      }
    }
    const cDoc = customDocuments.get(docID);
    if (cDoc) {
      cDoc.connections.delete(socket.id);
      if (cDoc.connections.size === 0) {
         customDocuments.delete(docID); 
      }
    }
  });
}

function onDocumentAwareness(socket: Socket, docID: string, update: Uint8Array) {
  socket.to(docID).emit("document:awareness", update);
}


async function onCustomDocumentJoin(
  socket: Socket,
  userId: string,
  docID: string,
  callback: (resp: any) => void
) {
  try {
    socket.join(docID);
    
    if (!customDocuments.has(docID)) {
       customDocuments.set(docID, { 
         crdt: new SharedCRDT(), 
         connections: new Set(), 
         lastSaved: Date.now() 
       });
    }
    
    const docData = customDocuments.get(docID)!;
    docData.connections.add(socket.id);

    callback({ success: true, state: docData.crdt.getAll() });
    
    logger.info(`User ${userId} joined Custom CRDT ${docID}`);
  } catch (err: any) {
  }
}

export async function onCustomDocumentSync(socket: Socket, docID: string, update: Uint8Array) {
  try {
    const docData = documents.get(docID);
    if (docData) {
      Y.applyUpdate(docData.ydoc, update, socket.id);
      socket.to(docID).emit("document:sync", update);
    }
  } catch (err: any) {
    logger.error(`Error in document:sync:`, err);
  }
}

function onCustomDocumentAwareness(socket: Socket, docID: string, update: any) {
  socket.to(docID).emit("cdocument:awareness", {
    userId: socket.id,
    ...update
  });
}


function onCustomDocumentUpdate(socket: Socket, docID: string, update: any) {
  const docInstance = customDocuments.get(docID)
  if (docInstance) {
    const changed = docInstance.crdt.merge(update);
    
    if (changed) {
      socket.to(docID).emit("cdocument:update", update);
    }
  }
}

export function registerDocumentHandlers(socket: Socket) {
  const userId = socket.data.user.id || "anonymous";
  logger.info(`Registering handlers for socket ${socket.id} (User ${userId})`);

  socket.on("document:join", async (docID, callback) => {
    try {
      await checkDocumentPermission(userId, docID, "READ_DOCUMENT");
      onDocumentJoin(socket, userId, docID, callback);
    } catch (error: any) {
      logger.warn(`User ${userId} denied access to document ${docID}: ${error.message}`);
      callback({ success: false, error: error.message || "Access denied" });
    }
  });

  socket.on("document:sync", async (docID, update) => {
    try {
      await checkDocumentPermission(userId, docID, "UPDATE_DOCUMENT");
      onDocumentSync(socket, docID, update);
    } catch (error: any) {
      logger.warn(`User ${userId} denied sync access to document ${docID}: ${error.message}`);
      socket.emit("document:error", {
        docID,
        error: error.message || "Access denied"
      });
    }
  });

  socket.on("document:awareness", async (docID, update) => {
    try {
      await checkDocumentPermission(userId, docID, "READ_DOCUMENT");
      onDocumentAwareness(socket, docID, update);
    } catch (error: any) {
      logger.warn(`User ${userId} denied awareness access to document ${docID}: ${error.message}`);
    }
  });
  // Custom CRDT Document Handlers
  socket.on("cdocument:join", async (docID, callback) => {
    try {
      await checkDocumentPermission(userId, docID, "READ_DOCUMENT");
      onCustomDocumentJoin(socket, userId, docID, callback);
    } catch (error: any) {
      logger.warn(`User ${userId} denied access to custom doc ${docID}: ${error.message}`);
      callback({ success: false, error: error.message || "Access denied" });
    }
  });

  socket.on("cdocument:sync", async (docID, update) => {
    try {
      await checkDocumentPermission(userId, docID, "UPDATE_DOCUMENT");
      onCustomDocumentSync(socket, docID, update);
    } catch (error: any) {
      logger.warn(`User ${userId} denied sync access to custom doc ${docID}: ${error.message}`);
      socket.emit("cdocument:error", {
        docID,
        error: error.message || "Access denied"
      });
    }
  });

  socket.on("cdocument:update", async ({ docID, update }) => {
    try {
      await checkDocumentPermission(userId, docID, "UPDATE_DOCUMENT");
      onCustomDocumentUpdate(socket, docID, update);
    } catch (error: any) {
      logger.warn(`User ${userId} denied update to custom doc ${docID}`);
    }
  });

socket.on("cdocument:awareness", async ({ docID, Selection }) => {
  try {
  
    await checkDocumentPermission(userId, docID, "READ_DOCUMENT");
    
    if (Selection) {
        onCustomDocumentAwareness(socket, docID, Selection);
    }
  } catch (error: any) {
  }
});

  socket.on("disconnect", () => {
    onDisconnect(socket);
  });
}