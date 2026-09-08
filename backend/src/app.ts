import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application } from "express";

import type { Request ,Response , NextFunction} from "express";

import authRoutes from "./routes/AuthRoute.js";
import rolesRoutes from "./routes/RolesRoutes.js"
import productRoutes from "./routes/Productroutes.js";
import inventoryRoutes from "./routes/InventoryRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import storeRoutes from "./routes/StoreRoute.js";
import customerRoutes from "./routes/CustomerRoute.js";
import billRoutes from "./routes/BillRoute.js";
import auditRoutes from "./routes/AuditRoute.js";
import discountRoutes from "./routes/DiscountsRoute.js";
import stockMovementRoutes from "./routes/StockMovement.Routes.js";

// import  { authenticate } from "./middleware/Authenticate.js"

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


app.use("/users",   userRoutes);
app.use("/roles",    rolesRoutes);
app.use("/stores",    storeRoutes);
app.use("/inventory",    inventoryRoutes);
app.use("/products",    productRoutes);
app.use("/customers",   customerRoutes);
app.use("/bills",   billRoutes);
app.use("/audits",  auditRoutes);
app.use("/discounts",  discountRoutes);
app.use("/stock-movements", stockMovementRoutes);

export default app;

