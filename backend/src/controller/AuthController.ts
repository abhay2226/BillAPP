import type { Request,Response } from "express";

import {
    getSignupRoles,
    getSignupStores,
    signUp,
    logIn,
    logOut
} from "../services/AuthService.js";

//=========================================================================
//signup
//=========================================================================


export async function signupController(req:Request,res:Response){
    try{
        const result=await signUp(req.body);

        return res.status(201).json({
            success: true, 
            message: "Account created successfully.", 
            data: result
        });
    }
    catch(error){

        console.error(
            "Signup error:", 
            error
        )
        return res.status(400).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Signup failed." 
        });

    }

}

//=========================================================================
//login
//=========================================================================

export async function loginController(req:Request,res:Response){
    try{
        const result=await logIn(req.body);

        return res.status(201).json({
            success: true, 
            message: "logged-In successfully.", 
            data: result
        });
    }
    catch(error){

        console.error(
            "Login error:", 
            error
        )
        return res.status(400).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Login failed." 
        });

    }
}

//=========================================================================
//logout
//=========================================================================

export async function logoutController(req:Request,res:Response){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false,
                message:"Authorization header missing or invalid."
            });
        } 
        const token = authHeader.slice("Bearer ".length);
        const result = await logOut(token);

        return res.status(200).json({
            success: true,
            message: result.message
        })
    }catch (error) {
        console.error("Logout error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Logout failed.",
        });
    }
}  

//=========================================================================
//getSignupRoles
//=========================================================================

export async function getSignupRolesController(req:Request,res:Response){
    try{
        const result=await getSignupRoles();
        return res.status(200).json({
            success: true,
            message: "Signup roles retrieved successfully.",
            data: result
        });
    }catch (error) {
        console.error("Get signup roles error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to retrieve signup roles.",
        });
    }
}

//=========================================================================
//getSignupStores
//=========================================================================
export async function getSignupStoresController(req:Request,res:Response){
    try{
        const result=await getSignupStores();
        return res.status(200).json({
            success: true,
            message: "Signup stores retrieved successfully.",
            data: result
        });
    }catch (error) {
        console.error("Get signup stores error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to retrieve signup stores.",
        });
    }
}