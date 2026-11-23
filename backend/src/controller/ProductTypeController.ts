import type { Request, Response } from "express";

import {
    deactivateProductTypeService,
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

export async function deactivateProductTypeController(
    req: Request,
    res: Response
) {
    try {
        const productTypeId = Number(req.params.id);

        if (!Number.isInteger(productTypeId) || productTypeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid product type id is required."
            });
        }

        await deactivateProductTypeService(productTypeId);

        return res.status(200).json({
            success: true,
            message: "Product type deleted successfully."
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete product type";

        return res.status(message === "Product type not found."
            ? 404
            : 500).json({
            success: false,
            message
        });
    }
}