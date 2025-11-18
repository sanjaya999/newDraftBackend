import { logger } from "../infrastructure/logger.js";
import { findDocumentWithContent } from "../repository/document.repository.js";
import type { DocumentData } from "../types/documents.js";
import * as Y from "yjs"
import { loadYjsDocument } from "./yjs.persistence.js";
import { success } from "zod";
import { prisma } from "../infrastructure/database.js";

export const documents = new Map<string, DocumentData>();
const SAVE_INTERVAL = 30000

export async function joinDocument(
    docID: string,
    userId: string,
    socketId: string,
){
    try{
        logger.info(`User ${userId} joining the document ${docID}`)

        if(!documents.has(docID)){
            const ydoc = new Y.Doc();

            const savedState = await loadYjsDocument(docID);
            if(savedState){
                Y.applyUpdate(ydoc, savedState);
                logger.info(`loading yjs state for doc ${docID}`);
            }else{
                logger.info(`Initialize dnew Yjs doc ${docID}`)
            }
            documents.set(docID, {
                ydoc,
                connections: new Set(),
                lastSaved: new Date().toISOString()
            });
        }
        const docData = documents.get(docID)!;
        docData?.connections.add(socketId);

        const state = Y.encodeStateAsUpdate(docData.ydoc);
        return{
            success:true,
            state: Array.from(state),
            connectedUsers: docData.connections.size
        }
    }catch(error : any){
        logger.error('Error in joinDocument' , error);
        return {
            success: false,
            error:"Internal Server Error",
        }
    }
}

export  async function persistDocument(docID:string) 
{
    const docData = documents.get(docID);
    if (!docData)return;

    try{
        const state = Y.encodeStateAsUpdate(docData.ydoc);
        const buffer = Buffer.from(state);
        await prisma.document.update({
            where:{
                id: docID
            },
            data:{
                content: buffer
            },
        })
        docData.lastSaved = new Date().toISOString();
        logger.info(`persisted document ${docID}`)
    }catch(err){
        logger.error(`Error persisting doc ${docID}`)
    }
}

export function startPersistence() {
  setInterval(() => {
    logger.info('Running periodic persistence check...');
    documents.forEach((_docData, docID) => {
      persistDocument(docID);
    });
  }, SAVE_INTERVAL);
}