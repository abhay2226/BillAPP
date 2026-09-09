import type { Request, Response } from "express";
import {
    getStores,
    getStoreById,
    updateStore,
    closeStore,
    restoreStore
} from "../services/StoreServices.js";
import { validateIdParam, validateStoreUpdate } from "../validation/validators.js";
import { sendErrorResponse } from "../utils/AppError.js";

//=========================================================================
// get all stores
//=========================================================================
export async function getStoresController(req: Request, res: Response) {
    try {
        const stores = await getStores();
        return res.status(200).json({
            success: true,
            data: stores
        });
    } catch (error) {
        console.error("Get stores error:", error);
        return sendErrorResponse(res, error, 500);
    }
}

//=========================================================================
// get store by id
//=========================================================================
export async function getStoresByIdController(req: Request, res: Response) {
    try {
        const storeId = validateIdParam(req.params.id, "store ID");
        const store = await getStoreById(storeId);
        return res.status(200).json({
            success: true,
            data: store
        });
    } catch (error) {
        console.error("Get store error:", error);
        return sendErrorResponse(res, error, 404);
    }
}

//=========================================================================
// update store
//=========================================================================
export async function updateStoreController(req: Request, res: Response) {
    try {
        const storeId = validateIdParam(req.params.id, "store ID");
        validateStoreUpdate(req.body);

        const sessionId = req.auth.sessionId;
        const actingUserId = req.auth.userId;

        const store = await updateStore(storeId, req.body, actingUserId, sessionId);
        return res.status(200).json({
            success: true,
            message: "Store updated successfully.",
            data: store
        });
    } catch (error) {
        console.error("Update store error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

//=========================================================================
// close store
//=========================================================================
export async function closeStoreController(req: Request, res: Response) {
    try {
        const storeId = validateIdParam(req.params.id, "store ID");
        const sessionId = req.auth.sessionId;
        const actingUserId = req.auth.userId;

        await closeStore(storeId, actingUserId, sessionId);
        return res.status(200).json({
            success: true,
            message: "Store closed successfully."
        });
    } catch (error) {
        console.error("Close store error:", error);
        return sendErrorResponse(res, error, 400);
    }
}

// Alias deleteStoreController for backwards compatibility
export const deleteStoreController = closeStoreController;

//=========================================================================
// restore store
//=========================================================================
export async function restoreStoreController(req: Request, res: Response) {
    try {
        const storeId = validateIdParam(req.params.id, "store ID");
        const sessionId = req.auth.sessionId;
        const actingUserId = req.auth.userId;

        await restoreStore(storeId, actingUserId, sessionId);
        return res.status(200).json({
            success: true,
            message: "Store restored successfully."
        });
    } catch (error) {
        console.error("Restore store error:", error);
        return sendErrorResponse(res, error, 400);
    }
}