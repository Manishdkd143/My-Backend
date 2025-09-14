import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadFileOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const userRegister = asyncHandler(async (req, res) => {
  //user registration steps--->
  /*
1.get user details from frontend
2.validation -not empty
3.check if user already exist username,emails
4.check for images check for avatar
5.upload them to cloudinary ,then check avatar url
6.create user object -create entry in db
7.remove password and refreshToken field from db response 
8.check for user creation
9.return response
*/


  const { fullName, email, username, password } = req.body;

  if ([fullName, email, password, username].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All field are required!");
  }
   const exists=await User.findOne({$or:[{username},{email}]});
   if(exists){
    throw new ApiError(409,"User already exists!")
   }
  //  console.log(req.files);
   
   const avatarImageLocalPath= req.files?.avatar[0]?.path;
  //  const coverImageLocalPath=req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path;
   }
   if(!avatarImageLocalPath){
    throw new ApiError(404,"avatar image is required!")
   }
    const avatar=await uploadFileOnCloudinary(avatarImageLocalPath);
    const coverImage=await uploadFileOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"avatar image is required!");
    }
    // console.log(avatar);
    
    const user=await User.create({
        fullName,email,password,avatar:avatar.url,coverImage:coverImage?.url||"",username:username.toLowerCase(),
    });
   const createdUser=await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(400,"user registration failed!")
    }
    return res.status(201).json(new ApiResponse(200,createdUser,"User successfully registered"))

});
export default userRegister;
