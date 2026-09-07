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

const discountRouter = Router();

discountRouter.post("/", createDiscountController);
discountRouter.get("/store/:storeId", getActiveDiscountsController);
discountRouter.get("/by-name", getDiscountByNameController);
discountRouter.get("/:id", getDiscountByIdController);
discountRouter.patch("/:id", updateDiscountController);
discountRouter.patch("/:id/status", setDiscountActiveController);

export default discountRouter;