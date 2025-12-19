import * as Y from "yjs";
import { prisma } from "../infrastructure/database.js";
import { logger } from "../infrastructure/logger.js";

export async function loadYjsDocument(
  docID: string,
): Promise<Uint8Array | null> {
  try {
    const document = await prisma.document.findUnique({
      where: {
        id: docID,
      },
      select: {
        content: true,
      },
    });
    if (!document?.content) {
      logger.info(`no save state found for doc ${docID}`);
      return null;
    }
    return new Uint8Array(document.content);
  } catch (err) {
    console.error("Error loading Yjs document:", err);
    return null;
  }
}
