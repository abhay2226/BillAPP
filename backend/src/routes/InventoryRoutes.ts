import { Router } from "express";

import {
    createInventory,
    getInventory,
    getInventoryById,
    updatePricing,
    updateInventoryQuantity,
    deactivateInventory
} from "../controller/InventoryController.js";

const InventoryRouter = Router();

InventoryRouter.post(
    "/",
    createInventory
);

InventoryRouter.get(
    "/store/:storeId",
    getInventory
);

InventoryRouter.get(
    "/:id",
    getInventoryById
);

InventoryRouter.put(
    "/pricing/:id",
    updatePricing
);

InventoryRouter.put(
    "/quantity/:id",
    updateInventoryQuantity
);

InventoryRouter.patch(
    "/deactivate/:id",
    deactivateInventory
);

export default InventoryRouter;