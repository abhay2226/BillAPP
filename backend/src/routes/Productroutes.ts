import { Router } from "express";
import type { Request, Response } from "express";

import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService
} from "../services/ProductService.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const product = await createProductService(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const storeId = req.query.store_id
            ? Number(req.query.store_id)
            : undefined;

        const products = await getAllProductsService(storeId);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            count: products.length,
            data: products
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);

        if (Number.isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await getProductByIdService(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);

        if (Number.isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await updateProductService(productId, req.body);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);

        if (Number.isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await deleteProductService(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export default router;