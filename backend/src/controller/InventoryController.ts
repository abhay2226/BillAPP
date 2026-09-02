import type { Request, Response } from "express";

import {
    createInventoryService,
    getInventoryByStoreService,
    getInventoryByIdService,
    updatePricingService,
    updateInventoryQuantityService,
    deactivateInventoryService
} from "../services/InventoryService.js";

interface AuthRequest extends Request {
    user?: {
        user_id?: number;
        email?: string;
        roleId?: number;
        storeId?: number;
    };
}

export const createInventory = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            product_id,
            store_id,
            qty,
            cost_price,
            selling_price
        } = req.body;

        if (
            product_id === undefined ||
            store_id === undefined ||
            selling_price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "product_id, store_id and selling_price are required"
            });
        }

        const productId = Number(product_id);
        const storeId = Number(store_id);
        const quantity = qty === undefined ? 0 : Number(qty);

        const costPrice =
            cost_price === null || cost_price === undefined
                ? null
                : Number(cost_price);

        const sellingPrice = Number(selling_price);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a non-negative integer"
            });
        }

        if (
            costPrice !== null &&
            (!Number.isFinite(costPrice) || costPrice < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid cost price"
            });
        }

        if (
            !Number.isFinite(sellingPrice) ||
            sellingPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid selling price"
            });
        }

        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        const data = await createInventoryService({
            product_id: productId,
            store_id: storeId,
            qty: quantity,
            cost_price: costPrice,
            selling_price: sellingPrice,
            created_by: userId
        });

        return res.status(201).json({
            success: true,
            message: "Inventory created successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (
            error.message ===
            "Inventory already exists for this product in this store"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create inventory"
        });
    }
};

export const getInventory = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const storeId = Number(req.params.storeId);

        const productId =
            req.query.productId !== undefined
                ? Number(req.query.productId)
                : undefined;

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID parameter"
            });
        }

        if (
            productId !== undefined &&
            (!Number.isInteger(productId) || productId <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID parameter"
            });
        }

        const data = await getInventoryByStoreService(
            storeId,
            productId
        );

        return res.status(200).json({
            success: true,
            message: "Inventory fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory"
        });
    }
};

export const getInventoryById = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const inventoryId = Number(req.params.id);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
            });
        }

        const data = await getInventoryByIdService(
            inventoryId
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory"
        });
    }
};

export const updatePricing = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const inventoryId = Number(req.params.id);

        const {
            cost_price,
            selling_price
        } = req.body;

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
            });
        }

        if (selling_price === undefined) {
            return res.status(400).json({
                success: false,
                message: "selling_price is required"
            });
        }

        const sellingPrice = Number(selling_price);

        const costPrice =
            cost_price === null ||
            cost_price === undefined
                ? null
                : Number(cost_price);

        if (
            !Number.isFinite(sellingPrice) ||
            sellingPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid selling price"
            });
        }

        if (
            costPrice !== null &&
            (!Number.isFinite(costPrice) || costPrice < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid cost price"
            });
        }

        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        const data = await updatePricingService(
            inventoryId,
            costPrice,
            sellingPrice,
            userId
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory pricing updated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update inventory pricing"
        });
    }
};

export const updateInventoryQuantity = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const inventoryId = Number(req.params.id);
        const quantity = Number(req.body.qty);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a non-negative integer"
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
            await updateInventoryQuantityService(
                inventoryId,
                quantity,
                userId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Inventory quantity updated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update inventory quantity"
        });
    }
};

export const deactivateInventory = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const inventoryId = Number(req.params.id);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
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
            await deactivateInventoryService(
                inventoryId,
                userId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Inventory deactivated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to deactivate inventory"
        });
    }
};