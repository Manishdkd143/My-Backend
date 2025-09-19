import { Router } from "express";
import  {userRegister,userLogOut,refreshAccessToken}  from "../controllers/user.controller.js";
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



export default router