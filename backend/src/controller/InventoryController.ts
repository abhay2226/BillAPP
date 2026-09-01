import type { Request, Response } from "express";

import {
    getInventoryByStoreService,
    updateStockService,
    logDamagedGoodsService
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

        const data = await getInventoryByStoreService(storeId, productId);
        return res.status(200).json({ message: "Inventory profiles fetched successfully", data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch inventory rows" });
    }
};

export const updatePricing = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { cost_price, selling_price } = req.body;
        const userId = req.user?.user_id || 1;

        const data = await updateStockService({
            inventoryId: id,
            movementTypeId: 0,
            quantityChange: 0,
            userId
        });

        if (!data) return res.status(404).json({ message: "Inventory record missing" });

        return res.status(200).json({ message: "Pricing models updated successfully", data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update pricing configurations" });
    }
};

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
            userId: userId
        });
        if (!data) return res.status(404).json({ message: "Target inventory profile missing" });

        return res.status(200).json({ message: "Stock matrix adjusted and tracked successfully", data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update stock metrics" });
    }
};
