import type {Request, Response, NextFunction } from "express";
import { ApiError } from "../core/ApiError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../infrastructure/envConfig.js";
import  { asyncHandler } from "./asyncHandler.js";
import { findUserById } from "../repository/user.repository.js";
import type { Socket } from "socket.io";

export const authenticate = asyncHandler(async(req:Request , res:Response , next:NextFunction)=>{

    
        const token = req.header("Authorization")?.replace("Bearer ", "")
        console.log("token reached below" , token)
        if(!token){
            throw new ApiError("No authorization token" , StatusCodes.UNAUTHORIZED)
        }
        const decodedToken = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
        const user = await findUserById(decodedToken?.id);
        if(!user){
            throw new ApiError("Invalid Access Token" , StatusCodes.UNAUTHORIZED)
        }
        console.log("decoded user" , user)
        req.user = user;
        next();
}
)

export async function socketAuth(socket: Socket, next:(err? : ApiError)=>void){
    try{
        const token = socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ","") ||
        socket.handshake.query.token as string;

            if (!token) {
                return next(new ApiError('Socket requires auth token' , StatusCodes.UNAUTHORIZED));
            }

        const decodedToken = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
        const user = await findUserById(decodedToken?.id);
         if(!user){
            throw new ApiError("Invalid Access Token" , StatusCodes.UNAUTHORIZED)
        }
        socket.data.user = user;
        console.log("conencting user ,", socket.data.user)
        next();
    }catch(error){
        return next(new ApiError('Socket requires auth token' , StatusCodes.UNAUTHORIZED));
    }
}