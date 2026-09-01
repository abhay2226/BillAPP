import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application } from "express";

import authRoutes from "./routes/AuthRoute.js";
import productRoutes from "./routes/Productroutes.js";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

export default app;


