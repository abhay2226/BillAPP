import type { Request, Response } from "express";

import {
    getAllProductTypesService
} from "../services/ProductTypeServices.js";


export async function getAllProductTypesController(
    req: Request,
    res: Response
) {

    try {

        const types =
            await getAllProductTypesService();

        return res.status(200).json({
            success: true,
            data: types
        });

    } catch (error) {

        console.error(
            "Get product types error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get product types"
        });
    }
}