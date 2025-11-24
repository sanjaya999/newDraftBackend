import { Server, Socket} from "socket.io";
import type { DocumentData } from "../types/documents.js";
import { env } from "../infrastructure/envConfig.js";
import { socketAuth } from "../middleware/authenticate.js";
import { registerDocumentHandlers } from "../services/socket.doc.js";
import { registerCrdtHandlers } from "../services/socket.crdt.js";
import { notificationHandler } from "../services/notificationHandler.js";

const documents= new Map<string, DocumentData>();
export const userSocketMap = new Map<string, string>();
let io: Server;

export function initCollabServer(httpServer:any) : Server {
    const allowedOrigins = JSON.parse(env.CORS_ORIGIN);
    if (io) {
        return io; 
    }
    io = new Server(httpServer, {
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

export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

function setupSocketHandlers(io: Server){
    io.use(socketAuth);
    // io.use(socketAuthorize("read"))
    

    io.on('connection' , (socket: Socket) =>{
    const userId = socket.data.user?.id;
    if(userId){
        userSocketMap.set(userId, socket.id);
        socket.on('disconnect', () => {
            userSocketMap.delete(userId);
        });
    }
    registerDocumentHandlers(socket);
    registerCrdtHandlers(socket);
    notificationHandler(socket);
    })

}