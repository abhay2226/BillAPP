import type { Request, Response } from "express";
import { updateStockService } from "../services/StockMovementService.js";

import { verifyToken } from "../utils/jwt.js";

export const adjustStock = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.slice("Bearer ".length);
        let payload;
        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        const { inventory_id, movement_type_id, quantity_change, reference_type, reference_id } = req.body;
        const userId = payload.userId || 1;

        const data = await updateStockService({
            inventoryId: inventory_id,
            movementTypeId: movement_type_id,
            quantityChange: quantity_change,
            referenceType: reference_type,
            referenceId: reference_id,
            userId
        });

        if (!data) {
            return res.status(404).json({ success: false, message: "Target inventory profile missing" });
        }

        return res.status(200).json({ success: true, message: "Stock matrix adjusted and tracked successfully", data });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update stock metrics" });
    }
};
