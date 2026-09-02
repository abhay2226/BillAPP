import { Router } from "express";
import { 
    getInventory, 
    updatePricing 
} from "../controller/InventoryController.js";

const InventoryRouter = Router();

InventoryRouter.get("/store/:storeId", getInventory);
InventoryRouter.put("/pricing/:id", updatePricing);

export default InventoryRouter;
