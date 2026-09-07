// BillRoutes.ts
import { Router } from "express";
import {
  createBillController,
  deleteBillController,
  getBillByIdController,
  getBillItemsController,
  getBillHistoryController,
} from "../controller/BillsController.js";

const billRouter = Router();

billRouter.post("/", createBillController);
billRouter.get("/history/:storeId", getBillHistoryController);
billRouter.get("/items/:id", getBillItemsController);
billRouter.get("/:storeId/:id", getBillByIdController);
billRouter.delete("/:id", deleteBillController);

export default billRouter;