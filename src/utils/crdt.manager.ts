import { logger } from "../infrastructure/logger.js";
import { SharedCRDT } from "../shared/crdt.js";
import type { CustomDocumentData } from "../types/documents.js";
import { prisma } from "../infrastructure/database.js";

export const customDocuments = new Map<string, CustomDocumentData>();
const SAVE_INTERVAL = 30000; // 30 seconds

export async function joinCustomDocument(
  docID: string,
  userId: string,
  socketId: string,
) {
  try {
    logger.info(`User ${userId} joining Custom CRDT doc ${docID}`);

    if (!customDocuments.has(docID)) {
      const crdt = new SharedCRDT();

      // Load from DB
      const savedDoc = await prisma.document.findUnique({
        where: { id: docID },
        select: { content: true },
      });

      if (savedDoc?.content) {
        try {
          const jsonString = Buffer.from(savedDoc.content).toString("utf-8");
          const state = JSON.parse(jsonString);
          crdt.load(state);
          logger.info(`Loaded Custom CRDT state for doc ${docID}`);
        } catch (e) {
          logger.warn(
            e,
            `Failed to parse saved state for doc ${docID}. Resetting document state.`,
          );
          // Fallback: Do nothing, crdt is already initialized as empty
        }
      } else {
        logger.info(`Initializing new Custom CRDT doc ${docID}`);
      }

      customDocuments.set(docID, {
        crdt,
        connections: new Set(),
        lastSaved: Date.now(),
      });
    }

    const docData = customDocuments.get(docID)!;
    docData.connections.add(socketId);

    return {
      success: true,
      state: docData.crdt.getAll(),
    };
  } catch (error: any) {
    logger.error(error, "Error in joinCustomDocument");
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
}

export async function persistCustomDocument(docID: string) {
  const docData = customDocuments.get(docID);
  if (!docData) return;

  try {
    const state = docData.crdt.getAll();
    const jsonString = JSON.stringify(state);
    const buffer = Buffer.from(jsonString, "utf-8");

    await prisma.document.update({
      where: { id: docID },
      data: { content: buffer },
    });

    docData.lastSaved = Date.now();
    logger.info(`Persisted Custom CRDT document ${docID}`);
  } catch (err) {
    logger.error(err, `Error persisting Custom CRDT doc ${docID}`);
  }
}

export function startCrdtPersistence() {
  setInterval(() => {
    logger.info("Running periodic Custom CRDT persistence check...");
    customDocuments.forEach((_docData, docID) => {
      persistCustomDocument(docID);
    });
  }, SAVE_INTERVAL);
}
