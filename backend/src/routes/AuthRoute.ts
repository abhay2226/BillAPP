// import type { Request,Response } from "express";
import { Router } from "express";

import {
    loginController,
    signupController
} from "../controller/AuthController.js"

const LoginRouter=Router();

LoginRouter.post("/signup",signupController);

LoginRouter.post("/login",loginController);

export default LoginRouter;


