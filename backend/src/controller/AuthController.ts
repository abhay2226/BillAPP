import type { Request, Response } from "express";

import {
    getSignupRoles,
    getSignupStores,
    signUp,
    logIn,
    logOut
} from "../services/AuthService.js";
import { validateSignup, validateLogin } from "../validation/validators.js";
import { sendErrorResponse } from "../utils/AppError.js";

//=========================================================================
// signup
//=========================================================================

export async function signupController(req: Request, res: Response) {
    try {
        validateSignup(req.body);
        const result = await signUp(req.body);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: result
        });
    } catch (error) {
        console.error("Signup error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// login
//=========================================================================

export async function loginController(req: Request, res: Response) {
    try {
        validateLogin(req.body);
        const result = await logIn(req.body);

        // Technical review fix: Return 200 OK for login instead of 201 Created
        return res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            data: result
        });
    } catch (error) {
        console.error("Login error:", error);
        return sendErrorResponse(res, error, 401);
    }
}

//=========================================================================
// logout
//=========================================================================

export async function logoutController(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or invalid."
            });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const result = await logOut(token);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error("Logout error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// getSignupRoles
//=========================================================================

export async function getSignupRolesController(req: Request, res: Response) {
    try {
        const result = await getSignupRoles();
        return res.status(200).json({
            success: true,
            message: "Signup roles retrieved successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get signup roles error:", error);
        return sendErrorResponse(res, error, 500);
    }
}

//=========================================================================
// getSignupStores
//=========================================================================

export async function getSignupStoresController(req: Request, res: Response) {
    try {
        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await getSignupStores(search);

        return res.status(200).json({
            success: true,
            message: "Signup stores retrieved successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get signup stores error:", error);
        return sendErrorResponse(res, error, 400);
    }
}