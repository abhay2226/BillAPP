// BillRoutes.ts
import { Router } from "express";
import {
  createBillController,
  deleteBillController,
  getBillByIdController,
  getBillItemsController,
  getBillHistoryController,
} from "../controller/BillsController.js";


import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";


const billRouter = Router();

billRouter.use(authenticate);

billRouter.post("/",authorize("OWNER", "STAFF"), createBillController);
billRouter.get("/history/:storeId",authorize("OWNER", "STAFF"),requireStoreAccess("params", "storeId"), getBillHistoryController);
billRouter.get("/items/:id",authorize("OWNER", "STAFF"), getBillItemsController);
billRouter.get("/:storeId/:id",authorize("OWNER", "STAFF"),requireStoreAccess("params", "storeId"), getBillByIdController);
billRouter.delete("/:id",authorize("OWNER"), deleteBillController);

export default billRouter;