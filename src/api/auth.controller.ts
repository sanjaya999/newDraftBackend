import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { Request , Response } from "express";
import { registerUser } from "../services/auth.js";
import { sendResponse } from "../utils/response.js";


export const registerController = asyncHandler(async(req : Request , res: Response )=>{

   const {email , password , name} = req.body;
   console.log({
    email , password , name
   })
   const result = await registerUser(name , email , password);

   return sendResponse(res,
      StatusCodes.CREATED,
      {data: result,
         message: "user created successfully"   
      }
   )

})