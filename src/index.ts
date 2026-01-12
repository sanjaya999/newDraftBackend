import express from "express";
import cors from "cors";
import { env } from "./infrastructure/envConfig.js";
import helmet from "helmet";
import { logger } from "./infrastructure/logger.js";
import { prisma } from "./infrastructure/database.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { initCollabServer } from "./sockets/socket.server.js";
import { createServer } from "http";
import { startPersistence } from "./utils/document.manager.js";
import { globalLimiter } from "./utils/rateLimiter.js";

// Import DI container and bootstrap
import { bootstrapContainer } from "./infrastructure/container.js";

// Import route factories
import { createAuthRouter } from "./routes/auth.route.js";
import { createDocumentRouter } from "./routes/docs.route.js";
import { createNotificationRouter } from "./routes/notification.route.js";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = JSON.parse(env.CORS_ORIGIN);
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(globalLimiter);

// Health check (before DI bootstrap)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

logger.info(`Environment: ${env.NODE_ENV}`);

app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully.");

    // Bootstrap DI container after database connection
    bootstrapContainer(prisma);
    logger.info("Dependency injection container initialized.");

    // Register routes using DI-injected controllers
    app.use("/auth", createAuthRouter());
    app.use("/docs", createDocumentRouter());
    app.use("/notifications", createNotificationRouter());
    logger.info("Routes registered with DI controllers.");

    const io = initCollabServer(httpServer);
    logger.info("socket.io server initialized");

    httpServer.listen(env.PORT, () => {
      logger.info(`Server is running on http://localhost:${env.PORT}`);
      logger.info(`socket ready`);
    });
  } catch (error) {
    logger.error("Failed to start the server: Database connection error");
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
startPersistence();

export { httpServer, app };
