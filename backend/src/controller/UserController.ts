import type { Request,Response } from "express";

import {
    getUsers,
    getUserById,
    updateUser,
    deactivateUserWithOwnershipRules
} from "../services/UserService.js";

import { verifyToken } from "../utils/jwt.js";

export async function getUsersController(req:Request,res:Response){
    try{
        const result=await getUsers();
        return res.status(200).json({
            success: true, 
            message: "Users fetched successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({
            success: false,
            message:error instanceof Error ? error.message : "Error fetching users.",
        });
    }
}

export async function getUserByIdController(req:Request,res:Response){
    try{
        const userId = Number(req.params.userId);
        if(isNaN(userId) || userId <= 0){
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }
        const result=await getUserById(userId);
        return res.status(200).json({
            success: true, 
            message: "User fetched successfully.",
            data: result
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(404).json({
            success: false,
            message:  error instanceof Error ? error.message : "Error fetching user.",
        });
    }
}

export async function updateUserController(req:Request,res:Response){
    try{
        const userId = Number(req.params.userId);
        if(isNaN(userId) || userId <= 0){
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const actingUserId = req.auth.userId;
        const result =await updateUser(userId, actingUserId,req.body);
        return res.status(200).json({
            success: true, 
            message: "Account created successfully.", 
            data: result
        });
    } catch(error)
    {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "User could not be updated.", 
        });
    }
}

export async function deleteUserController(req:Request,res:Response) {
    try{
        const userId = Number(req.params.userId);
        if(isNaN(userId) || userId <= 0){
            return res.status(400).json({
                success: false,
                message: "User doesnt exist/"
            });
        }

        const actingUserId = req.auth.userId;
        const result=await deactivateUserWithOwnershipRules(userId, actingUserId);
        return res.status(200).json({
            success: true, 
            message: "User fetched successfully.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user.",
            error: error
        });
    }
}