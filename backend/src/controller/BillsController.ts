import type { Request, Response } from "express";
import {
  createBillService,
  deleteBillService,
  getBillById,
  getBillItemsForBill,
  getBillHistory,
  BillHistoryFilters,
} from "../services/BillServices.js";

import { verifyToken } from "../utils/jwt.js";

// Helper: verify the bearer token and return the decoded payload.
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    const err: any = new Error("Authorization header missing or invalid.");
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice("Bearer ".length);
  try {
    return verifyToken(token); // { userId, sessionId, storeId, roleId, ... }
  } catch {
    const err: any = new Error("Invalid or expired token.");
    err.status = 403;
    throw err;
  }
}

export async function createBillController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);
    if (!payload.sessionId) {
      return res.status(401).json({ success: false, message: "Session ID missing from token." });
    }
    const actingUserId = payload.userId;
    const sessionId = payload.sessionId;
    const bill = await createBillService(req.body, actingUserId, sessionId);
    return res.status(201).json({ success: true, message: "Bill created.", data: bill });
  } catch (error) {
    console.error("Create bill error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to create bill." });
  }
}

export async function deleteBillController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);
    if (!payload.sessionId) {
      return res.status(401).json({ success: false, message: "Session ID missing from token." });
    }
    const actingUserId = payload.userId;
    const sessionId = payload.sessionId;
    const bill = await deleteBillService(Number(req.params.id), actingUserId, sessionId);
    return res.status(200).json({ success: true, message: "Bill cancelled.", data: bill });
  } catch (error) {
    console.error("Delete bill error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to cancel bill." });
  }
}

export async function getBillByIdController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const bill = await getBillById(Number(req.params.storeId), Number(req.params.id));
    return res.status(200).json({ success: true, data: bill });
  } catch (error) {
    console.error("Get bill error:", error);
    const status = (error as any)?.status ?? 404;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill." });
  }
}

export async function getBillItemsController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const items = await getBillItemsForBill(Number(req.params.id));
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Get bill items error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill items." });
  }
}

export async function getBillHistoryController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);

    if (!payload.sessionId) {
        return res.status(401).json({
            success: false,
            message: "Session ID missing from token."
        });
    }
    
    const actingUserId = payload.userId;
    const sessionId = payload.sessionId;
    const filters: BillHistoryFilters = {};

    if (typeof req.query.date === "string") {
    filters.date = req.query.date;
    }
    
    if (typeof req.query.dateFrom === "string") {
        filters.dateFrom = req.query.dateFrom;
    }
    
    if (typeof req.query.dateTo === "string") {
        filters.dateTo = req.query.dateTo;
    }
    
    if (typeof req.query.invoiceNumber === "string") {
        filters.invoiceNumber = req.query.invoiceNumber;
    }
    
    if (typeof req.query.customerPhone === "string") {
        filters.customerPhone = req.query.customerPhone;
    }
    
    const bills = await getBillHistory(
        Number(req.params.storeId),
        filters
    );
    return res.status(200).json({ success: true, data: bills });
  } catch (error) {
    console.error("Get bill history error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill history." });
  }
}