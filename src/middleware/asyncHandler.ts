import type { NextFunction, RequestHandler, Request, Response } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
)=> Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler) : RequestHandler =>{
    return (req:Request , res: Response, next: NextFunction)=>{
        fn(req, res, next).catch(next);
    };
}