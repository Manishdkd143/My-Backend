import { Router } from "express";
import  userRegister  from "../controllers/userRegister.controller.js";
import userLogin from "../controllers/userLogin.controller.js";

const router=Router()
router.route("/register").post(userRegister);
router.route('/login').post(userLogin);
export default router