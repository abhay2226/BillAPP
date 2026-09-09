import { Router } from "express";

import {
    createInventory,
    getInventoryByStore,
    getInventoryById,
    updateInventoryPricing,
    updateInventoryQuantity,
    deactivateInventory
} from "../controller/InventoryController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";

const router = Router();

router.use(authenticate);



router.get("/store/:storeId",authorize("OWNER", "STAFF"),requireStoreAccess("params", "storeId"), getInventoryByStore);

router.get("/:id",authorize("OWNER","STAFF"), getInventoryById);



router.post("/",authorize("OWNER"), createInventory);

router.put("/pricing/:id",authorize("OWNER"), updateInventoryPricing);

router.put("/quantity/:id",authorize("OWNER"), updateInventoryQuantity);

router.patch("/deactivate/:id",authorize("OWNER"), deactivateInventory);

export default router;