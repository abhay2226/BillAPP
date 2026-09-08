import type { Request, Response } from "express";
import { verifyToken } from  "../utils/jwt.js"; // adjust path if verifyToken lives elsewhere
import {
  createDiscountService,
  getActiveDiscountsForStoreService,
  getDiscountByIdService,
  getDiscountByNameForStore,
  updateDiscountService,
  setDiscountActiveService,
} from "../services/DiscountServices.js";

// Helper: verify the bearer token and return the decoded payload.
// Throws if missing/invalid so each controller can catch it uniformly.
function getAuthUser(req: Request) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    const err: any = new Error("Unauthorized: missing token.");
    err.status = 401;
    throw err;
  }
  return verifyToken(token); // expected shape: { userId, roleId, storeId, ... }
}

export async function createDiscountController(req: Request, res: Response) {
  try {
    const actingUserId = req.auth.userId;

    const discount = await createDiscountService(req.body, actingUserId);
    return res.status(201).json({ success: true, message: "Discount created.", data: discount });
  } catch (error) {
    console.error("Create discount error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to create discount." });
  }
}

export async function getActiveDiscountsController(req: Request, res: Response) {
  try {
    getAuthUser(req); // require login; no role/store restriction beyond auth for now
    const discounts = await getActiveDiscountsForStoreService(Number(req.params.storeId));
    return res.status(200).json({ success: true, data: discounts });
  } catch (error) {
    console.error("Get active discounts error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discounts." });
  }
}

export async function getDiscountByIdController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const discount = await getDiscountByIdService(Number(req.params.id));
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    console.error("Get discount error:", error);
    const status = (error as any)?.status ?? 404;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discount." });
  }
}

export async function getDiscountByNameController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const storeId = Number(req.query.storeId);
    const name = String(req.query.name ?? "");
    const discount = await getDiscountByNameForStore(name, storeId);
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    console.error("Get discount by name error:", error);
    const status = (error as any)?.status ?? 404;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch discount." });
  }
}

export async function updateDiscountController(req: Request, res: Response) {
  try {

    const actingUserId = req.auth.userId;

    const discount = await updateDiscountService(Number(req.params.id), req.body, actingUserId);
    return res.status(200).json({ success: true, message: "Discount updated.", data: discount });
  } catch (error) {
    console.error("Update discount error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to update discount." });
  }
}

export async function setDiscountActiveController(req: Request, res: Response) {
  try {

    const actingUserId = req.auth.userId;

    const discount = await setDiscountActiveService(Number(req.params.id), Boolean(req.body.is_active), actingUserId);
    return res.status(200).json({ success: true, message: req.body.is_active ? "Discount activated." : "Discount deactivated.", data: discount });
  } catch (error) {
    console.error("Set discount active error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to update discount status." });
  }
}