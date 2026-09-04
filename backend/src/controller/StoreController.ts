import type { Request,Response } from "express";
import { 
    getStores, 
    getStoreById,  
    updateStore, 
    deleteStore 
} from "../services/StoreServices.js";

import { verifyToken } from "../utils/jwt.js";

export async function updateStoreController(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        res.status(401).json({
            success: false,
            message: "Bearer token is required"
        });
        return;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Bearer token is required"
        });
        return;
    }
    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
        return;
    }
    try {
    const storeId = Number(req.params.id);
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const sessionId =Number(payload.sessionId);
    const store = await updateStore(storeId, req.body, actingUserId,sessionId);
    return res.status(200).json({ success: true, message: "Store updated.", data: store });
  } catch (error) {
    console.error("Update store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update store." });
  }
}

export async function deleteStoreController(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        res.status(401).json({
            success: false,
            message: "Bearer token is required"
        });
        return;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Bearer token is required"
        });
        return;
    }
    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
        return;
    }
    try {
    const storeId = Number(req.params.id);
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const sessionId =Number(payload.sessionId);
    await deleteStore(storeId, actingUserId,sessionId);
    return res.status(200).json({ success: true, message: "Store deactivated." });
  } catch (error) {
    console.error("Delete store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to deactivate store." });
  }
}