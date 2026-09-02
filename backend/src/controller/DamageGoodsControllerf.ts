import type { Request, Response } from "express";

import {
    createDamagedGoodsService,
    getAllDamagedGoodsService,
    getDamagedGoodsByIdService,
    getDamagedGoodsByInventoryService,
    updateDamagedGoodsService,
    deactivateDamagedGoodsService
} from "../services/DamageGoodsService.js";

interface AuthRequest extends Request {
    user?: {
        user_id?: number;
        email?: string;
        roleId?: number;
        storeId?: number;
    };
}

export const createDamagedGoods = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            inventory_id,
            qty,
            reason,
            unit_cost
        } = req.body;

        if (
            inventory_id === undefined ||
            qty === undefined ||
            unit_cost === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "inventory_id, qty and unit_cost are required"
            });
        }

        const inventoryId = Number(inventory_id);
        const quantity = Number(qty);
        const unitCost = Number(unit_cost);

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
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }

        if (
            !Number.isFinite(unitCost) ||
            unitCost < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit cost"
            });
        }

        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        const data = await createDamagedGoodsService({
            inventory_id: inventoryId,
            qty: quantity,
            reason:
                reason === undefined || reason === ""
                    ? undefined
                    : reason,
            unit_cost: unitCost,
            created_by: userId
        });

        return res.status(201).json({
            success: true,
            message:
                "Damaged goods record created successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to create damaged goods record"
        });
    }
};

export const getAllDamagedGoods = async (
    req: Request,
    res: Response
) => {
    try {
        const data =
            await getAllDamagedGoodsService();

        return res.status(200).json({
            success: true,
            message:
                "Damaged goods records fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch damaged goods records"
        });
    }
};

export const getDamagedGoodsById = async (
    req: Request,
    res: Response
) => {
    try {
        const damageId = Number(req.params.id);

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid damage ID parameter"
            });
        }

        const data =
            await getDamagedGoodsByIdService(
                damageId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message:
                    "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Damaged goods record fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch damaged goods record"
        });
    }
};

export const getDamagedGoodsByInventory = async (
    req: Request,
    res: Response
) => {
    try {
        const inventoryId =
            Number(req.params.inventoryId);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID parameter"
            });
        }

        const data =
            await getDamagedGoodsByInventoryService(
                inventoryId
            );

        return res.status(200).json({
            success: true,
            message:
                "Damaged goods records fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch damaged goods records"
        });
    }
};

export const updateDamagedGoods = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const damageId = Number(req.params.id);

        const {
            qty,
            reason,
            unit_cost
        } = req.body;

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid damage ID parameter"
            });
        }

        if (
            qty === undefined ||
            unit_cost === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "qty and unit_cost are required"
            });
        }

        const quantity = Number(qty);
        const unitCost = Number(unit_cost);

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }

        if (
            !Number.isFinite(unitCost) ||
            unitCost < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit cost"
            });
        }

        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        const data =
            await updateDamagedGoodsService(
                damageId,
                quantity,
                reason === undefined || reason === ""
                    ? null
                    : reason,
                unitCost,
                userId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message:
                    "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Damaged goods record updated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to update damaged goods record"
        });
    }
};

export const deactivateDamagedGoods = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const damageId = Number(req.params.id);

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid damage ID parameter"
            });
        }

        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        const data =
            await deactivateDamagedGoodsService(
                damageId,
                userId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message:
                    "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Damaged goods record deactivated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to deactivate damaged goods record"
        });
    }
};