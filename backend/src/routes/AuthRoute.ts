// import type { Request,Response } from "express";
import { Router } from "express";

import {
    logoutController,
    loginController,
    signupController,
    getSignupRolesController,
    getSignupStoresController
} from "../controller/AuthController.js"

const authRouter=Router();

authRouter.post("/signup",signupController);

authRouter.post("/login",loginController);

authRouter.get("/signup-roles",getSignupRolesController);

authRouter.get("/signup-stores",getSignupStoresController);

authRouter.get("/logout", logoutController);


export default authRouter;


