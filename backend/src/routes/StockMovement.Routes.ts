import { Router } from "express";
import { adjustStock } from "../controller/StockMovementController.js";

import { authenticate } from "../middleware/Authenticate.js";

import { authorize } from "../middleware/Authorize.js";


const StockMovementRouter = Router();
StockMovementRouter.use(authenticate);

StockMovementRouter.post("/update",authorize("OWNER", "STAFF"), adjustStock);

export default StockMovementRouter;
