import { Router } from "express";
import  {userRegister,userLogOut,refreshAccessToken, updateUserDetails, updateUserPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserProfileDetails, getWatchHistory}  from "../controllers/user.controller.js";
import {userLogin} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middlware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,userRegister);

//userLogin routes-->
router.route("/login").post(userLogin);

//secured routes
router.route("/logout").post(verifyJWT,userLogOut)
router.route("/refresh-token").post(refreshAccessToken);
router.route("/updated-details").patch(verifyJWT,updateUserDetails)
router.route("/change-password").patch(verifyJWT,updateUserPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/channel/:username").get(verifyJWT,getUserProfileDetails);
router.route("/history").get(verifyJWT,getWatchHistory)
export default router