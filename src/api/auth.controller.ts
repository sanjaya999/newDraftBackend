import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { registerSchema, type RegisterBody } from "../validation/auth.schema.js";
import type { Request , Response } from "express";
import { registerUser } from "../services/auth.js";
import { ref } from "process";

export const registerController = asyncHandler(async(req : Request , res: Response )=>{
  const result = registerSchema.safeParse(req.body);

  if(!result.success){
    return res.status(StatusCodes.BAD_REQUEST).json({
        errors: result.error
        })
   }
   const {email , password , name} = result.data;
   console.log({
    email , password , name
   })
   const {accessToken , refreshToken , user } = await registerUser(name , email , password);
   return res.status(StatusCodes.CREATED).json({
    status: "success",
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: user
   })

})