import { getIO } from "../sockets/socket.server.js";
import { prisma } from "../infrastructure/database.js"
import { userSocketMap } from "../sockets/socket.server.js";

export const notificationController = async(recipientId : string,
    message: string ,
    documentId: string,
    actorId: string
) => {
    const notification = await prisma.notification.create({
        data:{
            recipientId,
            message: message,
            documentId,
            actorId,
            type: "DOCUMENT_SHARED"
        },
        include :{ actor:true,  document: true}
    })

    const socketId = userSocketMap.get(recipientId);
    if(socketId){
        getIO().to(socketId).emit("notification:new", notification);
    }
}

export const getUserNotifications = async (req: any, res: any) => {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
        where: {
            recipientId: userId,
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 20,
        include:{
            actor: true, document: true
        }
    });

    res.status(200).json({
        success: true,
        data: notifications
    });
}
