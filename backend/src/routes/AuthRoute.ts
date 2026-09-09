import { Router } from "express";

import {
    logoutController,
    loginController,
    signupController,
    getSignupRolesController,
    getSignupStoresController
} from "../controller/AuthController.js";

const authRouter = Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

authRouter.get("/signup-roles", getSignupRolesController);

authRouter.get("/signup-stores", getSignupStoresController);

// Primary endpoint is POST for logout as state is modified on the server
authRouter.post("/logout", logoutController);
// Retain GET as a backward-compatible alias
authRouter.get("/logout", logoutController);

export default authRouter;
