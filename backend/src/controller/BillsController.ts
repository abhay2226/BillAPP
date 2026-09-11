import type { Request, Response } from "express";
import {
    createBillService,
    deleteBillService,
    getBillById,
    getBillItemsForBill,
    getBillHistory,
    BillHistoryFilters
} from "../services/BillServices.js";

export async function createBillController(req: Request, res: Response) {
    try {
        const actingUserId = req.auth.userId;
        const sessionId = req.auth.sessionId;
        if (!actingUserId || !sessionId) {
            return res.status(400).json({ success: false, message: "actingUserId and sessionId are required." });
        }

        const bill = await createBillService(req.body, actingUserId, sessionId, req.auth.storeId);

        return res.status(201).json({ success: true, message: "Bill created.", data: bill });
    } catch (error) {
        console.error("Create bill error:", error);

        if (error instanceof Error && error.message === "STORE_MISMATCH") {
            return res.status(403).json({
                success: false,
                message: "You cannot create a bill for another store."
            });
        }

        const status = (error as any)?.status ?? 400;
        return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to create bill." });
    }
}

export async function deleteBillController(req: Request, res: Response) {
    try {
        const actingUserId = req.auth.userId;
        const sessionId = req.auth.sessionId;
        if (!actingUserId || !sessionId) {
            return res.status(400).json({ success: false, message: "actingUserId and sessionId are required." });
        }

        const bill = await deleteBillService(Number(req.params.id), actingUserId, sessionId, req.auth.storeId);

        return res.status(200).json({ success: true, message: "Bill cancelled.", data: bill });
    } catch (error) {
        console.error("Delete bill error:", error);

        if (error instanceof Error && error.message === "STORE_MISMATCH") {
            return res.status(403).json({
                success: false,
                message: "You cannot cancel a bill from another store."
            });
        }

        const status = (error as any)?.status ?? 400;
        return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to cancel bill." });
    }
}

export async function getBillByIdController(req: Request, res: Response) {
    try {
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
        const billId = Number(req.params.id);

        const items = await getBillItemsForBill(billId, req.auth.storeId);

        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("Get bill items error:", error);

         
        if (error instanceof Error && error.message === "STORE_MISMATCH") {
            return res.status(403).json({
                success: false,
                message: "You cannot view line items for a bill from another store."
            });
        }

        const status = (error as any)?.status ?? 400;
        return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill items." });
    }
}

export async function getBillHistoryController(req: Request, res: Response) {
    try {
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

        const bills = await getBillHistory(Number(req.params.storeId), filters);
        return res.status(200).json({ success: true, data: bills });
    } catch (error) {
        console.error("Get bill history error:", error);
        const status = (error as any)?.status ?? 400;
        return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch bill history." });
    }
}