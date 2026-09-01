import "reflect-metadata";
import express from "express";
import cors from "cors";
import type { Application } from "express";

//imports fr routes
// import authRoutes from "./routes/AuthRoute.js";

//express app
const app: Application= express();
app.use(cors());
app.use(express.json());

// app.use("/auth",authRoutes);


export default app;


