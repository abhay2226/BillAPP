import { Router } from "express";
import type { Request, Response } from "express";

import {
    createInventoryService,
    getInventoryByStoreService,
     updatePricingService,
    updateStockService,
    logDamagedGoodsService
} from "../services/Inventoryservice.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const inventory = await createInventoryService(req.body);

        return res.status(201).json({
            success: true,
            message: "Inventory line created successfully",
            data: inventory
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/store/:storeId", async (req: Request, res: Response) => {
    try {
        const storeId = Number(req.params.storeId);
        const productId = req.query.productId ? Number(req.query.productId) : undefined;

        if (Number.isNaN(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID parameter"
            });
        }

        const data = await getInventoryByStoreService(storeId, productId);

        return res.status(200).json({
            success: true,
            message: "Inventory profiles fetched successfully",
            count: data.length,
            data: data
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.put("/pricing/:id", async (req: Request, res: Response) => {
    try {
        const inventoryId = Number(req.params.id);
        const { cost_price, selling_price, user_id } = req.body;

        if (Number.isNaN(inventoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
            });
        }

        const data = await updatePricingService(inventoryId, cost_price, selling_price, user_id || 1);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Target inventory profile mapping not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pricing tier matrix updated successfully",
            data: data
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/update", async (req: Request, res: Response) => {
    try {
        const { inventory_id, movement_type_id, quantity_change, reference_type, reference_id, user_id } = req.body;

        const data = await updateStockService({
            inventoryId: inventory_id,
            movementTypeId: movement_type_id,
            quantityChange: quantity_change,
            referenceType: reference_type,
            referenceId: reference_id,
            userId: user_id || 1
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Target inventory balance profile missing"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Physical stock parameters updated successfully",
            data: data
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/damage-log", async (req: Request, res: Response) => {
    try {
        const { inventory_id, qty, reason, user_id } = req.body;

        const result = await logDamagedGoodsService({
            inventoryId: inventory_id,
            qty,
            reason,
            userId: user_id || 1
        });

        if (result.status === "NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Inventory target reference pointer completely invalid"
            });
        }

        if (result.status === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                success: false,
                message: "Requested write-off quantity exceeds verified physical stock balances"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Damaged allocation logged and balanced successfully",
            data: result.data
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
