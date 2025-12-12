import express from "express";
import cors from "cors";
import { env } from "./infrastructure/envConfig.js"
import helmet from "helmet";
import { logger } from "./infrastructure/logger.js";
import { prisma } from "./infrastructure/database.js";
import authRouter from "./routes/auth.route.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import documentRouter from "./routes/docs.route.js";
import notificationRouter from "./routes/notification.route.js";
import { initCollabServer } from "./sockets/socket.server.js";
import { createServer } from "http";
import { startPersistence } from "./utils/document.manager.js";


const app = express();
const httpServer = createServer(app);
app.use(helmet());
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use(cors({
  origin:(origin, callback)=>{
    const allowedOrigins = JSON.parse(env.CORS_ORIGIN);
    if(!origin || allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    }else{
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use("/auth" , authRouter);
app.use("/docs" , documentRouter )
app.use("/notifications", notificationRouter);


app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


logger.info(`Environment: ${env.NODE_ENV}`);

app.use(globalErrorHandler);


const startServer = async ()=>{
  try{
    await prisma.$connect();
    logger.info("Connected to the database successfully.");

    const io = initCollabServer(httpServer);
    logger.info("socket.io server initilized");

    httpServer.listen(PORT, '0.0.0.0', ()=>{
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`socket ready`);
    }); 
  }catch(error){
    logger.error("Failed to start the server: Database connection error");
    await prisma.$disconnect();
    process.exit(1);
  }
}
startServer();
startPersistence();
export{httpServer , app};