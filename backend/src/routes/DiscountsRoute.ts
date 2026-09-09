// DiscountRoutes.ts
import { Router } from "express";
import {
  createDiscountController,
  getActiveDiscountsController,
  getDiscountByIdController,
  getDiscountByNameController,
  updateDiscountController,
  setDiscountActiveController,
} from "../controller/DiscountController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";


const discountRouter = Router();
discountRouter.use(authenticate);

discountRouter.post("/",authorize("OWNER"), createDiscountController);
discountRouter.get("/store/:storeId", authorize("OWNER", "STAFF"),requireStoreAccess("params", "storeId"),getActiveDiscountsController);
discountRouter.get("/by-name",authorize("OWNER", "STAFF"), getDiscountByNameController);
discountRouter.get("/:id",authorize("OWNER", "STAFF"),getDiscountByIdController);
discountRouter.patch("/:id",authorize("OWNER", "STAFF"), updateDiscountController);
discountRouter.patch("/:id/status",authorize("OWNER", "STAFF"), setDiscountActiveController);

export default discountRouter;