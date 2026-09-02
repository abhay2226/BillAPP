import type { Request, Response } from "express";
import { updateStockService } from "../services/StockMovementService.js";

interface AuthRequest extends Request {
    user?: {
        user_id?: number;
        email?: string;
        roleId?: number;
        storeId?: number;
    };
}

export const adjustStock = async (req: AuthRequest, res: Response) => {
    try {
        const { inventory_id, movement_type_id, quantity_change, reference_type, reference_id } = req.body;
        const userId = req.user?.user_id || 1;

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
