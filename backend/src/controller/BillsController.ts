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

export async function createBillController(req: Request, res: Response) {
  try {
    const actingUserId = Number(req.body.actingUserId);
    const sessionId = Number(req.body.sessionId);
    if (!actingUserId || !sessionId) {
      return res.status(400).json({ success: false, message: "actingUserId and sessionId are required." });
    }
    const bill = await createBillService(req.body, actingUserId, sessionId);
    return res.status(201).json({ success: true, message: "Bill created.", data: bill });
  } catch (error) {
    console.error("Create bill error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to create bill." });
  }
}

export async function deleteBillController(req: Request, res: Response) {
  try {
    const actingUserId = Number(req.body.actingUserId);
    const sessionId = Number(req.body.sessionId);
    if (!actingUserId || !sessionId) {
      return res.status(400).json({ success: false, message: "actingUserId and sessionId are required." });
    }
    const bill = await deleteBillService(Number(req.params.id), actingUserId, sessionId);
    return res.status(200).json({ success: true, message: "Bill cancelled.", data: bill });
  } catch (error) {
    console.error("Delete bill error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to cancel bill." });
  }
}

export async function getBillByIdController(req: Request, res: Response) {
  try {
    const bill = await getBillById(Number(req.params.storeId), Number(req.params.id));
    return res.status(200).json({ success: true, data: bill });
  } catch (error) {
    console.error("Get bill error:", error);
    return res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill." });
  }
}

export async function getBillItemsController(req: Request, res: Response) {
  try {
    const items = await getBillItemsForBill(Number(req.params.id));
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Get bill items error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill items." });
  }
}

export async function getBillHistoryController(req: Request, res: Response) {
  try {
        const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing or invalid."
        });
    }
    
    const token = authHeader.slice("Bearer ".length);
    
    let payload;
    
    try {
        payload = verifyToken(token);
    } catch {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
    
    if (!payload.sessionId) {
        return res.status(401).json({
            success: false,
            message: "Session ID missing from token."
        });
    }
    
    const actingUserId = payload.userId;
    const sessionId = payload.sessionId;
    // const { date, dateFrom, dateTo, invoiceNumber, customerPhone } = req.query;
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
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill history." });
  }
}