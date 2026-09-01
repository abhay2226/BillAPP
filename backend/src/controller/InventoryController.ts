import type { Request, Response } from "express";
import {
    getInventoryByStoreService,
    updatePricingService
} from "../services/Inventoryservice.js";

interface AuthRequest extends Request {
    user?: {
        user_id?: number;
        email?: string;
        roleId?: number;
        storeId?: number;
    };
}

export const getInventory = async (req: AuthRequest, res: Response) => {
    try {
        const storeId = Number(req.params.storeId);
        const productId = req.query.productId ? Number(req.query.productId) : undefined;
        
        if (Number.isNaN(storeId)) {
            return res.status(400).json({ success: false, message: "Invalid store ID parameter" });
        }

        const data = await getInventoryByStoreService(storeId, productId);
        return res.status(200).json({ success: true, message: "Inventory profiles fetched successfully", data });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch inventory rows" });
    }
};

export const updatePricing = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { cost_price, selling_price } = req.body;
        const userId = req.user?.user_id || 1;

        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: "Invalid inventory ID parameter" });
        }

        const data = await updatePricingService(id, cost_price, selling_price, userId);
        if (!data) {
            return res.status(404).json({ success: false, message: "Inventory record missing" });
        }

        return res.status(200).json({ success: true, message: "Pricing models updated successfully", data });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update pricing configurations" });
    }
};
