import { Server, Socket} from "socket.io";
import type { DocumentData } from "../types/documents.js";
import { env } from "../infrastructure/envConfig.js";
import { StatusCodes } from "http-status-codes";
import { socketAuth } from "../middleware/authenticate.js";
import { logger } from "../infrastructure/logger.js";
import { joinDocument, persistDocument } from "../utils/document.manager.js";
import { success } from "zod";

const documents= new Map<string, DocumentData>();

export function initCollabServer(httpServer:any) : Server {
    const allowedOrigins = JSON.parse(env.CORS_ORIGIN);
    const io = new Server(httpServer, {
        cors: {
            origin:(origin, callback)=>{
                if(!origin || allowedOrigins.indexOf(origin) !== -1){
                    callback(null, true);
                }else{
                    callback(new Error("Not allowed by cors"));
                }
            }
            // credentials:true,
        }
    })
    setupSocketHandlers(io);
    return io;
}

function setupSocketHandlers(io: Server){
    io.use(socketAuth);

    io.on('connection' , (socket: Socket) =>{
        const userId = socket.data.user.id;
        const socketId = socket.id;

        logger.info(`Socket ${socketId} connected (User ${userId})`);

        socket.on("document:join" , async(docID: string, callback)=>{
            try{
                socket.join(docID);
                const result = await joinDocument(docID, userId , socketId);
                if(result.success){
                    callback({
                        success:true,
                        state: result.state,
                    })
                    logger.info(`User ${userId} joined doc ${docID}`);
                }else {
                    callback({ success: false, error: result.error });
                }
            }catch (err : any) {
                logger.error(`Error in document:join:`, err);
                callback({ success: false, error: "Server error" });
    }
        })

        socket.on('disconnect' , (reason)=>{
            logger.info(`Socket ${socketId} disconnected`);
            socket.rooms.forEach((docID)=>{
                if(docID === socket.id)return;
                const docData = documents.get(docID);
                if(docData){
                    docData.connections.delete(socket.id);
                    logger.info(`Removed ${socketId} from doc ${docID}`);
                }
                if (docData?.connections.size === 0) {
                    logger.info(`Document ${docID} is now empty. Persisting and removing.`);
          
                    persistDocument(docID);
          
                    docData.ydoc.destroy(); 
                        documents.delete(docID);
                }
            })
        })

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        io.engine.on('connection_error', (err) => {
            console.error(' Connection error:', err);
        });
    })

}