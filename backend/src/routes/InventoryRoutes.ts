import { Router } from "express";

import {
    createInventory,
    getInventoryByStore,
    getInventoryById,
    updateInventoryPricing,
    updateInventoryQuantity,
    deactivateInventory
} from "../controller/InventoryController.js";

const router = Router();

router.post("/", createInventory);

router.get("/store/:storeId", getInventoryByStore);

router.get("/:id", getInventoryById);

router.put("/pricing/:id", updateInventoryPricing);

router.put("/quantity/:id", updateInventoryQuantity);

router.patch("/deactivate/:id", deactivateInventory);

export default router;