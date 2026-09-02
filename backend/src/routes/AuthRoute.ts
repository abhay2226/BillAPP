// import type { Request,Response } from "express";
import { Router } from "express";

import {
    logoutController,
    loginController,
    signupController,
    getSignupRolesController,
    getSignupStoresController
} from "../controller/AuthController.js"

const LoginRouter=Router();

LoginRouter.post("/signup",signupController);

LoginRouter.post("/login",loginController);

LoginRouter.get("/signup/roles",getSignupRolesController);

LoginRouter.get("/signup/stores",getSignupStoresController);

export default LoginRouter;


