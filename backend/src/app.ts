import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application, Request, Response, NextFunction } from "express";

import authRoutes from "./routes/AuthRoute.js";
import rolesRoutes from "./routes/RolesRoutes.js";
import productRoutes from "./routes/Productroutes.js";
import inventoryRoutes from "./routes/InventoryRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import storeRoutes from "./routes/StoreRoute.js";
import customerRoutes from "./routes/CustomerRoute.js";
import billRoutes from "./routes/BillRoute.js";
import auditRoutes from "./routes/AuditRoute.js";
import discountRoutes from "./routes/DiscountsRoute.js";
import stockMovementRoutes from "./routes/StockMovement.Routes.js";
import ProductTypeRouter from "./routes/ProductTypeRoutes.js";
import ProductBrandRouter from "./routes/ProductBrandRoutes.js";
import UnitRouter from "./routes/UomRoute.js";
import damageGoodsRoutes from "./routes/DamageGood.routes.js";


const app: Application = express();


const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
    : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/roles", rolesRoutes);
app.use("/stores", storeRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/bills", billRoutes);
app.use("/audits", auditRoutes);
app.use("/discounts", discountRoutes);
app.use("/stock-movements", stockMovementRoutes);
app.use("/product-types",ProductTypeRouter);
app.use("/product-brands",ProductBrandRouter);
app.use("/units",UnitRouter);
app.use("/damaged-goods", damageGoodsRoutes);

// Catch-all 404 handler for undefined routes
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`
    });
});

// Centralized error handling middleware (registered AFTER all routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || "An unexpected server error occurred.";
    res.status(status).json({
        success: false,
        message
    });
});

export default app;
