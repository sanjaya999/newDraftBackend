import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { Request , Response } from "express";
import { login, registerUser } from "../services/auth.js";
import { sendResponse } from "../utils/response.js";


export const registerController = asyncHandler(async(req : Request , res: Response )=>{

   const {email , password , name} = req.body;
   console.log({
    email , password , name
   })
   const result = await registerUser(name , email , password);
   const options = {
   httpOnly: true,
   //  secure: false,       
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 60,
   }
   res.cookie("accessToken" , result.accessToken, options)
   return sendResponse(res,
      StatusCodes.CREATED,
      {data: result,
         message: "user created successfully"   
      }
   )

})

export const loginController = asyncHandler(async(req:Request , res: Response)=>{
   const {email, password} = req.body;
   const result = await login(email , password);
   return sendResponse(res,
      StatusCodes.OK,
      {
         data: result,
         message:"User logged in successfully."
      }
   )


}) 

export const authCheck = asyncHandler(async(req : Request , res: Response )=>{

   return sendResponse(res,
      StatusCodes.OK,
      {data: "Passed",
         message: "auth Passed"   
      }
   )

})
