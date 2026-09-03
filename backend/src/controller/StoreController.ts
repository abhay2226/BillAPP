import type { Request,Response } from "express";
import { 
    getStores, 
    getStoreById, 
    createStore, 
    updateStore, 
    deleteStore 
} from "../services/StoreServices.js";

export async function updateStoreController(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.id);
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const store = await updateStore(storeId, req.body, actingUserId);
    return res.status(200).json({ success: true, message: "Store updated.", data: store });
  } catch (error) {
    console.error("Update store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update store." });
  }
}

export async function deleteStoreController(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.id);
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    await deleteStore(storeId, actingUserId);
    return res.status(200).json({ success: true, message: "Store deactivated." });
  } catch (error) {
    console.error("Delete store error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to deactivate store." });
  }
}