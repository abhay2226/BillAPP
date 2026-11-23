import type { Request, Response } from "express";

import {
    deactivateProductBrandService,
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

export async function deactivateProductBrandController(
    req: Request,
    res: Response
) {
    try {
        const productBrandId = Number(req.params.id);

        if (!Number.isInteger(productBrandId) || productBrandId <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid product brand id is required."
            });
        }

        await deactivateProductBrandService(productBrandId);

        return res.status(200).json({
            success: true,
            message: "Product brand deleted successfully."
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete product brand";

        return res.status(message === "Product brand not found."
            ? 404
            : 500).json({
            success: false,
            message
        });
    }
}