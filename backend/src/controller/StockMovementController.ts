
import type { Request, Response } from "express";

import {
    createStockMovementService
} from "../services/StockMovementService.js";

import { verifyToken } from "../utils/jwt.js";

export const adjustStock = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            res.status(401).json({
                success: false,
                message: "Bearer token is required"
            });
            return;
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Bearer token is required"
            });
            return;
        }

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
            return;
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
        const referenceId = Number(reference_id);

        const referenceTypeCode =
            typeof reference_type === "string"
                ? reference_type.trim()
                : "";

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
            return;
        }

        if (
            !Number.isInteger(movementTypeId) ||
            movementTypeId <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid movement type ID"
            });
            return;
        }

        if (
            !Number.isInteger(quantityChange) ||
            quantityChange === 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Quantity change must be a non-zero integer"
            });
            return;
        }

        if (!referenceTypeCode) {
            res.status(400).json({
                success: false,
                message: "Reference type code is required"
            });
            return;
        }

        if (
            !Number.isInteger(referenceId) ||
            referenceId <= 0
        ) {
            res.status(400).json({
                success: false,
                message: "Valid reference ID is required"
            });
            return;
        }

        const data =
            await createStockMovementService({
                inventoryId,
                movementTypeId,
                quantityChange,
                referenceTypeCode,
                referenceId,
                userId: payload.userId
            });

        res.status(200).json({
            success: true,
            message:
                "Stock adjusted and movement tracked successfully",
            data
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update stock"
        });
    }
};

