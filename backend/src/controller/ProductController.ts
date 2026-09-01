import type { Request, Response } from "express";

import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService
} from "../services/ProductService.js";

export const createProductController = async (
    req: Request,
    res: Response
) => {
    try {
        const product = await createProductService(req.body);

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
};

export const getAllProductsController = async (
    req: Request,
    res: Response
) => {
    try {
        const products = await getAllProductsService();

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

export const getProductByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.id);

        const product = await getProductByIdService(productId);

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

export const updateProductController = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.id);

        const product = await updateProductService(productId, req.body);

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

export const deleteProductController = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.id);

        const product = await deleteProductService(productId);

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