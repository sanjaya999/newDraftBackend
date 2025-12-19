import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { validationError } from "../core/validationError.js";
import { ApiError } from "../core/ApiError.js";
import type { ZodError } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const errorMessage = validationError(error);
      return next(new ApiError(errorMessage, 400));
    }
  };
