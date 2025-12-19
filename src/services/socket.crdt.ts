import type { Socket } from "socket.io";
import { logger } from "../infrastructure/logger.js";
import { checkDocumentPermission } from "./permissionService.js";
import {
  customDocuments,
  joinCustomDocument,
  persistCustomDocument,
} from "../utils/crdt.manager.js";

async function onCustomDocumentJoin(
  socket: Socket,
  userId: string,
  docID: string,
  callback: (resp: any) => void,
) {
  try {
    socket.join(docID);
    const result = await joinCustomDocument(docID, userId, socket.id);
    callback(result);
  } catch (err: any) {
    logger.error(`Error in cdocument:join:`, err);
    callback({ success: false, error: "Server error" });
  }
}

export async function onCustomDocumentSync(
  socket: Socket,
  docID: string,
  update: Uint8Array,
) {}

function onCustomDocumentAwareness(socket: Socket, docID: string, update: any) {
  socket.to(docID).emit("cdocument:awareness", {
    userId: socket.id,
    ...update,
  });
}

function onCustomDocumentUpdate(socket: Socket, docID: string, update: any) {
  const docInstance = customDocuments.get(docID);
  if (docInstance) {
    const changed = docInstance.crdt.merge(update);
    if (changed) {
      socket.to(docID).emit("cdocument:update", update);
    }
  }
}

function onDisconnect(socket: Socket) {
  customDocuments.forEach((docData, docID) => {
    if (docData.connections.has(socket.id)) {
      docData.connections.delete(socket.id);
      if (docData.connections.size === 0) {
        logger.info(
          `Custom CRDT Doc ${docID} is empty. Persisting and removing.`,
        );
        persistCustomDocument(docID);
        customDocuments.delete(docID);
      }
    }
  });
}

export function registerCrdtHandlers(socket: Socket) {
  const userId = socket.data.user.id || "anonymous";

  socket.on("cdocument:join", async (docID, callback) => {
    try {
      await checkDocumentPermission(userId, docID, "READ_DOCUMENT");
      onCustomDocumentJoin(socket, userId, docID, callback);
    } catch (error: any) {
      logger.warn(
        `User ${userId} denied access to custom doc ${docID}: ${error.message}`,
      );
      callback({ success: false, error: error.message || "Access denied" });
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
    } catch (error: any) {}
  });
  socket.on("cdocument:leave", (docID: string) => {
    socket.leave(docID);
  });

  socket.on("disconnect", () => {
    onDisconnect(socket);
  });
}
