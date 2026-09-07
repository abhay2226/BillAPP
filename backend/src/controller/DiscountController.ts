import type { Request, Response } from "express";
import {
  createDiscountService,
  getActiveDiscountsForStoreService,
  getDiscountByIdService,
  getDiscountByNameForStore,
  updateDiscountService,
  setDiscountActiveService,
} from "../Services/DiscountServices.js";

export async function createDiscountController(req: Request, res: Response) {
  try {
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const discount = await createDiscountService(req.body, actingUserId);
    return res.status(201).json({ success: true, message: "Discount created.", data: discount });
  } catch (error) {
    console.error("Create discount error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to create discount." });
  }
}

export async function getActiveDiscountsController(req: Request, res: Response) {
  try {
    const discounts = await getActiveDiscountsForStoreService(Number(req.params.storeId));
    return res.status(200).json({ success: true, data: discounts });
  } catch (error) {
    console.error("Get active discounts error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discounts." });
  }
}

export async function getDiscountByIdController(req: Request, res: Response) {
  try {
    const discount = await getDiscountByIdService(Number(req.params.id));
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    console.error("Get discount error:", error);
    return res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discount." });
  }
}

export async function getDiscountByNameController(req: Request, res: Response) {
  try {
    const storeId = Number(req.query.storeId);
    const name = String(req.query.name ?? "");
    const discount = await getDiscountByNameForStore(name, storeId);
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    console.error("Get discount by name error:", error);
    return res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discount." });
  }
}

export async function updateDiscountController(req: Request, res: Response) {
  try {
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const discount = await updateDiscountService(Number(req.params.id), req.body, actingUserId);
    return res.status(200).json({ success: true, message: "Discount updated.", data: discount });
  } catch (error) {
    console.error("Update discount error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update discount." });
  }
}

export async function setDiscountActiveController(req: Request, res: Response) {
  try {
    const actingUserId = Number(req.body.actingUserId);
    if (!actingUserId) {
      return res.status(400).json({ success: false, message: "actingUserId is required." });
    }
    const discount = await setDiscountActiveService(Number(req.params.id), Boolean(req.body.is_active), actingUserId);
    return res.status(200).json({ success: true, message: req.body.is_active ? "Discount activated." : "Discount deactivated.", data: discount });
  } catch (error) {
    console.error("Set discount active error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update discount status." });
  }
}