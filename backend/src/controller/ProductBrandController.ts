import type { Request, Response } from "express";

import {
    getAllProductBrandsService
} from "../services/ProductBrandServices.js";


export async function getAllProductBrandsController(
    req: Request,
    res: Response
) {

    try {

        const brands =
            await getAllProductBrandsService();

        return res.status(200).json({
            success: true,
            data: brands
        });

    } catch (error) {

        console.error(
            "Get product brands error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get product brands"
        });
    }
}