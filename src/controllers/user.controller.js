import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import {uploadFileOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generatedAccessTokenAndRefreshTokens=async(userId)=>{
try {
  const user=await User.findById(userId);
  const accessToken=await user.generateAccessToken();
  const refreshToken=await user.generateRefreshToken();
  user.refreshToken=refreshToken
  await user.save({validateBeforeSave:true})
  return {accessToken,refreshToken}
} catch (error) {
  throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
}
}





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
//TODO for login process--
/*
1.take username email password from req.body
2.check validation empty fields
3.then email ,username check from db
4.password match server and db
5.generated AccessToken and Refresh token
6.set tokens in cookies
.return user accesstoken and refreshtoken
*/
const userLogin=asyncHandler(async(req,res)=>{
const {username ,email,password}=req.body;
if(!(username||email)){
  throw new ApiError(400,"Enter username or email one field required!")
}
const user=await User.findOne({
  $or:[{username},{email}]
});
if (!user) {
  throw new ApiError(401,"User doesn't exists");
}
const isPasswordValid=await user.isPasswordCorrect(password);
// console.log(isPasswordValid);

if(!isPasswordValid){
  throw new ApiError(404,"invalid user credentials!");
}
const {accessToken,refreshToken}=await generatedAccessTokenAndRefreshTokens(user._id);
const inLoggedUser=await User.findById(user._id).select("-password -refreshToken");
const options={
  httpOnly:true,
  secure:true,
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(200,
    {
    user:inLoggedUser,accessToken,refreshToken,
  },
  "User LoggedIn successfully"
)
)
})

const userLogOut=asyncHandler(async(req,res)=>{
const user=req.user;
console.log(user);

if(!user){
  throw new ApiError(500,"User is not LoggedIn!")
}
await User.findByIdAndUpdate(req.user._id,{
  $set:{
    refreshToken:undefined
  }
},
{
    new:true,
  })

  const options={
    httpOnly:true,
    secure:true,
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))
})
//todo-->user login via tokens avoid for many  time enter email password
/*
1.take refreshtoken for req body
2.decoded incoming refresh Token 
3.check validation incomingToken and decoded token
4.check user is here in db
5.match incomingRefreshToken and db refresh token
6.generated tokens
7.send res including cookies json 
*/
const refreshAccessToken=asyncHandler(async(req,res)=>{
  try {
    const incomingRefreshToken=req.cookie?.refreshToken||req.body?.refreshToken;
    if(!incomingRefreshToken){
      throw new ApiError(400,"unauthorized request!");
    }
    const decodedRefreshToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    if(!decodedRefreshToken){
      throw new ApiError(400,"dToken!")
    }
    const user=await User.findById(decodedRefreshToken?._id)
    if(!user){
     throw new ApiError(401,"User not found!")
    }
    if(incomingRefreshToken!==user._id){
        throw new ApiError(401,"RefreshToken is expired or used")
    }
    const {accessToken,newRefreshToken}=await generatedAccessTokenAndRefreshTokens(user?.id);
    if(!accessToken||!newRefreshToken){
      throw new ApiError(402,"Token is not generated!")
    }
    return res.status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",newRefreshToken)
    .json(
      new ApiResponse(200,{
        accessToken,refreshToken:newRefreshToken
      },"Token is refreshed")
    )
  } catch (error) {
    throw new ApiError(400,error?.message||"RefreshAccessToken Error!")
  }


})


export {userRegister,userLogin,userLogOut,refreshAccessToken};
