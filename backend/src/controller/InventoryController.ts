
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

const getAuthenticatedUserId = (
    req: Request
): number => {
    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        throw new Error("Bearer token is required");
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        throw new Error("Bearer token is required");
    }

    const payload = verifyToken(token);

    if (
        !Number.isInteger(payload.userId) ||
        payload.userId <= 0
    ) {
        throw new Error(
            "Authenticated user not found"
        );
    }

    return payload.userId;
};

const handleError = (
    error: unknown,
    res: Response,
    message: string
): void => {
    console.error(error);

    if (
        error instanceof Error &&
        error.message ===
            "Bearer token is required"
    ) {
        res.status(401).json({
            success: false,
            message: error.message
        });
        return;
    }

    if (
        error instanceof Error &&
        (
            error.name ===
                "JsonWebTokenError" ||
            error.name ===
                "TokenExpiredError"
        )
    ) {
        res.status(403).json({
            success: false,
            message:
                "Invalid or expired token"
        });
        return;
    }

    res.status(500).json({
        success: false,
        message
    });
};

export const createInventory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId =
            getAuthenticatedUserId(req);

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
            res.status(400).json({
                success: false,
                message:
                    "product_id, store_id and selling_price are required"
            });
            return;
        }

        const productId =
            Number(product_id);

        const storeId =
            Number(store_id);

        const quantity =
            qty === undefined
                ? 0
                : Number(qty);

        const costPrice =
            cost_price === undefined ||
            cost_price === null
                ? null
                : Number(cost_price);

        const sellingPrice =
            Number(selling_price);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid product ID"
            });
            return;
        }

        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid store ID"
            });
            return;
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Quantity must be a non-negative integer"
            });
            return;
        }

        if (
            costPrice !== null &&
            (
                !Number.isFinite(costPrice) ||
                costPrice < 0
            )
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid cost price"
            });
            return;
        }

        if (
            !Number.isFinite(sellingPrice) ||
            sellingPrice < 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid selling price"
            });
            return;
        }

        const data =
            await createInventoryService({
                product_id: productId,
                store_id: storeId,
                qty: quantity,
                cost_price: costPrice,
                selling_price: sellingPrice,
                created_by: userId
            });

        res.status(201).json({
            success: true,
            message:
                "Inventory created successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to create inventory"
        );
    }
};

export const getInventoryByStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        getAuthenticatedUserId(req);

        const storeId =
            Number(req.params.storeId);

        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid store ID parameter"
            });
            return;
        }

        const productIdParam =
            req.query.productId;

        let productId:
            | number
            | undefined;

        if (
            productIdParam !== undefined
        ) {
            productId =
                Number(productIdParam);

            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {
                res.status(400).json({
                    success: false,
                    message:
                        "Invalid product ID"
                });
                return;
            }
        }

        let productName:
            | string
            | undefined;

        if (
            req.query.productName !==
            undefined
        ) {
            productName =
                String(
                    req.query.productName
                ).trim();

            if (!productName) {
                res.status(400).json({
                    success: false,
                    message:
                        "Product name cannot be empty"
                });
                return;
            }
        }

        const data =
            await getInventoryByStoreService(
                storeId,
                productId,
                productName
            );

        res.status(200).json({
            success: true,
            message:
                "Inventory fetched successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to fetch inventory"
        );
    }
};

export const getInventoryById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        getAuthenticatedUserId(req);

        const inventoryId =
            Number(req.params.id);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID parameter"
            });
            return;
        }

        const data =
            await getInventoryByIdService(
                inventoryId
            );

        if (!data) {
            res.status(404).json({
                success: false,
                message:
                    "Inventory not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message:
                "Inventory fetched successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to fetch inventory"
        );
    }
};

export const updateInventoryPricing = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        const inventoryId =
            Number(req.params.id);

        const {
            cost_price,
            selling_price
        } = req.body;

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID parameter"
            });
            return;
        }

        if (
            selling_price === undefined
        ) {
            res.status(400).json({
                success: false,
                message:
                    "selling_price is required"
            });
            return;
        }

        const costPrice =
            cost_price === undefined ||
            cost_price === null
                ? null
                : Number(cost_price);

        const sellingPrice =
            Number(selling_price);

        if (
            costPrice !== null &&
            (
                !Number.isFinite(costPrice) ||
                costPrice < 0
            )
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid cost price"
            });
            return;
        }

        if (
            !Number.isFinite(sellingPrice) ||
            sellingPrice < 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid selling price"
            });
            return;
        }

        const data =
            await updatePricingService(
                inventoryId,
                costPrice,
                sellingPrice,
                userId
            );

        if (!data) {
            res.status(404).json({
                success: false,
                message:
                    "Inventory not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message:
                "Inventory pricing updated successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to update inventory pricing"
        );
    }
};

export const updateInventoryQuantity = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        const inventoryId =
            Number(req.params.id);

        const {
            qty,
            movement_type_id,
            reference_type_code,
            reference_id
        } = req.body;

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID parameter"
            });
            return;
        }

        if (qty === undefined) {
            res.status(400).json({
                success: false,
                message:
                    "qty is required"
            });
            return;
        }

        if (
            movement_type_id === undefined
        ) {
            res.status(400).json({
                success: false,
                message:
                    "movement_type_id is required"
            });
            return;
        }

        if (
            reference_type_code === undefined
        ) {
            res.status(400).json({
                success: false,
                message:
                    "reference_type_code is required"
            });
            return;
        }

        const quantityChange =
            Number(qty);

        const movementTypeId =
            Number(movement_type_id);

        const referenceTypeCode =
            String(
                reference_type_code
            ).trim();

        const referenceId =
            reference_id === undefined ||
            reference_id === null
                ? undefined
                : Number(reference_id);

        if (
            !Number.isInteger(
                quantityChange
            ) ||
            quantityChange === 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Quantity change must be a non-zero integer"
            });
            return;
        }

        if (
            !Number.isInteger(
                movementTypeId
            ) ||
            movementTypeId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid movement_type_id"
            });
            return;
        }

        if (!referenceTypeCode) {
            res.status(400).json({
                success: false,
                message:
                    "reference_type_code is required"
            });
            return;
        }

        if (
            referenceId !== undefined &&
            (
                !Number.isInteger(
                    referenceId
                ) ||
                referenceId <= 0
            )
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid reference_id"
            });
            return;
        }

        const data =
            await updateInventoryQuantityService(
                inventoryId,
                quantityChange,
                movementTypeId,
                referenceTypeCode,
                referenceId,
                userId
            );

        if (!data) {
            res.status(404).json({
                success: false,
                message:
                    "Inventory not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message:
                "Inventory quantity updated successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to update inventory quantity"
        );
    }
};

export const deactivateInventory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        const inventoryId =
            Number(req.params.id);

        if (
            !Number.isInteger(inventoryId) ||
            inventoryId <= 0
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid inventory ID parameter"
            });
            return;
        }

        const data =
            await deactivateInventoryService(
                inventoryId,
                userId
            );

        if (!data) {
            res.status(404).json({
                success: false,
                message:
                    "Inventory not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message:
                "Inventory deactivated successfully",
            data
        });
    } catch (error) {
        handleError(
            error,
            res,
            "Failed to deactivate inventory"
        );
    }
};

