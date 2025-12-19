import pino from "pino";

const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",

  base: {
    pid: process.pid,
    service: "draft-backend",
  },

  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : (undefined as any),
};
export const logger = pino(loggerConfig);

logger.info(`Logger initialized at level: ${loggerConfig.level}`);
