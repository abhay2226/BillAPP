import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application } from "express";

import authRoutes from "./routes/AuthRoute.js";
import productRoutes from "./routes/Productroutes.js";
import inventoryRoutes from "./routes/InventoryRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import storeRoutes from "./routes/StoreRoute.js";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/roles", authRoutes);
app.use("/stores", storeRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);

export default app;


