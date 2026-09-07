import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application } from "express";

import type { Request ,Response , NextFunction} from "express";

import authRoutes from "./routes/AuthRoute.js";
import productRoutes from "./routes/Productroutes.js";
import inventoryRoutes from "./routes/InventoryRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import storeRoutes from "./routes/StoreRoute.js";
import customerRoutes from "./routes/CustomerRoute.js";
import billRoutes from "./routes/BillRoute.js";
import auditRoutes from "./routes/AuditRoute.js";

import  { authenticate } from "./middleware/Authenticate.js"

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  const status = err.status || 500;
  const message = err.message || "Server error";

  res.status(status).json({ success: false, message });
});


app.use("/auth", authRoutes);


app.use("/users", authenticate ,userRoutes);
app.use("/roles", authenticate , authRoutes);
app.use("/stores", authenticate , storeRoutes);
app.use("/inventory", authenticate , inventoryRoutes);
app.use("/products", authenticate , productRoutes);
app.use("/customers", authenticate, customerRoutes);
app.use("/bills", authenticate, billRoutes);
app.use("/audits", authenticate, auditRoutes);

export default app;


