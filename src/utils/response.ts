import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { success } from "zod";

interface ApiResponseData<T =any>{
    data: T;
    message?: string;
}

export const sendResponse= <T>(
    res: Response,
    statusCodes: number,
    payload: ApiResponseData<T>
) =>{
        res.status(statusCodes).json({
            success: true,
            message: payload.message,
            data: payload.data,
        });
    }

