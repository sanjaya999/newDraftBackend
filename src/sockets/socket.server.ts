import { Server, Socket} from "socket.io";
import type { DocumentData } from "../types/documents.js";
import { env } from "../infrastructure/envConfig.js";
import { StatusCodes } from "http-status-codes";
import { socketAuth } from "../middleware/authenticate.js";
import { logger } from "../infrastructure/logger.js";
import { joinDocument, persistDocument } from "../utils/document.manager.js";
import { success } from "zod";
import { registerDocumentHandlers } from "../services/socket.doc.js";
import { socketAuthorize } from "../middleware/authorization.js";

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
    // io.use(socketAuthorize("read"))
    

    io.on('connection' , (socket: Socket) =>{
    registerDocumentHandlers(socket);
    })

}