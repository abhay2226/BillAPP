import type { Request, Response } from "express";

import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService
} from "../services/ProductService.js";

import { verifyToken } from "../utils/jwt.js";


// CREATE PRODUCT

export async function createProductController(
    req: Request,
    res: Response
) {
    try {

        const authHeader =
            req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token =
            authHeader.slice("Bearer ".length);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }


        const clientIp =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            null;

        const product =
            await createProductService(
                req.body,
                payload.userId,
                payload.sessionId,
                clientIp
            );


        return res.status(201).json({
            message: "Product created successfully",
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to create product"
        });
    }
}



// GET ALL PRODUCTS
// SEARCH PRODUCT BY NAME
// FILTER PRODUCT BY STORE

export const getAllProductsController = async (
    req: Request,
    res: Response
) => {
    try {

        const authHeader =
            req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token =
            authHeader.slice("Bearer ".length);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }


        const storeId =
            req.query.storeId !== undefined
                ? Number(req.query.storeId)
                : undefined;


        const productName =
            req.query.productName !== undefined
                ? String(req.query.productName)
                : undefined;


        // VALIDATE STORE ID

        if (
            storeId !== undefined &&
            (!Number.isInteger(storeId) ||
                storeId <= 0)
        ) {

            return res.status(400).json({
                message: "Invalid store ID"
            });
        }


        const products =
            await getAllProductsService(
                storeId,
                productName
            );


        return res.status(200).json({
            message: "Products fetched successfully",
            data: products
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};



// GET PRODUCT BY ID

export const getProductByIdController = async (
    req: Request,
    res: Response
) => {
    try {

        const authHeader =
            req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token =
            authHeader.slice("Bearer ".length);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }


        const productId =
            Number(req.params.id);


        // VALIDATE PRODUCT ID

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid product ID"
            });
        }


        const product =
            await getProductByIdService(
                productId
            );


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });
        }


        return res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch product"
        });
    }
};



// UPDATE PRODUCT

export const updateProductController = async (
    req: Request,
    res: Response
) => {
    try {

        const authHeader =
            req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token =
            authHeader.slice("Bearer ".length);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }


        const productId =
            Number(req.params.id);


        // VALIDATE PRODUCT ID

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid product ID"
            });
        }


        const clientIp =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            null;

        const product =
            await updateProductService(
                productId,
                req.body,
                payload.userId,
                payload.sessionId,
                clientIp
            );


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });
        }


        return res.status(200).json({
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to update product"
        });
    }
};



// DELETE / DEACTIVATE PRODUCT

export const deleteProductController = async (
    req: Request,
    res: Response
) => {
    try {

        const authHeader =
            req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token =
            authHeader.slice("Bearer ".length);

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }


        const productId =
            Number(req.params.id);


        // VALIDATE PRODUCT ID

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid product ID"
            });
        }


        const clientIp =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            null;

        const product =
            await deleteProductService(
                productId,
                payload.userId,
                payload.sessionId,
                clientIp
            );


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });
        }


        return res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to delete product"
        });
    }
};