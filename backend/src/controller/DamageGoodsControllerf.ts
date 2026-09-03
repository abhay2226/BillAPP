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

export const createDamagedGoods = async (
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

        const userId = payload.userId;

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

        const userId = payload.userId;

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

        const userId = payload.userId;

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