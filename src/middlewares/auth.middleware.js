import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT=asyncHandler(async(req,res,next)=>{
  try {
      // Authorization: Bearer <token>
    const token=req.cookies?.accessToken||req.header("Authorization").replace("Bearer","");
    if(!token){
      throw new ApiError(401,"Unauthorization tokens!")
    }
   
    const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    //refresh token is long lived expiry token and this is store db to check user authentication.
    //Access token is short lived  expiry token they are access only user active on browser.
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user){
      throw new ApiError(500,"Invalid Access Token!");
     }
      req.user=user
      next()
  } catch (error) {
    throw new ApiError(400,error?.message||"User not verified!")
  }
})