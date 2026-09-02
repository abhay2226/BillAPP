import type { Request,Response } from "express";

import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../services/UserService.js";

export async function getUsersController(req:Request,res:Response){
    try{
        const result=await getUsers();
        return res.status(200).json({
            success: true, 
            message: "Users fetched successfully.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users.",
            error: error
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
        return res.status(500).json({
            success: false,
            message: "Error fetching user.",
            error: error
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

        const result =await updateUser(req.body,userId);
        return res.status(201).json({
            success: true, 
            message: "Account created successfully.", 
            data: result
        });
    } catch(error)
    {
        return res.status(400).json({
            success: false,
            message: "User could not be updated.",
            error: error 
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
        const result=await deleteUser(userId);
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
