import { Router } from "express";

import {
  createDiscountController,
  getActiveDiscountsController,
  getDiscountByIdController,
  getDiscountByNameController,
  updateDiscountController,
  setDiscountActiveController,
  getDiscountTypeController,
  getDiscountTypeByCodeController,
  getDiscountTypeByIdController,
} from "../controller/DiscountController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";

const discountRouter = Router();

discountRouter.use(authenticate);

// =============================
// DISCOUNT TYPES
// =============================

discountRouter.get(
  "/types",
  authorize("OWNER", "STAFF"),
  getDiscountTypeController
);

discountRouter.get(
  "/types/by-code",
  authorize("OWNER", "STAFF"),
  getDiscountTypeByCodeController
);

discountRouter.get(
  "/types/:id",
  authorize("OWNER", "STAFF"),
  getDiscountTypeByIdController
);

// =============================
// DISCOUNTS
// =============================

discountRouter.post(
  "/",
  authorize("OWNER"),
  createDiscountController
);

discountRouter.get(
  "/store/:storeId",
  authorize("OWNER", "STAFF"),
  requireStoreAccess("params", "storeId"),
  getActiveDiscountsController
);

discountRouter.get(
  "/by-name",
  authorize("OWNER", "STAFF"),
  getDiscountByNameController
);

discountRouter.get(
  "/:id",
  authorize("OWNER", "STAFF"),
  getDiscountByIdController
);

discountRouter.patch(
  "/:id",
  authorize("OWNER"),
  updateDiscountController
);

discountRouter.patch(
  "/:id/status",
  authorize("OWNER"),
  setDiscountActiveController
);

export default discountRouter;