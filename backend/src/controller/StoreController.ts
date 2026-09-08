import type { Request,Response } from "express";
import { 
    getStores, 
    getStoreById,  
    updateStore, 
    deleteStore 
} from "../services/StoreServices.js";

import { verifyToken } from "../utils/jwt.js";


export async function getStoresController(req: Request, res: Response) {
  try {
    const roles = await getStores();
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch roles." });
  }
}

export async function getStoresByIdController(req: Request, res: Response) {
  try {
    const role = await getStoreById(Number(req.params.id));
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Get role error:", error);
    return res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch role." });
  }
}

export async function updateStoreController(req: Request, res: Response) {
    try {
    const storeId =req.auth.storeId;
    const sessionId=req.auth.sessionId;
    const actingUserId = req.auth.userId;
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const store = await updateStore(storeId, req.body, actingUserId,sessionId);
    return res.status(200).json({ success: true, message: "Store updated.", data: store });
  } catch (error) {
    console.error("Update store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update store." });
  }
}

export async function deleteStoreController(req: Request, res: Response) {
    try {
    const storeId =req.auth.storeId;
    const sessionId=req.auth.sessionId;
    const actingUserId = req.auth.userId;
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    await deleteStore(storeId, actingUserId,sessionId);
    return res.status(200).json({ success: true, message: "Store deactivated." });
  } catch (error) {
    console.error("Delete store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to deactivate store." });
  }
}