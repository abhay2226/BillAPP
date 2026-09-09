import type { Request, Response } from "express";

import {
    getUsers,
    getUserById,
    updateUser,
    deactivateUserWithOwnershipRules,
    restoreUser,
    createUserByAdmin
} from "../services/UserService.js";
import {
    validateIdParam,
    validateUserUpdate,
    validateCreateUser
} from "../validation/validators.js";
import { sendErrorResponse } from "../utils/AppError.js";

//=========================================================================
// get all users in store
//=========================================================================
export async function getUsersController(req: Request, res: Response) {
    try {
        const storeId = req.auth?.storeId;
        const result = await getUsers(storeId);
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get users error:", error);
        return sendErrorResponse(res, error, 500);
    }
}

//=========================================================================
// get user by id
//=========================================================================
export async function getUserByIdController(req: Request, res: Response) {
    try {
        const userId = validateIdParam(req.params.userId, "user ID");
        const result = await getUserById(userId);
        return res.status(200).json({
            success: true,
            message: "User fetched successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get user error:", error);
        return sendErrorResponse(res, error, 404);
    }
}

//=========================================================================
// create user by Admin / Owner
//=========================================================================
export async function createUserController(req: Request, res: Response) {
    try {
        validateCreateUser(req.body);
        const actingUserId = req.auth.userId;
        const storeId = req.auth.storeId;

        const result = await createUserByAdmin(actingUserId, storeId, req.body);
        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            data: result
        });
    } catch (error) {
        console.error("Create user error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// update user
//=========================================================================
export async function updateUserController(req: Request, res: Response) {
    try {
        const userId = validateIdParam(req.params.userId, "user ID");
        validateUserUpdate(req.body);

        const actingUserId = req.auth.userId;
        const result = await updateUser(userId, actingUserId, req.body);

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: result
        });
    } catch (error) {
        console.error("Update user error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// deactivate user
//=========================================================================
export async function deleteUserController(req: Request, res: Response) {
    try {
        const userId = validateIdParam(req.params.userId, "user ID");
        const actingUserId = req.auth.userId;

        const result = await deactivateUserWithOwnershipRules(userId, actingUserId);

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully.",
            data: result
        });
    } catch (error) {
        console.error("Deactivate user error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// restore user
//=========================================================================
export async function restoreUserController(req: Request, res: Response) {
    try {
        const userId = validateIdParam(req.params.userId, "user ID");
        const actingUserId = req.auth.userId;

        const result = await restoreUser(userId, actingUserId);

        return res.status(200).json({
            success: true,
            message: "User restored successfully.",
            data: result
        });
    } catch (error) {
        console.error("Restore user error:", error);
        return sendErrorResponse(res, error, 400);
    }
}