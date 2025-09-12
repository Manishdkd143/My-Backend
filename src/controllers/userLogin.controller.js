import asyncHandler from "../utils/asyncHandler.js";

const userLogin=asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"login successfully"
    })
})
export default userLogin