import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ApiError } from "../core/ApiError.js";
import type{ Response,  NextFunction, Request } from "express";
import { logger } from "../infrastructure/logger.js";
import { url } from "inspector";

const createErrorResponse = (err: Error, res: Response)=>{
    let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message: string = ReasonPhrases.INTERNAL_SERVER_ERROR;

    if(err instanceof ApiError){
        statusCode = err.statusCode;
        message = err.message;
    }

    if(process.env.NODE_ENV === 'production'){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }

    if (err instanceof ApiError && err.isOperational) {
        return res.status(statusCode).json({
            status: 'error',
            message: message 
        });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR 
    });
    
}

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error({
        err: {
            name: err.name,
            message: err.message,
            stack: err.stack
        },
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    },
    'Global Error Handler Caught an Error'
)
    if(res.headersSent){
        return next(err);
    }   
    createErrorResponse(err, res);
}