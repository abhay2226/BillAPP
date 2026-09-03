import type { Request, Response } from "express";
import { updateStockService } from "../services/StockMovementService.js";
import { verifyToken } from "../utils/jwt.js";

export const adjustStock = async (
    req: Request,
    res: Response
) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Bearer token is required"
            });
        }

        const token = authHeader.substring(7);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const {
            inventory_id,
            movement_type_id,
            quantity_change,
            reference_type,
            reference_id
        } = req.body;

        const inventoryId = Number(inventory_id);
        const movementTypeId = Number(movement_type_id);
        const quantityChange = Number(quantity_change);

        const referenceId =
            reference_id === undefined ||
            reference_id === null ||
            reference_id === ""
                ? undefined
                : Number(reference_id);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
        }

        if (
            !Number.isInteger(movementTypeId) ||
            movementTypeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid movement type ID"
            });
        }

        if (
            !Number.isInteger(quantityChange) ||
            quantityChange === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity change must be a non-zero integer"
            });
        }

        if (
            referenceId !== undefined &&
            (
                !Number.isInteger(referenceId) ||
                referenceId <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid reference ID"
            });
        }

        const data = await updateStockService({
            inventoryId,
            movementTypeId,
            quantityChange,
            userId: payload.userId,

            ...(reference_type !== undefined &&
            reference_type !== ""
                ? {
                      referenceType: String(reference_type)
                  }
                : {}),

            ...(referenceId !== undefined
                ? {
                      referenceId
                  }
                : {})
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message:
                    "Target inventory profile missing"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Stock matrix adjusted and tracked successfully",
            data
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to update stock metrics"
        });
    }
};