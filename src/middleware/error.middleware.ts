import type { ErrorRequestHandler } from "express";
import { ApiError } from "../core/ApiError.js";
import { stat } from "fs";
import { logger } from "../infrastructure/logger.js";
import { success } from "zod";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (!(err instanceof ApiError) || !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  } else {
    logger.warn("error: ", statusCode, message);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
