import { StatusCodes } from "http-status-codes";
import { ApiError } from "../core/ApiError.js";
import * as userRepository from "../repository/user.repository.js"
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword } from "../utils/auth.utils.js";

export async function registerUser(
    name: string,
    email: string,
    password: string)
{
    const existingUser = await userRepository.findUserByEmail(email);
    if(existingUser){
        throw new ApiError("Email already exist", StatusCodes.CONFLICT);
    }

    const passwordHash = await hashPassword(password);
    const newUser = await userRepository.createUser(
        name , email , passwordHash
    )

    const accessToken =  generateAccessToken(newUser.id)
    const refreshToken = generateRefreshToken(newUser.id)
    
    return{
        accessToken, refreshToken , user:newUser
    }
  
}

export async function login(
    email: string,
    password: string
){
    const user = await userRepository.findUserByEmail(email);
    if(!user){
        throw new ApiError("No user found" , StatusCodes.UNAUTHORIZED)
    }
    const isPasswordValid = await comparePassword(password, user.password);

    if(!isPasswordValid){
        throw new ApiError("Invalid Password" , StatusCodes.UNAUTHORIZED)
    }
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const {password: _, ...userWithoutPasswor} = user;
    
    return{
        accessToken, refreshToken , user: userWithoutPasswor
    }


}