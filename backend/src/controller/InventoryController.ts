import type { Request, Response } from "express";

import {
    createInventoryService,
    getInventoryByStoreService,
    updatePricingService,
    updateInventoryQuantityService,
    deactivateInventoryService,
    getInventoryByIdService
} from "../services/InventoryService.js";

import { verifyToken } from "../utils/jwt.js";



export const createInventory = async (
    req: Request,
    res: Response
) => {
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
            cost_price === undefined || cost_price === null
                ? null
                : Number(cost_price);
        const sellingPrice = Number(selling_price);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a non-negative integer"
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

        const userId = payload.userId;

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

        return res.status(500).json({
            success: false,
            message: "Failed to create inventory"
        });
    }
};

export const getInventoryByStore = async (
    req: Request,
    res: Response
) => {
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
        const storeId = Number(req.params.storeId);

        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID parameter"
            });
        }

        const productIdParam = req.query.productId;

        let productId: number | undefined;

        if (productIdParam !== undefined) {
            productId = Number(productIdParam);

            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }
        }

        let productName: string | undefined;

        if (req.query.productName !== undefined) {
            productName = String(
                req.query.productName
            ).trim();

            if (productName === "") {
                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty"
                });
            }
        }

        const data = await getInventoryByStoreService(
            storeId,
            productId,
            productName
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
    req: Request,
    res: Response
) => {
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

        const data =
            await getInventoryByIdService(inventoryId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found"
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

export const updateInventoryPricing = async (
    req: Request,
    res: Response
) => {
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

        const costPrice =
            cost_price === undefined || cost_price === null
                ? null
                : Number(cost_price);

        const sellingPrice = Number(selling_price);

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

        const userId = payload.userId;

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
                message: "Inventory not found"
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
    req: Request,
    res: Response
) => {
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
        const inventoryId = Number(req.params.id);
        const { qty } = req.body;

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID parameter"
            });
        }

        if (qty === undefined) {
            return res.status(400).json({
                success: false,
                message: "qty is required"
            });
        }

        const quantity = Number(qty);

        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a non-negative integer"
            });
        }

        const userId = payload.userId;

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
                message: "Inventory not found"
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
            message:
                "Failed to update inventory quantity"
        });
    }
};

export const deactivateInventory = async (
    req: Request,
    res: Response
) => {
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

        const userId = payload.userId;

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
                message: "Inventory not found"
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
            message:
                "Failed to deactivate inventory"
        });
    }
};