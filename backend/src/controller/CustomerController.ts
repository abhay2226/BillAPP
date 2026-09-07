import type { Request, Response } from "express";

import {
    createCustomerService,
    getAllCustomersService,
    getActiveCustomersService,
    getCustomerByIdService,
    getCustomerByPhoneService,
    searchCustomersService,
    updateCustomerService,
    deactivateCustomerService,
    activateCustomerService,
    getCustomerBillsService
} from "../services/CustomerServices.js";

import { verifyToken } from "../utils/jwt.js";

// interface AuthPayload {
//     userId: number;
//     sessionId?: number;
// }

// const authenticate = (req: Request): AuthPayload => {
//     const reqUser = (req as any).user;
//     if (reqUser && (reqUser.userId || reqUser.user_id)) {
//         return {
//             userId: Number(reqUser.userId || reqUser.user_id),
//             sessionId: reqUser.sessionId || reqUser.session_id
//         };
//     }

//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         throw new Error("NO_TOKEN");
//     }

//     if (!authHeader.startsWith("Bearer ")) {
//         throw new Error("INVALID_TOKEN_FORMAT");
//     }

//     const token = authHeader.substring(7).trim();

//     if (!token) {
//         throw new Error("NO_TOKEN");
//     }

//     const payload = verifyToken(token) as AuthPayload;

//     if (!payload || !payload.userId) {
//         throw new Error("INVALID_USER");
//     }

//     return payload;
// };

const handleAuthError = (error: any, res: Response): boolean => {
    if (error.message === "NO_TOKEN") {
        res.status(401).json({
            success: false,
            message: "No token provided"
        });
        return true;
    }

    if (error.message === "INVALID_TOKEN_FORMAT") {
        res.status(401).json({
            success: false,
            message: "Invalid authorization format"
        });
        return true;
    }

    if (error.message === "INVALID_USER") {
        res.status(401).json({
            success: false,
            message: "Authenticated user not found"
        });
        return true;
    }

    if (
        error.message === "JsonWebTokenError" ||
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
    ) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
        return true;
    }

    return false;
};

// ======================================================
// CREATE CUSTOMER
// ======================================================

export const createCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        // const payload = authenticate(req);

        const { phone_no } = req.body;

        if (!phone_no || typeof phone_no !== "string" || phone_no.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const customer = await createCustomerService(
            phone_no.trim(),
            Number(req.params.userId)
        );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(500).json({
            success: false,
            message: "Failed to create customer",
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        });
    }
};

// ======================================================
// GET ALL CUSTOMERS
// ======================================================

export const getAllCustomers = async (
    req: Request,
    res: Response
) => {
    try {
        // authenticate(req);

        const customers =
            await getAllCustomersService();

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            data: customers
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve customers",
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        });
    }
};

// ======================================================
// GET ACTIVE CUSTOMERS
// ======================================================

export const getActiveCustomers = async (
    req: Request,
    res: Response
) => {
    try {
        // authenticate(req);

        const customers =
            await getActiveCustomersService();

        return res.status(200).json({
            success: true,
            message: "Active customers retrieved successfully",
            data: customers
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve active customers",
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        });
    }
};

// ======================================================
// GET CUSTOMER BY ID
// ======================================================

export const getCustomerById = async (
    req: Request,
    res: Response
) => {
    try {
        // authenticate(req);

        const customer_id =
            Number(req.params.id);

        if (!Number.isInteger(customer_id) || customer_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const customer =
            await getCustomerByIdService(customer_id);

        return res.status(200).json({
            success: true,
            message: "Customer retrieved successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};

// ======================================================
// SEARCH CUSTOMER BY PHONE
// ======================================================

export const getCustomerByPhone = async (
    req: Request,
    res: Response
) => {
    try {
        // authenticate(req);

        const phone_no =
            req.query.phone as string;

        if (!phone_no || typeof phone_no !== "string" || phone_no.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const customer =
            await getCustomerByPhoneService(phone_no.trim());

        return res.status(200).json({
            success: true,
            message: "Customer found successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};

// ======================================================
// SEARCH CUSTOMERS
// ======================================================

export const searchCustomers = async (
    req: Request,
    res: Response
) => {
    try {
        // authenticate(req);

        const search =
            req.query.search as string;

        if (!search || typeof search !== "string" || search.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search value is required"
            });
        }

        const customers =
            await searchCustomersService(search.trim());

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            data: customers
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(500).json({
            success: false,
            message: "Failed to search customers",
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        });
    }
};

// ======================================================
// UPDATE CUSTOMER
// ======================================================

export const updateCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        // const payload = authenticate(req);

        const customer_id =
            Number(req.params.id);

        if (!Number.isInteger(customer_id) || customer_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const { phone_no } = req.body;

        if (!phone_no || typeof phone_no !== "string" || phone_no.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const customer =
            await updateCustomerService(
                customer_id,
                phone_no.trim(),
                Number(req.params.userId)
            );

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};

// ======================================================
// DEACTIVATE CUSTOMER
// ======================================================

export const deactivateCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        // const payload = authenticate(req);

        const customer_id =
            Number(req.params.id);

        if (!Number.isInteger(customer_id) || customer_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const customer =
            await deactivateCustomerService(
                customer_id,
                Number(req.params.userId)
            );

        return res.status(200).json({
            success: true,
            message: "Customer deactivated successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};

// ======================================================
// ACTIVATE CUSTOMER
// ======================================================

export const activateCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        // const payload = authenticate(req);

        const customer_id =
            Number(req.params.id);

        if (!Number.isInteger(customer_id) || customer_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const customer =
            await activateCustomerService(
                customer_id,
                Number(req.params.userId)
            );

        return res.status(200).json({
            success: true,
            message: "Customer activated successfully",
            data: customer
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};

// ======================================================
// GET CUSTOMER BILLS
// ======================================================

export const getCustomerBills = async (
    req: Request,
    res: Response
) => {
    try {

        const customer_id =
            Number(req.params.id);

        if (!Number.isInteger(customer_id) || customer_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const bills =
            await getCustomerBillsService(customer_id);

        return res.status(200).json({
            success: true,
            message: "Customer bills retrieved successfully",
            data: bills
        });
    } catch (error: any) {
        if (handleAuthError(error, res)) return;

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};