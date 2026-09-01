import { Router } from "express";
import { adjustStock } from "../controller/StockMovementController.js";

const StockMovementRouter = Router();

StockMovementRouter.post("/update", adjustStock);

export default StockMovementRouter;
