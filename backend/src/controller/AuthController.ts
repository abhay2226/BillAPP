import type { Request,Response } from "express";

import {
    signUp,
    logIn
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