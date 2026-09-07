
import type { Request, Response } from "express";

import {
    createDamagedGoodsService,
    getAllDamagedGoodsService,
    getDamagedGoodsByIdService,
    getDamagedGoodsByInventoryService,
    updateDamagedGoodsService,
    deactivateDamagedGoodsService
} from "../services/DamageGoodsService.js";

import { verifyToken } from "../utils/jwt.js";

interface AuthPayload {
    userId: number;
    sessionId: number;
}

const authenticate = (req: Request): AuthPayload => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new Error("NO_TOKEN");
    }

    if (!authHeader.startsWith("Bearer ")) {
        throw new Error("INVALID_TOKEN_FORMAT");
    }

    const token = authHeader.substring(7);

    if (!token) {
        throw new Error("NO_TOKEN");
    }

    const payload = verifyToken(token) as AuthPayload;

    if (!payload || !payload.userId) {
        throw new Error("INVALID_USER");
    }

    return payload;
};

export const createDamagedGoods = async (
    req: Request,
    res: Response
) => {
    try {
        const payload = authenticate(req);

        if (!payload.sessionId) {
            return res.status(401).json({
                success: false,
                message: "Session ID missing from token"
            });
        }

        const {
            inventory_id,
            qty,
            reason,
            unit_cost
        } = req.body;

        if (
            inventory_id === undefined ||
            qty === undefined ||
            unit_cost === undefined ||
            reason === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "inventory_id, qty, unit_cost and reason are required"
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
                message: "Quantity must be a positive integer"
            });
        }

        if (
            typeof reason !== "string" ||
            reason.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Damage reason is required"
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

        const data = await createDamagedGoodsService(
            inventoryId,
            quantity,
            reason.trim(),
            unitCost,
            payload.userId,
            payload.sessionId
        );

        return res.status(201).json({
            success: true,
            message: "Damaged goods record created successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (error.message === "INVALID_TOKEN_FORMAT") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        if (error.message === "INVALID_USER") {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create damaged goods record"
        });
    }
};

export const getAllDamagedGoods = async (
    req: Request,
    res: Response
) => {
    try {
        authenticate(req);

        const data = await getAllDamagedGoodsService();

        return res.status(200).json({
            success: true,
            message: "Damaged goods records fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (
            error.message === "INVALID_TOKEN_FORMAT" ||
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch damaged goods records"
        });
    }
};

export const getDamagedGoodsById = async (
    req: Request,
    res: Response
) => {
    try {
        authenticate(req);

        const damageId = Number(req.params.id);

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid damage ID parameter"
            });
        }

        const data = await getDamagedGoodsByIdService(damageId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Damaged goods record fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (
            error.message === "INVALID_TOKEN_FORMAT" ||
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch damaged goods record"
        });
    }
};

export const getDamagedGoodsByInventory = async (
    req: Request,
    res: Response
) => {
    try {
        authenticate(req);

        const inventoryId = Number(req.params.inventoryId);

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
            await getDamagedGoodsByInventoryService(inventoryId);

        return res.status(200).json({
            success: true,
            message: "Damaged goods records fetched successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (
            error.message === "INVALID_TOKEN_FORMAT" ||
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch damaged goods records"
        });
    }
};

export const updateDamagedGoods = async (
    req: Request,
    res: Response
) => {
    try {
        const payload = authenticate(req);

        if (!payload.sessionId) {
            return res.status(401).json({
                success: false,
                message: "Session ID missing from token"
            });
        }

        const damageId = Number(req.params.id);

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid damage ID parameter"
            });
        }

        const {
            qty,
            reason,
            unit_cost
        } = req.body;

        if (
            qty === undefined ||
            unit_cost === undefined ||
            reason === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "qty, unit_cost and reason are required"
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
                message: "Quantity must be a positive integer"
            });
        }

        if (
            typeof reason !== "string" ||
            reason.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Damage reason is required"
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

        const data = await updateDamagedGoodsService(
            damageId,
            quantity,
            reason.trim(),
            unitCost,
            payload.userId,
            payload.sessionId
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Damaged goods record updated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (error.message === "INVALID_USER") {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        if (
            error.message === "INVALID_TOKEN_FORMAT" ||
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update damaged goods record"
        });
    }
};

export const deactivateDamagedGoods = async (
    req: Request,
    res: Response
) => {
    try {
        const payload = authenticate(req);

        if (!payload.sessionId) {
            return res.status(401).json({
                success: false,
                message: "Session ID missing from token"
            });
        }

        const damageId = Number(req.params.id);

        if (
            !Number.isInteger(damageId) ||
            damageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid damage ID parameter"
            });
        }

        const data =
            await deactivateDamagedGoodsService(
                damageId,
                payload.userId,
                payload.sessionId
            );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Damaged goods record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Damaged goods record deactivated successfully",
            data
        });
    } catch (error: any) {
        console.error(error);

        if (error.message === "NO_TOKEN") {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (error.message === "INVALID_USER") {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }

        if (
            error.message === "INVALID_TOKEN_FORMAT" ||
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to deactivate damaged goods record"
        });
    }
};
