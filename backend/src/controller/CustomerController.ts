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


// ======================================================
// CREATE CUSTOMER
// ======================================================

export const createCustomer = async (
    req: Request,
    res: Response
) => {

    try {

        const { phone_no } = req.body;

        if (!phone_no) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const user_id = (req as any).user.user_id;

        const customer = await createCustomerService(
            phone_no,
            user_id
        );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {

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

        const customers =
            await getAllCustomersService();

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            data: customers
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve customers"
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

        const customers =
            await getActiveCustomersService();

        return res.status(200).json({
            success: true,
            message: "Active customers retrieved successfully",
            data: customers
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve active customers"
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

        const customer_id =
            Number(req.params.id);

        if (isNaN(customer_id)) {
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

    } catch (error) {

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

        const phone_no =
            req.query.phone as string;

        if (!phone_no) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        const customer =
            await getCustomerByPhoneService(phone_no);

        return res.status(200).json({
            success: true,
            message: "Customer found successfully",
            data: customer
        });

    } catch (error) {

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

        const search =
            req.query.search as string;

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search value is required"
            });
        }

        const customers =
            await searchCustomersService(search);

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            data: customers
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to search customers"
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

        const customer_id =
            Number(req.params.id);

        if (isNaN(customer_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const { phone_no } = req.body;

        const user_id =
            (req as any).user.user_id;

        const customer =
            await updateCustomerService(
                customer_id,
                phone_no,
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });

    } catch (error) {

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

        const customer_id =
            Number(req.params.id);

        if (isNaN(customer_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const user_id =
            (req as any).user.user_id;

        const customer =
            await deactivateCustomerService(
                customer_id,
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Customer deactivated successfully",
            data: customer
        });

    } catch (error) {

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

        const customer_id =
            Number(req.params.id);

        if (isNaN(customer_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const user_id =
            (req as any).user.user_id;

        const customer =
            await activateCustomerService(
                customer_id,
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Customer activated successfully",
            data: customer
        });

    } catch (error) {

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

        if (isNaN(customer_id)) {
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

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Customer not found"
        });
    }
};